import React, { useState } from "react";

export default function UnifiedAgriAgentFrontend() {
  // Crop
  const [location, setLocation] = useState("");
  const [soilType, setSoilType] = useState("");
  const [season, setSeason] = useState("");
  const [water, setWater] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  // Disease
  const [imageFile, setImageFile] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [loadingDetect, setLoadingDetect] = useState(false);

  // Price
  const [prediction, setPrediction] = useState(null);
  const [loadingPred, setLoadingPred] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  // Calendar
  const [calendar, setCalendar] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Crop API
  const askRecommendation = async () => {
    setLoadingRecommend(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/recommend_crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soil_type: soilType,
          water_availability: water,
          season,
        }),
      });
      const data = await res.json();
      setRecommendation(data);
    } catch {
      setRecommendation({ recommendations: [{ crop: "Tomato", score: 2 }] });
    } finally {
      setLoadingRecommend(false);
    }
  };

  // Disease API
  const sendDetect = async () => {
    if (!imageFile) return alert("Please select an image.");
    setLoadingDetect(true);
    try {
      const form = new FormData();
      form.append("file", imageFile);
      const res = await fetch("http://127.0.0.1:8000/upload_image", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      setDetectionResult(data);
    } catch {
      setDetectionResult({ diagnosis: "Early Blight", confidence: 0.84 });
    } finally {
      setLoadingDetect(false);
    }
  };

  // Price API
  const fetchPrediction = async () => {
    if (!recommendation || recommendation.recommendations.length === 0) {
      alert("Please get a crop recommendation first.");
      return;
    }
    setLoadingPred(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/predict_price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: recommendation.recommendations[0].crop }),
      });
      const data = await res.json();
      setPrediction(data);
      setShowPredictionModal(true);
    } catch {
      setPrediction({
        predicted_next_price: 30,
        predicted_yield_per_hectare: 2000,
      });
      setShowPredictionModal(true);
    } finally {
      setLoadingPred(false);
    }
  };

  // Calendar API
  const fetchCalendar = async () => {
    setLoadingCalendar(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/farmer_calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: "tomato", sowing_date: "2025-09-01" }),
      });
      const data = await res.json();
      setCalendar(data);
    } catch {
      setCalendar({ calendar: [{ date: "2025-09-15", task: "Irrigation" }] });
    } finally {
      setLoadingCalendar(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-200 via-green-300 to-sky-300 p-8">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm p-10 space-y-10 rounded-3xl shadow-2xl text-center border border-gray-100">
        {/* Header */}
        <header>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 drop-shadow-lg">
  🌱 Unified Agri Agent
            </h1>
          <p className="text-lg text-slate-700 mt-2">
            AI-powered advisory for Farmers
          </p>
        </header>

        {/* Location Input */}
        <section className="p-6 bg-white rounded-2xl shadow-md border-l-4 border-gray-500 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-600">Location</h2>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border-b-2 border-gray-300 focus:border-gray-500 outline-none transition-colors duration-200 p-2 mt-4 w-full md:w-2/3 text-center"
            placeholder="Enter location"
          />
        </section>

        {/* Crop Recommendation */}
        <section className="p-6 bg-white rounded-2xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-green-600">
            🌾 Crop Recommendation
          </h2>
          <div className="mt-4 flex flex-col md:flex-row justify-center gap-4">
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="border-b-2 border-green-300 p-2 rounded-md focus:border-green-500 outline-none"
            >
              <option value="">Select Soil</option>
              <option value="alluvial">Alluvial</option>
              <option value="loamy">Loamy</option>
              <option value="clay">Clay</option>
            </select>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="border-b-2 border-green-300 p-2 rounded-md focus:border-green-500 outline-none"
            >
              <option value="">Select Season</option>
              <option value="kharif">Kharif</option>
              <option value="rabi">Rabi</option>
              <option value="zaid">Zaid</option>
            </select>
            <select
              value={water}
              onChange={(e) => setWater(e.target.value)}
              className="border-b-2 border-green-300 p-2 rounded-md focus:border-green-500 outline-none"
            >
              <option value="">Select Water</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            onClick={askRecommendation}
            className="mt-4 px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-600 transition-colors"
          >
            Get Recommendation
          </button>
          {loadingRecommend ? (
            <p className="mt-4 animate-pulse">Working...</p>
          ) : (
            recommendation &&
            recommendation.recommendations?.map((r, i) => (
              <p key={i} className="mt-2 text-slate-700 font-medium">
                {r.crop} — score {r.score}
              </p>
            ))
          )}
        </section>

        {/* Disease Detection */}
        <section className="p-6 bg-white rounded-2xl shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-red-600">
            🐛 Pest / Disease Detection
          </h2>
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="mt-4"
          />
          <button
            onClick={sendDetect}
            className="mt-4 px-6 py-3 bg-red-500 text-white font-semibold rounded-full shadow-lg hover:bg-red-600 transition-colors"
          >
            Analyze
          </button>
          {loadingDetect ? (
            <p className="mt-4 animate-pulse">Analyzing...</p>
          ) : (
            detectionResult && (
              <p className="mt-4 text-lg text-slate-700 font-medium">
                {detectionResult.diagnosis} (
                {Math.round(detectionResult.confidence * 100)}%)
              </p>
            )
          )}
        </section>

        {/* Price Prediction */}
        <section className="p-6 bg-white rounded-2xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-purple-600">📊 Price & Yield</h2>
          <button
            onClick={fetchPrediction}
            className="mt-4 px-6 py-3 bg-purple-500 text-white font-semibold rounded-full shadow-lg hover:bg-purple-600 transition-colors"
          >
            Predict
          </button>
        </section>

        {showPredictionModal && prediction && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-gray-200">
              <h3 className="text-2xl font-bold text-purple-700">Prediction</h3>
              <p className="mt-3 text-lg font-medium text-slate-700">Price: ₹{prediction.predicted_next_price}</p>
              <p className="text-lg font-medium text-slate-700">Yield: {prediction.predicted_yield_per_hectare} kg/hectare</p>
              <button
                onClick={() => setShowPredictionModal(false)}
                className="mt-6 px-6 py-3 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Calendar */}
        <section className="p-6 bg-white rounded-2xl shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-orange-600">📅 Farmer Calendar</h2>
          <button
            onClick={fetchCalendar}
            className="mt-4 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full shadow-lg hover:bg-orange-600 transition-colors"
          >
            Load Calendar
          </button>
          {loadingCalendar ? (
            <p className="mt-4 animate-pulse">Loading...</p>
          ) : (
            calendar?.calendar?.map((c, i) => (
              <p key={i} className="mt-2 text-slate-700 font-medium">
                {c.date} — {c.task}
              </p>
            ))
          )}
        </section>
      </div>
    </div>
  );
}