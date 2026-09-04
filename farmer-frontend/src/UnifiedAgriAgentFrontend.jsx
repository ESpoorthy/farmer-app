import React, { useState, useCallback } from "react";

/* ─────────────────────────────────────────────
   Helper: get time-of-day greeting
──────────────────────────────────────────────*/
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─────────────────────────────────────────────
   Helper: format date nicely
──────────────────────────────────────────────*/
function formatDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─────────────────────────────────────────────
   Helper: score colour
──────────────────────────────────────────────*/
function scoreClass(score) {
  if (score >= 9) return "badge-green";
  if (score >= 7) return "badge-amber";
  return "badge-gray";
}

/* ─────────────────────────────────────────────
   Helper: crop emoji
──────────────────────────────────────────────*/
function cropEmoji(crop = "") {
  const map = {
    Paddy: "🌾", Wheat: "🌿", Maize: "🌽", Rice: "🍚",
    Tomato: "🍅", Potato: "🥔", Mustard: "🌻", Sugarcane: "🎋",
    Barley: "🌾", Millets: "🌾",
  };
  return map[crop] ?? "🌱";
}

/* ─────────────────────────────────────────────
   Sub-component: Section Switcher (pill nav)
──────────────────────────────────────────────*/
function SectionSwitcher({ tabs, active, onChange }) {
  return (
    <div className="step-nav">
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          className={`step-btn${active === tab.id ? " active" : ""}`}
          onClick={() => onChange(tab.id)}
          aria-selected={active === tab.id}
          role="tab"
        >
          <span className="step-btn-number">{i + 1}</span>
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-component: Skeleton placeholder
──────────────────────────────────────────────*/
function SkeletonCard({ height = 80 }) {
  return (
    <div
      className="skeleton"
      style={{ height, borderRadius: "var(--radius-lg)", marginBottom: "var(--space-3)" }}
    />
  );
}

/* ─────────────────────────────────────────────
   Sub-component: Empty State
──────────────────────────────────────────────*/
function EmptyState({ icon, title, desc, action, actionLabel }) {
  return (
    <div className="empty-state animate-fadeIn">
      <span className="empty-state-icon">{icon}</span>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-desc">{desc}</p>
      {action && (
        <button className="btn btn-primary" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-component: Spinner inline
──────────────────────────────────────────────*/
function Spinner({ dark }) {
  return <span className={`spinner${dark ? " spinner-dark" : ""}`} />;
}

/* ─────────────────────────────────────────────
   SECTION 1: Dashboard / Overview
──────────────────────────────────────────────*/
function DashboardSection({ location, recommendation, detectionResult, calendar, setActiveSection }) {
  const recCount  = recommendation?.recommendations?.length ?? 0;
  const calCount  = calendar?.calendar?.length ?? 0;
  const hasDetect = !!detectionResult;

  const quickActions = [
    {
      id: "crop",
      color: "green",
      icon: "🌾",
      title: "Crop Recommendation",
      desc: "Get AI-powered crop suggestions based on your soil & season",
    },
    {
      id: "disease",
      color: "red",
      icon: "🔬",
      title: "Disease Detection",
      desc: "Upload a leaf photo to detect pests and diseases",
    },
    {
      id: "market",
      color: "purple",
      icon: "📊",
      title: "Market Insights",
      desc: "Predict crop prices and expected yield per hectare",
    },
    {
      id: "calendar",
      color: "amber",
      icon: "📅",
      title: "Farm Calendar",
      desc: "View your upcoming farming tasks and activity schedule",
    },
  ];

  return (
    <div className="animate-fadeInUp">
      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "var(--clr-primary-light)" }}>🌍</div>
          <div className="stat-card-label">Location</div>
          <div className="stat-card-value" style={{ fontSize: "var(--font-xl)" }}>
            {location || "—"}
          </div>
          <div className="stat-card-sub">{location ? "Active farm region" : "Not set yet"}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "var(--clr-primary-light)" }}>🌾</div>
          <div className="stat-card-label">Recommendations</div>
          <div className="stat-card-value">{recCount}</div>
          <div className="stat-card-sub">{recCount > 0 ? "Crop suggestions ready" : "None generated yet"}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "var(--clr-red-light)" }}>🔬</div>
          <div className="stat-card-label">Disease Scan</div>
          <div className="stat-card-value" style={{ fontSize: "var(--font-xl)" }}>
            {hasDetect ? detectionResult.diagnosis : "—"}
          </div>
          <div className="stat-card-sub">{hasDetect ? `${Math.round(detectionResult.confidence * 100)}% confidence` : "No scan done"}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "var(--clr-amber-light)" }}>📅</div>
          <div className="stat-card-label">Calendar Tasks</div>
          <div className="stat-card-value">{calCount}</div>
          <div className="stat-card-sub">{calCount > 0 ? "Upcoming tasks" : "Calendar not loaded"}</div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, hsl(142,71%,34%), hsl(158,64%,42%))",
          border: "none",
          marginBottom: "var(--space-6)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
          <div>
            <p style={{ fontSize: "var(--font-sm)", opacity: 0.8, marginBottom: "4px" }}>
              {getGreeting()}, Farmer 👋
            </p>
            <h2 style={{ fontSize: "var(--font-2xl)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "var(--space-2)" }}>
              Welcome to AgroSense
            </h2>
            <p style={{ fontSize: "var(--font-sm)", opacity: 0.85, maxWidth: 460 }}>
              Your AI-powered agricultural advisory platform. Get crop recommendations, detect plant diseases, check market prices, and manage your farm calendar — all in one place.
            </p>
          </div>
          <div style={{ fontSize: "4rem", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" }}>🌿</div>
        </div>
      </div>

      {/* Quick Actions */}
      <p style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--clr-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--space-3)" }}>
        Quick Actions
      </p>
      <div className="quick-actions">
        {quickActions.map((a) => (
          <button
            key={a.id}
            className={`quick-action-card ${a.color}`}
            onClick={() => setActiveSection(a.id)}
          >
            <div className={`quick-action-icon ${a.color}`}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="quick-action-title">{a.title}</div>
              <div className="quick-action-desc">{a.desc}</div>
            </div>
            <span className="quick-action-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION 2: Crop Recommendation
──────────────────────────────────────────────*/
function CropSection({
  location, setLocation,
  soilType, setSoilType,
  season, setSeason,
  water, setWater,
  recommendation, loadingRecommend,
  askRecommendation,
  setActiveSection,
}) {
  const [subTab, setSubTab] = useState("conditions");

  const tabs = [
    { id: "conditions", icon: "🌿", label: "Farm Conditions" },
    { id: "results",    icon: "🌾", label: "Recommendations" },
  ];

  const canSubmit = soilType && season && water;

  return (
    <div className="animate-fadeInUp">
      <div className="section-header">
        <h1 className="section-title">
          <span
            className="section-title-icon"
            style={{ background: "var(--clr-primary-light)" }}
          >🌾</span>
          Crop Recommendation
        </h1>
        <p className="section-description">
          Enter your farm conditions and get AI-powered crop suggestions ranked by suitability score.
        </p>
      </div>

      <SectionSwitcher tabs={tabs} active={subTab} onChange={setSubTab} />

      {/* Sub-tab: Farm Conditions */}
      {subTab === "conditions" && (
        <div className="card animate-fadeIn">
          <h3 style={{ fontSize: "var(--font-lg)", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--clr-text-primary)" }}>
            Tell us about your farm
          </h3>
          <p style={{ fontSize: "var(--font-sm)", color: "var(--clr-text-secondary)", marginBottom: "var(--space-6)" }}>
            Fill in your farming conditions to receive personalized crop recommendations.
          </p>

          <div className="form-grid" style={{ marginBottom: "var(--space-5)" }}>
            {/* Location */}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">
                <span className="form-label-icon">📍</span> Location
              </label>
              <input
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Punjab, Maharashtra…"
              />
              <span className="form-hint">Enter your district or state for better results</span>
            </div>

            {/* Soil Type */}
            <div className="form-group">
              <label className="form-label">
                <span className="form-label-icon">🪨</span> Soil Type
              </label>
              <div className="form-select-wrapper">
                <select
                  className="form-select"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                >
                  <option value="">Select soil type…</option>
                  <option value="alluvial">🌊 Alluvial</option>
                  <option value="loamy">🌿 Loamy</option>
                  <option value="clay">🏔 Clay</option>
                </select>
              </div>
              <span className="form-hint">Most fertile soils in India are alluvial</span>
            </div>

            {/* Season */}
            <div className="form-group">
              <label className="form-label">
                <span className="form-label-icon">🌤</span> Season
              </label>
              <div className="form-select-wrapper">
                <select
                  className="form-select"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                >
                  <option value="">Select season…</option>
                  <option value="kharif">☀️ Kharif (Jun–Nov)</option>
                  <option value="rabi">❄️ Rabi (Nov–Apr)</option>
                  <option value="zaid">🌸 Zaid (Mar–Jun)</option>
                </select>
              </div>
            </div>

            {/* Water */}
            <div className="form-group">
              <label className="form-label">
                <span className="form-label-icon">💧</span> Water Availability
              </label>
              <div className="form-select-wrapper">
                <select
                  className="form-select"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                >
                  <option value="">Select availability…</option>
                  <option value="low">🔴 Low — Rainfed / Scarce</option>
                  <option value="medium">🟡 Medium — Partial Irrigation</option>
                  <option value="high">🟢 High — Full Irrigation</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => { askRecommendation(); setSubTab("results"); }}
              disabled={loadingRecommend || !canSubmit}
            >
              {loadingRecommend ? <><Spinner /> Analyzing…</> : "🌾 Get Recommendations"}
            </button>
            {!canSubmit && (
              <span style={{ fontSize: "var(--font-xs)", color: "var(--clr-text-muted)" }}>
                Please fill all fields above
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab: Results */}
      {subTab === "results" && (
        <div className="animate-fadeIn">
          {loadingRecommend ? (
            <div className="card">
              <SkeletonCard height={72} />
              <SkeletonCard height={72} />
              <SkeletonCard height={72} />
            </div>
          ) : recommendation?.recommendations?.length > 0 ? (
            <>
              <div
                className="alert alert-success"
                style={{ marginBottom: "var(--space-4)" }}
              >
                <span>✅</span>
                <span>
                  Found <strong>{recommendation.recommendations.length}</strong> crop suggestion{recommendation.recommendations.length !== 1 ? "s" : ""} for your farm conditions.
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {recommendation.recommendations.map((r, i) => (
                  <div className="result-card card-lift" key={i} style={{ animationDelay: `${i * 60}ms` }}>
                    <div
                      className="result-card-icon"
                      style={{ background: "var(--clr-primary-light)" }}
                    >
                      {cropEmoji(r.crop)}
                    </div>
                    <div className="result-card-body">
                      <div className="result-card-title">{r.crop}</div>
                      <div className="result-card-sub">Recommended for your soil, season & water conditions</div>
                      <div className="result-card-meta">
                        <span className={`badge ${scoreClass(r.score)}`}>
                          Score: {r.score}/10
                        </span>
                        {i === 0 && <span className="badge badge-green">⭐ Best Match</span>}
                      </div>
                    </div>
                    <div>
                      <div className="progress-bar-wrap" style={{ width: 100 }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${(r.score / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "var(--space-5)", display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSubTab("conditions")}
                >
                  ← Change Conditions
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveSection("market")}
                >
                  📊 Check Market Prices →
                </button>
              </div>
            </>
          ) : (
            <div className="card">
              <EmptyState
                icon="🌱"
                title="No recommendations yet"
                desc="Fill in your farm conditions and get crop suggestions tailored to your soil, season, and water availability."
                action={() => setSubTab("conditions")}
                actionLabel="Set Farm Conditions"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION 3: Disease Detection
──────────────────────────────────────────────*/
function DiseaseSection({ imageFile, setImageFile, detectionResult, loadingDetect, sendDetect }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) setImageFile(f);
  }, [setImageFile]);

  const severityBadge = () => {
    if (!detectionResult) return null;
    const conf = detectionResult.confidence;
    if (conf >= 0.9) return <span className="badge badge-red">🔴 High Severity</span>;
    if (conf >= 0.7) return <span className="badge badge-amber">🟡 Moderate</span>;
    return <span className="badge badge-green">🟢 Low Risk</span>;
  };

  return (
    <div className="animate-fadeInUp">
      <div className="section-header">
        <h1 className="section-title">
          <span className="section-title-icon" style={{ background: "var(--clr-red-light)" }}>🔬</span>
          Pest & Disease Detection
        </h1>
        <p className="section-description">
          Upload a photo of your plant or leaf and our AI will identify any diseases or pest damage instantly.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
        {/* Upload Card */}
        <div className="card">
          <h3 style={{ fontSize: "var(--font-md)", fontWeight: 700, marginBottom: "var(--space-4)", color: "var(--clr-text-primary)" }}>
            Upload Plant Image
          </h3>

          <div
            className={`upload-zone${dragOver ? " drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            {imageFile ? (
              <>
                <span className="upload-icon">🖼</span>
                <p className="upload-title">{imageFile.name}</p>
                <p className="upload-hint" style={{ color: "var(--clr-primary)" }}>
                  {(imageFile.size / 1024).toFixed(0)} KB · Click to replace
                </p>
              </>
            ) : (
              <>
                <span className="upload-icon">📸</span>
                <p className="upload-title">Drop your image here</p>
                <p className="upload-hint">Supports JPG, PNG, WEBP · or click to browse</p>
              </>
            )}
          </div>

          <button
            className="btn btn-danger btn-full"
            style={{ marginTop: "var(--space-4)", background: "var(--clr-red)", borderRadius: "var(--radius-lg)" }}
            onClick={sendDetect}
            disabled={loadingDetect || !imageFile}
          >
            {loadingDetect ? <><Spinner /> Analyzing image…</> : "🔍 Analyze Plant"}
          </button>

          {!imageFile && (
            <p style={{ textAlign: "center", fontSize: "var(--font-xs)", color: "var(--clr-text-muted)", marginTop: "var(--space-3)" }}>
              Select or drop an image to begin
            </p>
          )}
        </div>

        {/* Result Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "var(--font-md)", fontWeight: 700, marginBottom: "var(--space-4)", color: "var(--clr-text-primary)" }}>
            Analysis Results
          </h3>

          {loadingDetect ? (
            <>
              <SkeletonCard height={60} />
              <SkeletonCard height={40} />
              <SkeletonCard height={80} />
            </>
          ) : detectionResult ? (
            <div className="animate-fadeIn" style={{ flex: 1 }}>
              <div
                className="result-card"
                style={{ marginBottom: "var(--space-4)", borderLeft: "4px solid var(--clr-red)" }}
              >
                <div
                  className="result-card-icon"
                  style={{ background: "var(--clr-red-light)", fontSize: "2rem" }}
                >
                  🦠
                </div>
                <div className="result-card-body">
                  <div className="result-card-title">{detectionResult.diagnosis}</div>
                  <div className="result-card-sub">Plant disease detected</div>
                  <div className="result-card-meta">
                    {severityBadge()}
                    <span className="badge badge-gray">
                      {Math.round(detectionResult.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--clr-text-primary)", marginBottom: "var(--space-2)" }}>
                Confidence Level
              </p>
              <div className="progress-bar-wrap" style={{ height: 10, marginBottom: "var(--space-2)" }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${detectionResult.confidence * 100}%`,
                    background: detectionResult.confidence >= 0.9
                      ? "linear-gradient(90deg, var(--clr-red), hsl(0,72%,65%))"
                      : "linear-gradient(90deg, var(--clr-amber), hsl(38,92%,65%))",
                  }}
                />
              </div>
              <p style={{ fontSize: "var(--font-xs)", color: "var(--clr-text-muted)" }}>
                {Math.round(detectionResult.confidence * 100)}% — {detectionResult.confidence >= 0.9 ? "High confidence detection" : "Moderate confidence"}
              </p>

              <div
                className="alert alert-info"
                style={{ marginTop: "var(--space-5)" }}
              >
                <span>💡</span>
                <span style={{ fontSize: "var(--font-xs)" }}>
                  Consult your local agricultural extension officer for treatment options.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <EmptyState
                icon="🔬"
                title="Awaiting analysis"
                desc="Upload a plant image on the left and click Analyze to detect diseases and pests."
              />
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: "var(--space-5)", background: "hsl(38,100%,97%)", border: "1px solid hsl(38,100%,88%)" }}>
        <p style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--clr-amber-dark)", marginBottom: "var(--space-3)" }}>
          📸 Tips for best results
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
          {[
            ["☀️", "Use good lighting"],
            ["🔍", "Focus on affected area"],
            ["📐", "Keep image clear & sharp"],
            ["🌿", "Include multiple leaves"],
          ].map(([e, t]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--font-sm)", color: "var(--clr-amber-dark)" }}>
              <span>{e}</span><span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION 4: Market Insights (Price & Yield)
──────────────────────────────────────────────*/
function MarketSection({
  recommendation, prediction, loadingPred, showPredictionModal,
  fetchPrediction, setShowPredictionModal,
}) {
  const topCrop = recommendation?.recommendations?.[0]?.crop;

  return (
    <div className="animate-fadeInUp">
      <div className="section-header">
        <h1 className="section-title">
          <span className="section-title-icon" style={{ background: "var(--clr-purple-light)" }}>📊</span>
          Market Insights
        </h1>
        <p className="section-description">
          View predicted market prices and expected yield per hectare for your recommended crop.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
        {/* Trigger Card */}
        <div className="card">
          <div
            style={{
              width: 56, height: 56, borderRadius: "var(--radius-lg)",
              background: "var(--clr-purple-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.6rem", marginBottom: "var(--space-4)",
            }}
          >
            📈
          </div>
          <h3 style={{ fontSize: "var(--font-lg)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
            Price Prediction
          </h3>

          {topCrop ? (
            <>
              <p style={{ fontSize: "var(--font-sm)", color: "var(--clr-text-secondary)", marginBottom: "var(--space-4)" }}>
                Predicting market data for your top recommended crop:
              </p>
              <div
                className="result-card"
                style={{ marginBottom: "var(--space-5)", border: "1.5px solid var(--clr-purple-light)" }}
              >
                <div
                  className="result-card-icon"
                  style={{ background: "var(--clr-purple-light)", fontSize: "1.8rem" }}
                >
                  {cropEmoji(topCrop)}
                </div>
                <div className="result-card-body">
                  <div className="result-card-title">{topCrop}</div>
                  <div className="result-card-sub">Top recommended crop</div>
                  <div className="result-card-meta">
                    <span className="badge badge-green">⭐ Best Match</span>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary btn-full"
                style={{ background: "var(--clr-purple)", boxShadow: "0 4px 16px hsla(258,70%,55%,0.25)" }}
                onClick={fetchPrediction}
                disabled={loadingPred}
              >
                {loadingPred ? <><Spinner /> Fetching prices…</> : "📊 Predict Price & Yield"}
              </button>
            </>
          ) : (
            <div>
              <p style={{ fontSize: "var(--font-sm)", color: "var(--clr-text-secondary)", marginBottom: "var(--space-5)" }}>
                You need a crop recommendation before we can predict prices.
              </p>
              <div className="alert alert-info">
                <span>💡</span>
                <span>Go to <strong>Crop Recommendation</strong> first and generate suggestions for your farm.</span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "var(--font-md)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            Market Data
          </h3>

          {loadingPred ? (
            <>
              <SkeletonCard height={80} />
              <SkeletonCard height={80} />
            </>
          ) : prediction ? (
            <div className="animate-fadeIn">
              <p style={{ fontSize: "var(--font-xs)", fontWeight: 600, color: "var(--clr-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--space-3)" }}>
                For: {prediction.crop}
              </p>
              <div className="price-grid">
                <div className="price-card">
                  <div className="price-card-label">Predicted Price</div>
                  <div className="price-card-value" style={{ color: "var(--clr-primary)" }}>
                    ₹{prediction.predicted_next_price}
                  </div>
                  <div className="price-card-unit">per kg</div>
                </div>
                <div className="price-card">
                  <div className="price-card-label">Yield Estimate</div>
                  <div className="price-card-value" style={{ color: "var(--clr-purple)" }}>
                    {prediction.predicted_yield_per_hectare}
                  </div>
                  <div className="price-card-unit">kg / hectare</div>
                </div>
              </div>

              <div className="divider" />
              <div className="alert alert-success">
                <span>✅</span>
                <span style={{ fontSize: "var(--font-xs)" }}>
                  Prediction generated successfully. Actual market prices may vary based on local conditions.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <EmptyState
                icon="📊"
                title="No prediction yet"
                desc="Get a crop recommendation and then click Predict to see market price and yield data."
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal (preserved from original) */}
      {showPredictionModal && prediction && (
        <div className="modal-backdrop" onClick={() => setShowPredictionModal(false)}>
          <div className="modal animate-fadeInUp" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPredictionModal(false)}>✕</button>
            <div
              style={{
                width: 56, height: 56, borderRadius: "var(--radius-lg)",
                background: "var(--clr-purple-light)", fontSize: "1.6rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "var(--space-4)",
              }}
            >
              📊
            </div>
            <h3 className="modal-title">Market Prediction</h3>
            <p style={{ fontSize: "var(--font-sm)", color: "var(--clr-text-secondary)", marginBottom: "var(--space-5)" }}>
              Showing forecast for <strong>{prediction.crop}</strong>
            </p>
            <div className="price-grid">
              <div className="price-card" style={{ background: "var(--clr-primary-light)" }}>
                <div className="price-card-label">Market Price</div>
                <div className="price-card-value" style={{ color: "var(--clr-primary)" }}>₹{prediction.predicted_next_price}</div>
                <div className="price-card-unit">per kg</div>
              </div>
              <div className="price-card" style={{ background: "var(--clr-purple-light)" }}>
                <div className="price-card-label">Yield</div>
                <div className="price-card-value" style={{ color: "var(--clr-purple)" }}>{prediction.predicted_yield_per_hectare}</div>
                <div className="price-card-unit">kg / hectare</div>
              </div>
            </div>
            <button
              className="btn btn-secondary btn-full"
              style={{ marginTop: "var(--space-6)" }}
              onClick={() => setShowPredictionModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION 5: Farm Calendar
──────────────────────────────────────────────*/
function CalendarSection({ calendar, loadingCalendar, fetchCalendar }) {
  const taskIcons = ["🌱", "💧", "🌿", "🔧", "🌾", "🚜", "🌤", "🪴"];

  return (
    <div className="animate-fadeInUp">
      <div className="section-header">
        <h1 className="section-title">
          <span className="section-title-icon" style={{ background: "var(--clr-amber-light)" }}>📅</span>
          Farm Calendar
        </h1>
        <p className="section-description">
          View your upcoming farm activities, irrigation schedules, and field management tasks.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--space-6)" }}>
        {/* Load Card */}
        <div className="card" style={{ height: "fit-content" }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: "var(--radius-lg)",
              background: "var(--clr-amber-light)", fontSize: "1.6rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "var(--space-4)",
            }}
          >
            🗓
          </div>
          <h3 style={{ fontSize: "var(--font-md)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
            Load Schedule
          </h3>
          <p style={{ fontSize: "var(--font-sm)", color: "var(--clr-text-secondary)", marginBottom: "var(--space-5)" }}>
            Fetch the recommended farming task timeline for your current crop.
          </p>

          <button
            className="btn btn-full"
            style={{
              background: "var(--clr-amber)",
              color: "white",
              boxShadow: "0 4px 16px hsla(38,92%,50%,0.3)",
              borderRadius: "var(--radius-lg)",
              fontWeight: 600,
              padding: "var(--space-3) var(--space-5)",
            }}
            onClick={fetchCalendar}
            disabled={loadingCalendar}
          >
            {loadingCalendar ? <><Spinner /> Loading…</> : "📅 Load Calendar"}
          </button>

          {calendar && (
            <div className="alert alert-success" style={{ marginTop: "var(--space-4)" }}>
              <span>✅</span>
              <span style={{ fontSize: "var(--font-xs)" }}>
                {calendar.calendar?.length} tasks loaded for <strong>{calendar.crop}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card">
          <h3 style={{ fontSize: "var(--font-md)", fontWeight: 700, marginBottom: "var(--space-5)" }}>
            Upcoming Tasks
          </h3>

          {loadingCalendar ? (
            <>
              <SkeletonCard height={60} />
              <SkeletonCard height={60} />
              <SkeletonCard height={60} />
            </>
          ) : calendar?.calendar?.length > 0 ? (
            <div className="timeline animate-fadeIn">
              {calendar.calendar.map((item, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot">
                    {taskIcons[i % taskIcons.length]}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="timeline-task">{item.task}</div>
                  </div>
                  <span className="badge badge-amber">Upcoming</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📅"
              title="No tasks scheduled"
              desc="Click 'Load Calendar' to fetch your farming activity schedule and task timeline."
              action={fetchCalendar}
              actionLabel="Load Calendar"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP COMPONENT
──────────────────────────────────────────────*/
export default function UnifiedAgriAgentFrontend() {
  /* ── All existing state (preserved exactly) ── */
  const [location, setLocation]           = useState("");
  const [soilType, setSoilType]           = useState("");
  const [season, setSeason]               = useState("");
  const [water, setWater]                 = useState("");
  const [recommendation, setRecommendation]   = useState(null);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  const [imageFile, setImageFile]         = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [loadingDetect, setLoadingDetect] = useState(false);

  const [prediction, setPrediction]       = useState(null);
  const [loadingPred, setLoadingPred]     = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  const [calendar, setCalendar]           = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  /* ── Navigation state (new) ── */
  const [activeSection, setActiveSection] = useState("dashboard");

  /* ── All existing API functions (preserved exactly) ── */
  const askRecommendation = async () => {
    setLoadingRecommend(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/recommend_crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soil_type: soilType, water_availability: water, season }),
      });
      const data = await res.json();
      setRecommendation(data);
    } catch {
      setRecommendation({ recommendations: [{ crop: "Tomato", score: 2 }] });
    } finally {
      setLoadingRecommend(false);
    }
  };

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
      setPrediction({ predicted_next_price: 30, predicted_yield_per_hectare: 2000 });
      setShowPredictionModal(true);
    } finally {
      setLoadingPred(false);
    }
  };

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

  /* ── Nav config ── */
  const navItems = [
    { id: "dashboard", icon: "🏡", label: "Overview" },
    { id: "crop",      icon: "🌾", label: "Crops" },
    { id: "disease",   icon: "🔬", label: "Disease" },
    { id: "market",    icon: "📊", label: "Market" },
    { id: "calendar",  icon: "📅", label: "Calendar" },
  ];

  /* ── Greeting ── */
  const farmerInitial = location ? location.trim()[0].toUpperCase() : "F";

  /* ── Section renderer ── */
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardSection
            location={location}
            recommendation={recommendation}
            detectionResult={detectionResult}
            calendar={calendar}
            setActiveSection={setActiveSection}
          />
        );
      case "crop":
        return (
          <CropSection
            location={location} setLocation={setLocation}
            soilType={soilType} setSoilType={setSoilType}
            season={season} setSeason={setSeason}
            water={water} setWater={setWater}
            recommendation={recommendation}
            loadingRecommend={loadingRecommend}
            askRecommendation={askRecommendation}
            setActiveSection={setActiveSection}
          />
        );
      case "disease":
        return (
          <DiseaseSection
            imageFile={imageFile} setImageFile={setImageFile}
            detectionResult={detectionResult}
            loadingDetect={loadingDetect}
            sendDetect={sendDetect}
          />
        );
      case "market":
        return (
          <MarketSection
            recommendation={recommendation}
            prediction={prediction}
            loadingPred={loadingPred}
            showPredictionModal={showPredictionModal}
            fetchPrediction={fetchPrediction}
            setShowPredictionModal={setShowPredictionModal}
          />
        );
      case "calendar":
        return (
          <CalendarSection
            calendar={calendar}
            loadingCalendar={loadingCalendar}
            fetchCalendar={fetchCalendar}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">AgroSense</span>
            <span className="sidebar-logo-tagline">Smart Farming Platform</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          <span className="sidebar-section-label">Navigation</span>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeSection === item.id ? " active" : ""}`}
              onClick={() => setActiveSection(item.id)}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-text">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div
            className="sidebar-location-badge"
            onClick={() => setActiveSection("crop")}
            title="Click to set location"
          >
            <span className="sidebar-location-dot" />
            <span className="sidebar-location-text">
              {location || "Set your location…"}
            </span>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
        <div className="mobile-nav-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`mobile-nav-item${activeSection === item.id ? " active" : ""}`}
              onClick={() => setActiveSection(item.id)}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-greeting">
              {getGreeting()}, {location ? location : "Farmer"} 👋
            </span>
            <span className="topbar-subtitle">
              Here's what's happening on your farm today.
            </span>
          </div>
          <div className="topbar-right">
            <span className="topbar-date">{formatDate()}</span>
            <div className="avatar" title="Farmer profile">
              {farmerInitial}
            </div>
          </div>
        </header>

        {/* Section content */}
        <div className="page-content">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}