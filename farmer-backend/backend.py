from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# --- FastAPI App ---
app = FastAPI(
    title="Farmer Advisory MVP Backend",
    version="0.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Models ---
class CropRecommendPayload(BaseModel):
    soil_type: str
    water_availability: str
    season: str


class PricePredictPayload(BaseModel):
    crop: str


class CalendarRequest(BaseModel):
    crop: str
    sowing_date: str


# --- Routes ---
@app.get("/")
def root():
    return {"message": "Farmer Advisory Backend is running!"}


@app.post("/recommend_crop")
def recommend_crop(payload: CropRecommendPayload):
    # Dummy data based on user inputs
    crops = []

    if payload.season == "kharif":
        if payload.water_availability == "high":
            crops.append({"crop": "Paddy", "score": 10})
        if payload.water_availability == "medium":
            crops.append({"crop": "Maize", "score": 8})
        if payload.water_availability == "low":
            crops.append({"crop": "Millets", "score": 7})

    if payload.season == "rabi":
        if payload.water_availability == "high":
            crops.append({"crop": "Wheat", "score": 9})
        if payload.water_availability == "medium":
            crops.append({"crop": "Barley", "score": 7})
        if payload.water_availability == "low":
            crops.append({"crop": "Mustard", "score": 6})

    if payload.soil_type == "alluvial":
        crops.append({"crop": "Paddy", "score": 9.5})
        crops.append({"crop": "Sugarcane", "score": 8.5})

    if payload.soil_type == "loamy":
        crops.append({"crop": "Tomato", "score": 8})
        crops.append({"crop": "Potato", "score": 7.5})

    unique_crops = {}
    for c in crops:
        if c['crop'] not in unique_crops or c['score'] > unique_crops[c['crop']]['score']:
            unique_crops[c['crop']] = c

    if not unique_crops:
        return {"recommendations": [{"crop": "No specific recommendation found", "score": 0}]}

    return {"recommendations": list(unique_crops.values())}


@app.post("/upload_image")
def upload_image():
    # Dummy detection, as image processing requires libraries
    return {"diagnosis": "Leaf Blight", "confidence": 0.92}


@app.post("/predict_price")
def predict_price(payload: PricePredictPayload):
    # Dummy price prediction based on the recommended crop
    crop_data = {
        "Paddy": {"price": 25, "yield": 3000},
        "Maize": {"price": 28, "yield": 2800},
        "Wheat": {"price": 32, "yield": 2800},
        "Mustard": {"price": 60, "yield": 1500},
        "Tomato": {"price": 45, "yield": 2500},
        "No specific recommendation found": {"price": "N/A", "yield": "N/A"},
    }

    data = crop_data.get(payload.crop, {"price": "N/A", "yield": "N/A"})

    return {
        "crop": payload.crop,
        "predicted_next_price": data["price"],
        "predicted_yield_per_hectare": data["yield"]
    }


@app.post("/farmer_calendar")
def farmer_calendar(payload: CalendarRequest):
    return {
        "crop": payload.crop,
        "calendar": [
            {"date": "2025-09-15", "task": "First irrigation"},
            {"date": "2025-09-22", "task": "Weeding and soil loosening"},
        ]
    }


# --- Run server ---
if __name__ == "__main__":
    uvicorn.run("backend:app", host="127.0.0.1", port=8000, reload=True)