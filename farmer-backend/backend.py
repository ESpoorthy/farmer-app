"""AgriN Connect API — a portable, explainable agricultural advisory service.

The demo uses deterministic signals so it can run offline. In production, the
same response contract can be populated by national soil labs, weather
providers, and satellite catalogues shared by BRICS partners.
"""
from datetime import date, timedelta
from io import BytesIO
from pathlib import Path
from typing import Literal
import torch
import timm

import numpy as np
import onnxruntime as ort
from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, File, Form, UploadFile
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI(
    title="AgriN Connect API",
    description="Interoperable regenerative agriculture intelligence for smallholder farmers.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)


class CropRecommendPayload(BaseModel):
    soil_type: Literal["alluvial", "loamy", "clay"]
    water_availability: Literal["low", "medium", "high"]
    season: Literal["kharif", "rabi", "zaid"]
    location: str | None = Field(default=None, max_length=120)


class PricePredictPayload(BaseModel):
    crop: str


class CalendarRequest(BaseModel):
    crop: str
    sowing_date: str | None = None


class FieldIntelligenceRequest(BaseModel):
    location: str = Field(default="Demo farm", max_length=120)
    soil_type: Literal["alluvial", "loamy", "clay"] = "loamy"
    water_availability: Literal["low", "medium", "high"] = "medium"


def regenerative_actions(soil_type: str, water: str) -> list[dict]:
    actions = [
        {"action": "Keep living roots", "why": "Use a legume cover crop after harvest to protect soil carbon and fix nitrogen.", "impact": "Builds soil organic matter"},
        {"action": "Minimise disturbance", "why": "Use strip or reduced tillage where practical to retain moisture and soil structure.", "impact": "Improves water infiltration"},
    ]
    if water == "low":
        actions.insert(0, {"action": "Mulch crop residues", "why": "A 5–7 cm residue cover reduces evaporation and suppresses weeds.", "impact": "Saves irrigation water"})
    if soil_type == "clay":
        actions.append({"action": "Avoid field traffic after rain", "why": "Reducing compaction protects root channels and drainage in heavy soils.", "impact": "Protects soil structure"})
    return actions


def crop_catalogue(season: str, water: str, soil: str) -> list[dict]:
    options = {
        "kharif": {
            "low": [("Pearl Millet", 9.2, "Drought-tolerant cereal with a low water footprint"), ("Pigeon Pea", 8.7, "Nitrogen-fixing pulse suited to intercropping")],
            "medium": [("Maize + Cowpea", 9.0, "Diverse intercrop that supports soil cover"), ("Sorghum", 8.5, "Climate-resilient cereal for rainfed fields")],
            "high": [("Rice (SRI)", 8.8, "System of Rice Intensification can reduce water and seed use"), ("Maize + Cowpea", 8.6, "Diversified alternative to monocropping")],
        },
        "rabi": {
            "low": [("Chickpea", 9.1, "Nitrogen-fixing pulse with modest irrigation needs"), ("Mustard", 8.6, "Oilseed adapted to limited water")],
            "medium": [("Wheat + Chickpea", 8.9, "Rotation diversity improves nutrient cycling"), ("Barley", 8.4, "Hardy cereal with lower input needs")],
            "high": [("Wheat", 8.7, "Suitable where irrigation is reliable"), ("Barley", 8.2, "Hardy cereal with lower input needs")],
        },
        "zaid": {
            "low": [("Mung Bean", 9.0, "Short-duration nitrogen-fixing crop"), ("Sesame", 8.5, "Heat-tolerant oilseed")],
            "medium": [("Mung Bean", 9.1, "Quick pulse crop that improves rotations"), ("Fodder Cowpea", 8.6, "Adds biomass and livestock feed")],
            "high": [("Summer Mung Bean", 9.0, "Low-input pulse before the monsoon"), ("Vegetable Cowpea", 8.4, "Marketable crop that supports soil health")],
        },
    }
    soil_bonus = 0.3 if soil == "loamy" else 0.1
    return [
        {"crop": crop, "score": min(round(score + soil_bonus, 1), 10), "rationale": rationale,
         "regenerative_fit": "High" if score >= 8.8 else "Good"}
        for crop, score, rationale in options[season][water]
    ]


FRONTEND_BUILD = Path(__file__).resolve().parent.parent / "farmer-frontend" / "build"
MODEL_PATH = Path(__file__).resolve().parent / "models" / "agrismart-field-model.pt"
CLASS_NAMES = [
    "Pepper bell bacterial spot", "Pepper bell healthy", "Potato early blight",
    "Potato late blight", "Potato healthy", "Tomato bacterial spot",
    "Tomato early blight", "Tomato late blight", "Tomato leaf mold",
    "Tomato septoria leaf spot", "Tomato spider mites", "Tomato target spot",
    "Tomato yellow leaf curl virus", "Tomato mosaic virus", "Tomato healthy",
]
MODEL_VERSION = "AgriSmart DINOv2 field-image classifier (28-class)"
CROP_CLASS_INDICES = {
    "pepper": [0, 1],
    "potato": [2, 3, 4],
    "tomato": list(range(5, 15)),
}
SUPPORTED_CROPS = list(CROP_CLASS_INDICES)
# This field-photo model was selected using real-world validation images; 0.65
# retains its demonstrated tomato/potato detections while withholding weak calls.
DIAGNOSIS_CONFIDENCE_THRESHOLD = 0.65
_disease_session: tuple[torch.nn.Module, object, list[str]] | None = None


def disease_session() -> tuple[torch.nn.Module, object, list[str]]:
    """Load the validated field-photo classifier once per service process."""
    global _disease_session
    if _disease_session is None:
        if not MODEL_PATH.exists():
            raise RuntimeError("Disease model asset is missing")
        package = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
        model = timm.create_model(package["backbone"], pretrained=False, num_classes=len(package["labels"]), img_size=package["img_size"])
        model.load_state_dict(package["state_dict"])
        model.eval()
        transform = timm.data.create_transform(input_size=package["img_size"], interpolation="bicubic", mean=package["mean"], std=package["std"], crop_pct=0.9)
        _disease_session = (model, transform, package["labels"])
    return _disease_session


def classify_leaf(image_bytes: bytes, crop: str) -> dict:
    """Run crop-scoped PlantVillage inference without cross-crop diagnoses.

    The global model probability is retained as the confidence measure.  Crop
    selection only limits which class can be returned, so an out-of-domain
    image cannot gain artificial confidence merely by choosing a crop.
    """
    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError as error:
        raise HTTPException(status_code=400, detail="Upload a valid JPG, PNG, or WEBP plant image.") from error

    model, transform, labels = disease_session()
    tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        probabilities = ((model(tensor).softmax(1) + model(torch.flip(tensor, dims=[3])).softmax(1)) / 2)[0].cpu().numpy()
    crop_prefix = {"pepper": "Pepper", "potato": "Potato", "tomato": "Tomato"}[crop]
    crop_indices = [index for index, label in enumerate(labels) if label.startswith(crop_prefix)]
    best_index = max(crop_indices, key=lambda index: float(probabilities[index]))
    confidence = float(probabilities[best_index])
    diagnosis = labels[best_index]
    healthy = diagnosis.endswith("healthy")

    # Never present a low-confidence guess as a disease.  This is especially
    # important for out-of-domain field images and unsupported crop species.
    if confidence < DIAGNOSIS_CONFIDENCE_THRESHOLD:
        return {
            "diagnosis": "Uncertain — no reliable diagnosis",
            "confidence": round(confidence, 3),
            "next_step": "Retake a close, well-lit photo of one leaf, or consult a local agricultural extension officer.",
            "model_mode": f"real-model / low-confidence / {crop}",
            "crop": crop,
            "supported_crops": SUPPORTED_CROPS,
            "top_predictions": [{"label": labels[index], "confidence": round(float(probabilities[index]), 3)} for index in sorted(crop_indices, key=lambda index: float(probabilities[index]), reverse=True)[:3]],
        }

    return {
        "diagnosis": "Healthy leaf" if healthy else diagnosis.replace("___", " ").replace("_", " ").title(),
        "confidence": round(confidence, 3),
        "next_step": "No disease signal detected; continue routine monitoring." if healthy else "Isolate affected foliage and consult a local extension officer before treatment.",
        "model_mode": f"real-model / AgriSmart field model / {crop}",
        "crop": crop,
        "supported_crops": SUPPORTED_CROPS,
        "top_predictions": [{"label": labels[index], "confidence": round(float(probabilities[index]), 3)} for index in sorted(crop_indices, key=lambda index: float(probabilities[index]), reverse=True)[:3]],
    }


@app.get("/", include_in_schema=False)
def root():
    """Serve the production React app when it has been built."""
    index = FRONTEND_BUILD / "index.html"
    if index.exists():
        return FileResponse(index)
    return {"name": "AgriN Connect API", "status": "ready", "version": app.version}


@app.get("/health")
def health():
    return {"status": "healthy", "service": "agrin-connect"}


@app.post("/recommend_crop")
def recommend_crop(payload: CropRecommendPayload):
    return {
        "recommendations": crop_catalogue(payload.season, payload.water_availability, payload.soil_type),
        "explainability": [f"Season: {payload.season.title()}", f"Water: {payload.water_availability.title()}", f"Soil: {payload.soil_type.title()}"],
    }


@app.post("/field-intelligence")
def field_intelligence(payload: FieldIntelligenceRequest):
    """Return a standard, provider-agnostic advisory payload for the demo."""
    moisture = {"low": 28, "medium": 51, "high": 72}[payload.water_availability]
    organic_carbon = {"alluvial": 0.62, "loamy": 0.74, "clay": 0.58}[payload.soil_type]
    risk = "Elevated" if payload.water_availability == "low" else "Watch" if moisture < 55 else "Low"
    return {
        "field": {"location": payload.location, "data_mode": "demo / offline-ready"},
        "satellite": {"source": "Sentinel-compatible contract", "ndvi": 0.68, "trend": "+0.04 over 14 days", "observation_date": str(date.today())},
        "soil": {"texture": payload.soil_type.title(), "ph": 6.7, "organic_carbon_percent": organic_carbon, "moisture_percent": moisture},
        "weather": {"source": "Forecast-provider compatible contract", "rainfall_next_7_days_mm": 18, "max_temperature_c": 32, "risk": risk},
        "advisory": {"headline": "Scout moisture and retain ground cover before the next dry window.", "confidence": 0.81, "actions": regenerative_actions(payload.soil_type, payload.water_availability)},
        "provenance": {"standard": "AgriN Connect Advisory v1", "shareable_fields": ["soil", "satellite", "weather", "advisory"], "privacy": "Farm location is kept local; only consented, aggregated indicators are shareable."},
    }


@app.get("/cooperation/model-card")
def model_card():
    return {"name": "AgriN Connect Advisory v1", "purpose": "Interoperable, localised regenerative agriculture guidance", "inputs": ["soil health", "satellite vegetation index", "weather forecast", "farmer-provided context"], "outputs": ["crop suitability", "risk flags", "regenerative actions", "provenance"], "governance": ["farmer consent", "local data sovereignty", "aggregated cross-border model exchange"]}


@app.post("/upload_image")
async def upload_image(
    file: UploadFile | None = File(default=None),
    crop: Literal["pepper", "potato", "tomato"] = Form(...),
):
    if file is None:
        raise HTTPException(status_code=400, detail="Select a plant image before analysis.")
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Only JPG, PNG, and WEBP images are supported.")
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be 10 MB or smaller.")
    try:
        return classify_leaf(image_bytes, crop)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail="Disease model is temporarily unavailable.") from error


@app.post("/predict_price")
def predict_price(payload: PricePredictPayload):
    crop_data = {"Pearl Millet": {"price": 31, "yield": 1800}, "Pigeon Pea": {"price": 72, "yield": 1200}, "Maize + Cowpea": {"price": 29, "yield": 2600}, "Sorghum": {"price": 28, "yield": 2200}, "Rice (SRI)": {"price": 26, "yield": 3500}, "Chickpea": {"price": 62, "yield": 1600}, "Mustard": {"price": 60, "yield": 1500}, "Wheat + Chickpea": {"price": 34, "yield": 2500}, "Barley": {"price": 26, "yield": 2300}, "Wheat": {"price": 32, "yield": 2800}, "Mung Bean": {"price": 80, "yield": 1100}, "Summer Mung Bean": {"price": 79, "yield": 1100}}
    data = crop_data.get(payload.crop, {"price": 30, "yield": 2000})
    return {"crop": payload.crop, "predicted_next_price": data["price"], "predicted_yield_per_hectare": data["yield"], "mode": "demo"}


@app.post("/farmer_calendar")
def farmer_calendar(payload: CalendarRequest):
    start = date.today()
    return {"crop": payload.crop.title(), "calendar": [{"date": str(start + timedelta(days=3)), "task": "Inspect soil moisture and mulch cover"}, {"date": str(start + timedelta(days=10)), "task": "Scout field edges for pests and beneficial insects"}, {"date": str(start + timedelta(days=18)), "task": "Record crop condition and irrigation decision"}]}


if (FRONTEND_BUILD / "static").exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_BUILD / "static"), name="static")
