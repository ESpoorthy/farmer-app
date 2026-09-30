# AgriN Connect

> Regenerative agricultural intelligence for smallholder farmers — designed as an interoperable digital public good for BRICS cooperation.

AgriN Connect converts local farm context into transparent, practical decisions. It brings together soil-health indicators, satellite-compatible vegetation signals, weather forecasts, regenerative crop recommendations, plant-disease triage, market context, and a field calendar in one farmer-facing workspace.

## Why this matters

Small and marginal farmers need timely, local guidance but often face fragmented data and climate uncertainty. AgriN Connect demonstrates a shared advisory layer where national data providers can contribute signals without giving up sovereignty, and farmers remain in control of their data.

## Track 4 alignment

| Challenge need | AgriN Connect response |
| --- | --- |
| Localised AI advisories | Explainable recommendations based on season, soil type and water constraints |
| Satellite, soil and weather intelligence | A field brief combining Sentinel-compatible NDVI, soil health, and forecast-provider-compatible signals |
| Regenerative agriculture | Crop diversity, cover crops, residue mulching and reduced-tillage actions are surfaced with each advisory |
| Crop diagnostics | Leaf-image upload with a disease-inference response contract and safe next-step guidance |
| BRICS cooperation | A portable `AgriN Connect Advisory v1` data contract, model card, consent-led sharing and provenance |
| Digital public good | Offline-capable demo signals, documented HTTP APIs, no proprietary client dependencies |

## Key features

- **Field Intelligence:** Visual field brief with vegetation health (NDVI), soil pH/carbon/moisture, and seven-day weather risk.
- **Regenerative crop advisor:** Ranks crop and intercrop options and explains their soil and climate rationale.
- **Actionable advisory:** Recommends practices such as living roots, residue mulch, and reduced disturbance.
- **Plant health triage:** Image upload endpoint with diagnosis, confidence, and a human-safe next step.
- **Transparent market and calendar views:** Shows demo price/yield context plus repeatable field tasks.
- **Cooperation by design:** Local location data remains local; only consented, aggregated indicators can be shared.

## Architecture

```text
Farmer web app (React)
        │
        ▼
AgriN Connect API (FastAPI)
        │
        ├── Soil / farmer context
        ├── Sentinel-compatible satellite signal
        ├── Forecast-provider-compatible weather signal
        └── Explainable advisory + provenance contract
                │
                ▼
       Regenerative actions / crop advice / cooperative model exchange
```

The prototype uses deterministic demo signals so it works reliably without an API key. Production adapters can replace those signals with approved local satellite catalogues, soil labs, weather agencies, and disease models while preserving the response contract.

## Run locally

Prerequisites: Python 3.10+ and Node.js 18+.

```bash
# terminal 1 — API
cd farmer-backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn backend:app --reload --port 8000

# terminal 2 — web app
cd farmer-frontend
npm ci
npm start
```

Open `http://localhost:3000`. Start in **Crops**, set soil and water conditions, then open **Field Intel** to generate the complete advisory.

## API surface

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Service health check |
| `POST /field-intelligence` | Soil, satellite, weather, regenerative advisory and provenance |
| `POST /recommend_crop` | Explainable regenerative crop/intercrop ranking |
| `POST /upload_image` | Disease diagnostic inference contract |
| `POST /predict_price` | Demo market price and yield context |
| `POST /farmer_calendar` | Regenerative field activity timeline |
| `GET /cooperation/model-card` | Inputs, outputs and governance for cross-border reuse |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the interoperability and governance model, and [docs/DEMO.md](docs/DEMO.md) for a submission walkthrough.

## Responsible-use note

The current decision rules and diagnostic response are a **demo**, not agronomic or medical authority. Production use must validate recommendations with local agronomists, use regionally appropriate models, communicate uncertainty, and obtain farmer consent before processing or sharing any data.

## Repository layout

```text
farmer-app/
├── farmer-frontend/  # React farmer experience
├── farmer-backend/   # FastAPI advisory service
└── docs/             # architecture and submission demo notes
```
