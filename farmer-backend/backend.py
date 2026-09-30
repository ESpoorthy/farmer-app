"""AgriN Connect API — a portable, explainable agricultural advisory service.

The demo uses deterministic signals so it can run offline. In production, the
same response contract can be populated by national soil labs, weather
providers, and satellite catalogues shared by BRICS partners.
"""
from datetime import date, timedelta
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, UploadFile
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
async def upload_image(file: UploadFile | None = File(default=None)):
    return {"diagnosis": "Early Leaf Blight", "confidence": 0.84, "next_step": "Isolate affected foliage and consult a local extension officer before treatment.", "model_mode": "demo", "image_received": file is not None}


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
