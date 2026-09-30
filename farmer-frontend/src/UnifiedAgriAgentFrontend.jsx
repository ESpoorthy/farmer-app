import React, { useState, useCallback } from "react";

// Hosted builds use same-origin API routes; local development keeps its API explicit.
const API_BASE = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:8000"
);

const PROFILES = [
  { id: "farmer", name: "Farmer", role: "Primary farm profile", initial: "F", accent: "#1f9d55" },
  { id: "aisha", name: "Aisha Patel", role: "Family farm profile", initial: "A", accent: "#7c3aed" },
  { id: "cooperative", name: "Green Roots Co-op", role: "Cooperative view", initial: "G", accent: "#0f766e" },
];

const DEFAULT_COPY = { overview: "Overview", field: "Field Intel", crops: "Crops", disease: "Disease", market: "Market", calendar: "Calendar", navigation: "Navigation", resilience: "Local intelligence, built for shared climate resilience.", settings: "Settings", appearance: "Appearance", language: "Dashboard language", profile: "Profile", light: "Day mode", dark: "Dark mode", manage: "Profile & preferences" };

// India-facing language support: every Eighth Schedule language is selectable.
// Untranslated page-specific advisory content remains in the source language, while
// the app chrome, navigation and preferences always switch to the chosen language.
const INDIAN_LANGUAGES = [
  ["as", "অসমীয়া", { overview: "অৱলোকন", field: "ক্ষেত্ৰ তথ্য", crops: "শস্য", disease: "ৰোগ", market: "বজাৰ", calendar: "কেলেণ্ডাৰ", navigation: "নেভিগেচন", settings: "ছেটিংছ", language: "ডেছব'ৰ্ড ভাষা", profile: "প্ৰ'ফাইল", light: "দিনৰ মোড", dark: "ডাৰ্ক মোড" }],
  ["bn", "বাংলা", { overview: "সংক্ষিপ্ত বিবরণ", field: "ক্ষেত্র তথ্য", crops: "ফসল", disease: "রোগ", market: "বাজার", calendar: "ক্যালেন্ডার", navigation: "নেভিগেশন", settings: "সেটিংস", language: "ড্যাশবোর্ডের ভাষা", profile: "প্রোফাইল", light: "দিনের মোড", dark: "ডার্ক মোড" }],
  ["brx", "बड़ो", { overview: "निरीक्षण", field: "पाथार मोजां", crops: "फसल", disease: "रोग", market: "बाजार", calendar: "केलेण्डार", navigation: "नेभिगेसन", settings: "सेटिंस", language: "डेसबर्ड राव", profile: "प्रफाइल", light: "सानि मड", dark: "गोसोम मड" }],
  ["doi", "डोगरी", { overview: "झलक", field: "खेत्तर जानकारी", crops: "फसलां", disease: "बमारी", market: "बजार", calendar: "कैलेंडर", navigation: "नेविगेशन", settings: "सैटिंगां", language: "डैशबोर्ड भाशा", profile: "प्रोफाइल", light: "दिन मोड", dark: "डार्क मोड" }],
  ["gu", "ગુજરાતી", { overview: "ઝાંખી", field: "ક્ષેત્ર માહિતી", crops: "પાક", disease: "રોગ", market: "બજાર", calendar: "કૅલેન્ડર", navigation: "નેવિગેશન", settings: "સેટિંગ્સ", language: "ડેશબોર્ડ ભાષા", profile: "પ્રોફાઇલ", light: "દિવસ મોડ", dark: "ડાર્ક મોડ" }],
  ["hi", "हिन्दी", { overview: "अवलोकन", field: "फील्ड इंटेल", crops: "फसलें", disease: "रोग", market: "बाज़ार", calendar: "कैलेंडर", navigation: "नेविगेशन", resilience: "साझा जलवायु लचीलेपन के लिए स्थानीय बुद्धिमत्ता।", settings: "सेटिंग्स", appearance: "रूप", language: "डैशबोर्ड भाषा", profile: "प्रोफ़ाइल", light: "डे मोड", dark: "डार्क मोड", manage: "प्रोफ़ाइल और प्राथमिकताएँ" }],
  ["kn", "ಕನ್ನಡ", { overview: "ಅವಲೋಕನ", field: "ಕ್ಷೇತ್ರ ಮಾಹಿತಿ", crops: "ಬೆಳೆಗಳು", disease: "ರೋಗ", market: "ಮಾರುಕಟ್ಟೆ", calendar: "ಕ್ಯಾಲೆಂಡರ್", navigation: "ನ್ಯಾವಿಗೇಶನ್", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", language: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಭಾಷೆ", profile: "ಪ್ರೊಫೈಲ್", light: "ಹಗಲು ಮೋಡ್", dark: "ಡಾರ್ಕ್ ಮೋಡ್" }],
  ["ks", "कॉशुर", { overview: "جائزہ", field: "کھیت معلومات", crops: "فصل", disease: "بیماری", market: "بازار", calendar: "کیلنڈر", navigation: "نیویگیشن", settings: "ترتیبات", language: "ڈیش بورڈ زبان", profile: "پروفائل", light: "دن موڈ", dark: "ڈارک موڈ" }],
  ["kok", "कोंकणी", { overview: "आढावो", field: "शेत माहिती", crops: "पिकां", disease: "रोग", market: "बजार", calendar: "कॅलेंडर", navigation: "नेव्हिगेशन", settings: "सेटिंगां", language: "डॅशबोर्ड भास", profile: "प्रोफायल", light: "दीस मोड", dark: "डार्क मोड" }],
  ["mai", "मैथिली", { overview: "अवलोकन", field: "खेत जानकारी", crops: "फसल", disease: "रोग", market: "बजार", calendar: "कैलेंडर", navigation: "नेविगेशन", settings: "सेटिंग्स", language: "डैशबोर्ड भाषा", profile: "प्रोफाइल", light: "दिन मोड", dark: "डार्क मोड" }],
  ["ml", "മലയാളം", { overview: "അവലോകനം", field: "വയൽ വിവരം", crops: "വിളകൾ", disease: "രോഗം", market: "വിപണി", calendar: "കലണ്ടർ", navigation: "നാവിഗേഷൻ", settings: "ക്രമീകരണങ്ങൾ", language: "ഡാഷ്ബോർഡ് ഭാഷ", profile: "പ്രൊഫൈൽ", light: "ഡേ മോഡ്", dark: "ഡാർക്ക് മോഡ്" }],
  ["mni", "ꯃꯤꯇꯩꯂꯣꯟ", { overview: "ꯋꯥꯔꯣꯜ", field: "ꯂꯝ ꯃꯔꯣꯜ", crops: "ꯃꯔꯣꯏ", disease: "ꯂꯥꯏꯅꯤꯡ", market: "ꯀꯦꯏꯁꯝ", calendar: "ꯀꯦꯂꯦꯟꯗꯔ", navigation: "ꯂꯝꯆꯠ", settings: "ꯁꯦꯇꯤꯡꯁ", language: "ꯗꯦꯁꯕꯣꯔꯗ ꯂꯣꯜ", profile: "ꯄ꯭ꯔꯣꯐꯥꯏꯜ", light: "ꯅꯨꯡꯁꯤ ꯃꯣꯗ", dark: "ꯗꯥꯔꯛ ꯃꯣꯗ" }],
  ["mr", "मराठी", { overview: "आढावा", field: "शेत माहिती", crops: "पिके", disease: "रोग", market: "बाजार", calendar: "दिनदर्शिका", navigation: "नेव्हिगेशन", settings: "सेटिंग्ज", language: "डॅशबोर्ड भाषा", profile: "प्रोफाइल", light: "डे मोड", dark: "डार्क मोड" }],
  ["ne", "नेपाली", { overview: "सिंहावलोकन", field: "खेत जानकारी", crops: "बाली", disease: "रोग", market: "बजार", calendar: "पात्रो", navigation: "नेभिगेसन", settings: "सेटिङहरू", language: "ड्यासबोर्ड भाषा", profile: "प्रोफाइल", light: "दिन मोड", dark: "डार्क मोड" }],
  ["or", "ଓଡ଼ିଆ", { overview: "ସମୀକ୍ଷା", field: "କ୍ଷେତ୍ର ସୂଚନା", crops: "ଫସଲ", disease: "ରୋଗ", market: "ବଜାର", calendar: "କ୍ୟାଲେଣ୍ଡର", navigation: "ନାଭିଗେସନ", settings: "ସେଟିଂସ", language: "ଡ୍ୟାସବୋର୍ଡ ଭାଷା", profile: "ପ୍ରୋଫାଇଲ", light: "ଦିନ ମୋଡ", dark: "ଡାର୍କ ମୋଡ" }],
  ["pa", "ਪੰਜਾਬੀ", { overview: "ਸੰਖੇਪ", field: "ਖੇਤ ਜਾਣਕਾਰੀ", crops: "ਫਸਲਾਂ", disease: "ਬਿਮਾਰੀ", market: "ਬਾਜ਼ਾਰ", calendar: "ਕੈਲੰਡਰ", navigation: "ਨੇਵੀਗੇਸ਼ਨ", settings: "ਸੈਟਿੰਗਾਂ", language: "ਡੈਸ਼ਬੋਰਡ ਭਾਸ਼ਾ", profile: "ਪ੍ਰੋਫਾਈਲ", light: "ਦਿਨ ਮੋਡ", dark: "ਡਾਰਕ ਮੋਡ" }],
  ["sa", "संस्कृतम्", { overview: "अवलोकनम्", field: "क्षेत्रसूचना", crops: "सस्यानि", disease: "रोगः", market: "विपणिः", calendar: "दिनदर्शिका", navigation: "मार्गदर्शनम्", settings: "विन्यासाः", language: "डैशबोर्डभाषा", profile: "परिचयः", light: "दिनविधिः", dark: "तमोविधिः" }],
  ["sat", "ᱥᱟᱱᱛᱟᱲᱤ", { overview: "ᱧᱩᱲᱩᱜ", field: "ᱯᱷᱟᱨᱤᱡ ᱛᱟᱛᱟ", crops: "ᱪᱟᱥ", disease: "ᱨᱳᱜ", market: "ᱦᱟᱴ", calendar: "ᱠᱮᱞᱮᱱᱰᱟᱨ", navigation: "ᱧᱮᱞ ᱦᱚᱨ", settings: "ᱥᱮᱴᱤᱝᱥ", language: "ᱰᱮᱥᱵᱳᱨᱰ ᱯᱟᱹᱨᱥᱤ", profile: "ᱯᱨᱚᱯᱷᱟᱭᱤᱞ", light: "ᱢᱟᱨᱥᱟᱞ ᱢᱳᱰ", dark: "ᱫᱷᱤᱨᱤ ᱢᱳᱰ" }],
  ["sd", "سنڌي", { overview: "جائزو", field: "زمين ڄاڻ", crops: "فصل", disease: "بيماري", market: "بازار", calendar: "ڪئلينڊر", navigation: "نيويگيشن", settings: "سيٽنگون", language: "ڊيش بورڊ ٻولي", profile: "پروفائل", light: "ڏينهن موڊ", dark: "ڊارڪ موڊ" }],
  ["ta", "தமிழ்", { overview: "கண்ணோட்டம்", field: "வயல் தகவல்", crops: "பயிர்கள்", disease: "நோய்", market: "சந்தை", calendar: "நாட்காட்டி", navigation: "வழிசெலுத்தல்", settings: "அமைப்புகள்", language: "டாஷ்போர்டு மொழி", profile: "சுயவிவரம்", light: "பகல் முறை", dark: "இருண்ட முறை" }],
  ["te", "తెలుగు", { overview: "అవలోకనం", field: "క్షేత్ర సమాచారం", crops: "పంటలు", disease: "వ్యాధి", market: "మార్కెట్", calendar: "క్యాలెండర్", navigation: "నావిగేషన్", settings: "సెట్టింగ్‌లు", language: "డాష్‌బోర్డ్ భాష", profile: "ప్రొఫైల్", light: "పగటి మోడ్", dark: "డార్క్ మోడ్" }],
  ["ur", "اردو", { overview: "جائزہ", field: "کھیت معلومات", crops: "فصلیں", disease: "بیماری", market: "بازار", calendar: "کیلنڈر", navigation: "نیویگیشن", settings: "ترتیبات", language: "ڈیش بورڈ زبان", profile: "پروفائل", light: "دن موڈ", dark: "ڈارک موڈ" }],
];

const COPY = {
  en: DEFAULT_COPY,
  pt: { ...DEFAULT_COPY, overview: "Visão geral", field: "Inteligência de campo", crops: "Culturas", disease: "Doenças", market: "Mercado", calendar: "Calendário", navigation: "Navegação", resilience: "Inteligência local para resiliência climática compartilhada.", settings: "Configurações", appearance: "Aparência", language: "Idioma do painel", profile: "Perfil", light: "Modo claro", dark: "Modo escuro", manage: "Perfil e preferências" },
  ...Object.fromEntries(INDIAN_LANGUAGES.map(([code, _name, copy]) => [code, { ...DEFAULT_COPY, ...copy }])),
};

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
      id: "intelligence",
      color: "blue",
      icon: "🛰️",
      title: "Field Intelligence",
      desc: "Combine soil, weather and satellite signals into practical actions",
    },
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
              Welcome to AgriN Connect
            </h2>
            <p style={{ fontSize: "var(--font-sm)", opacity: 0.85, maxWidth: 460 }}>
              Regenerative, explainable farm intelligence for smallholders — built for cooperation across BRICS nations.
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
                      <div className="result-card-sub">{r.rationale || "Recommended for your soil, season & water conditions"}</div>
                      <div className="result-card-meta">
                        <span className={`badge ${scoreClass(r.score)}`}>
                          Score: {r.score}/10
                        </span>
                        {i === 0 && <span className="badge badge-green">⭐ Best Match</span>}
                        {r.regenerative_fit && <span className="badge badge-green">🌱 {r.regenerative_fit} regenerative fit</span>}
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
   SECTION 6: Field Intelligence & Cooperation
──────────────────────────────────────────────*/
function FieldIntelligenceSection({ location, soilType, water, intelligence, loading, loadIntelligence }) {
  const payload = intelligence;
  const inputReady = soilType && water;
  return (
    <div className="animate-fadeInUp">
      <div className="section-header">
        <h1 className="section-title">
          <span className="section-title-icon" style={{ background: "var(--clr-blue-light)" }}>🛰️</span>
          Field Intelligence
        </h1>
        <p className="section-description">
          An explainable advisory layer that joins farm observations with satellite-compatible vegetation signals, soil health and forecast data.
        </p>
      </div>

      <div className="intelligence-hero card">
        <div>
          <span className="eyebrow">AGRIN CONNECT • ADVISORY V1</span>
          <h2>Turn shared data into locally useful, regenerative action.</h2>
          <p>Signals are demo data in this prototype, but the contract is ready for national providers and consented cross-border model exchange.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={loadIntelligence} disabled={loading || !inputReady}>
          {loading ? <><Spinner /> Reading signals…</> : "✨ Generate field brief"}
        </button>
      </div>
      {!inputReady && <div className="alert alert-info" style={{ marginBottom: "var(--space-5)" }}>💡 Set soil type and water availability in <strong>Crops</strong> before generating a field brief.</div>}

      {loading ? (
        <div className="signal-grid"><SkeletonCard height={170} /><SkeletonCard height={170} /><SkeletonCard height={170} /></div>
      ) : payload ? (
        <div className="animate-fadeIn">
          <div className="signal-grid">
            <article className="signal-card satellite"><span>🛰️</span><p>Vegetation health</p><strong>NDVI {payload.satellite.ndvi}</strong><small>{payload.satellite.trend} · {payload.satellite.source}</small></article>
            <article className="signal-card soil"><span>🪨</span><p>Soil health</p><strong>pH {payload.soil.ph} · {payload.soil.moisture_percent}%</strong><small>{payload.soil.organic_carbon_percent}% organic carbon · {payload.soil.texture}</small></article>
            <article className="signal-card weather"><span>🌦️</span><p>7-day outlook</p><strong>{payload.weather.rainfall_next_7_days_mm} mm rain · {payload.weather.max_temperature_c}°C</strong><small>Water risk: {payload.weather.risk} · forecast-compatible</small></article>
          </div>

          <div className="advisory-grid">
            <div className="card advisory-card">
              <span className="eyebrow">EXPLAINABLE ADVISORY · {Math.round(payload.advisory.confidence * 100)}% CONFIDENCE</span>
              <h2>{payload.advisory.headline}</h2>
              <div className="action-list">
                {payload.advisory.actions.map((item) => <div className="action-item" key={item.action}><span>🌱</span><div><strong>{item.action}</strong><p>{item.why}</p><small>{item.impact}</small></div></div>)}
              </div>
            </div>
            <div className="card cooperation-card">
              <span className="eyebrow">BRICS COOPERATION BY DESIGN</span>
              <h3>Portable, consent-led data exchange</h3>
              <p>Farm location stays local. Partners can share only consented, aggregated indicators and reusable advisory models.</p>
              <div className="cooperation-tags"><span>Farmer consent</span><span>Local sovereignty</span><span>Open contract</span><span>Model provenance</span></div>
              <small>Standard: {payload.provenance.standard}</small>
            </div>
          </div>
        </div>
      ) : (
        <div className="card"><EmptyState icon="🛰️" title="Your field brief is ready to generate" desc="Use the farm conditions already entered in the crop advisor to create an explainable regenerative advisory." action={loadIntelligence} actionLabel="Generate field brief" /></div>
      )}
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
  const [intelligence, setIntelligence]   = useState(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);
  const [theme, setTheme]                 = useState("light");
  const [language, setLanguage]           = useState("en");
  const [profileId, setProfileId]         = useState("farmer");
  const [settingsOpen, setSettingsOpen]   = useState(false);

  /* ── Navigation state (new) ── */
  const [activeSection, setActiveSection] = useState("dashboard");

  /* ── All existing API functions (preserved exactly) ── */
  const askRecommendation = async () => {
    setLoadingRecommend(true);
    try {
      const res = await fetch(`${API_BASE}/recommend_crop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soil_type: soilType, water_availability: water, season, location }),
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
      const res = await fetch(`${API_BASE}/upload_image`, {
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
      const res = await fetch(`${API_BASE}/predict_price`, {
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
      const res = await fetch(`${API_BASE}/farmer_calendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: "cover crop", sowing_date: new Date().toISOString().slice(0, 10) }),
      });
      const data = await res.json();
      setCalendar(data);
    } catch {
      setCalendar({ crop: "Cover crop", calendar: [{ date: new Date().toISOString().slice(0, 10), task: "Inspect soil moisture and mulch cover" }] });
    } finally {
      setLoadingCalendar(false);
    }
  };

  const loadIntelligence = async () => {
    if (!soilType || !water) return setActiveSection("crop");
    setLoadingIntelligence(true);
    try {
      const res = await fetch(`${API_BASE}/field-intelligence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: location || "Demo farm", soil_type: soilType, water_availability: water }),
      });
      if (!res.ok) throw new Error("Field intelligence unavailable");
      setIntelligence(await res.json());
    } catch {
      setIntelligence({
        satellite: { ndvi: 0.68, trend: "+0.04 over 14 days", source: "Sentinel-compatible contract" },
        soil: { ph: 6.7, moisture_percent: water === "low" ? 28 : 51, organic_carbon_percent: 0.74, texture: soilType },
        weather: { rainfall_next_7_days_mm: 18, max_temperature_c: 32, risk: water === "low" ? "Elevated" : "Watch" },
        advisory: { headline: "Scout moisture and retain ground cover before the next dry window.", confidence: 0.81, actions: [{ action: "Keep living roots", why: "Use a legume cover crop after harvest to protect soil carbon and fix nitrogen.", impact: "Builds soil organic matter" }, { action: "Minimise disturbance", why: "Use reduced tillage where practical to retain moisture and soil structure.", impact: "Improves water infiltration" }] },
        provenance: { standard: "AgriN Connect Advisory v1" },
      });
    } finally {
      setLoadingIntelligence(false);
    }
  };

  /* ── Nav config ── */
  const t = COPY[language];
  const profile = PROFILES.find((item) => item.id === profileId) || PROFILES[0];
  const navItems = [
    { id: "dashboard", icon: "⌂", label: t.overview, tone: "green" },
    { id: "intelligence", icon: "◈", label: t.field, tone: "blue" },
    { id: "crop",      icon: "✦", label: t.crops, tone: "gold" },
    { id: "disease",   icon: "✚", label: t.disease, tone: "red" },
    { id: "market",    icon: "↗", label: t.market, tone: "purple" },
    { id: "calendar",  icon: "▣", label: t.calendar, tone: "orange" },
  ];

  /* ── Greeting ── */
  const farmerInitial = profile.initial;

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
      case "intelligence":
        return <FieldIntelligenceSection location={location} soilType={soilType} water={water} intelligence={intelligence} loading={loadingIntelligence} loadIntelligence={loadIntelligence} />;
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
    <div className={`app-shell ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">AgriN Connect</span>
            <span className="sidebar-logo-tagline">Regenerative intelligence</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          <span className="sidebar-section-label">{t.navigation}</span>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeSection === item.id ? " active" : ""}`}
              onClick={() => setActiveSection(item.id)}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              <span className={`nav-item-icon ${item.tone}`}>{item.icon}</span>
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
              {getGreeting()}, {location ? location : profile.name} 👋
            </span>
            <span className="topbar-subtitle">
              {t.resilience}
            </span>
          </div>
          <div className="topbar-right">
            <button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")} title={theme === "light" ? t.dark : t.light} aria-label={theme === "light" ? t.dark : t.light}>
              {theme === "light" ? "☾" : "☀"}
            </button>
            <span className="topbar-date">{formatDate()}</span>
            <button className="avatar" title={t.manage} onClick={() => setSettingsOpen(!settingsOpen)} style={{ background: `linear-gradient(135deg, ${profile.accent}, hsl(158, 64%, 45%))` }}>
              {farmerInitial}
            </button>
            {settingsOpen && (
              <div className="settings-popover" role="dialog" aria-label={t.settings}>
                <div className="settings-heading"><span>⚙</span><div><strong>{t.settings}</strong><small>{t.manage}</small></div></div>
                <label className="settings-label">{t.profile}</label>
                <div className="profile-list">
                  {PROFILES.map((item) => <button key={item.id} className={`profile-option${profileId === item.id ? " selected" : ""}`} onClick={() => setProfileId(item.id)}><span style={{ background: item.accent }}>{item.initial}</span><div><strong>{item.name}</strong><small>{item.role}</small></div>{profileId === item.id && <b>✓</b>}</button>)}
                </div>
                <label className="settings-label" htmlFor="dashboard-language">{t.language}</label>
                <select id="dashboard-language" className="settings-select" value={language} onChange={(event) => setLanguage(event.target.value)}>
                  <option value="en">English</option>
                  <optgroup label="Indian languages">
                    {INDIAN_LANGUAGES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                  </optgroup>
                  <optgroup label="BRICS languages">
                    <option value="pt">Português</option>
                  </optgroup>
                </select>
                <div className="appearance-row"><span>{t.appearance}</span><button className="appearance-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}><span className={theme === "light" ? "selected" : ""}>☀ {t.light}</span><span className={theme === "dark" ? "selected" : ""}>☾ {t.dark}</span></button></div>
              </div>
            )}
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
