# Architecture and interoperability

## Advisory flow

1. The farmer provides location (optional), soil type, season, and water availability.
2. `POST /field-intelligence` assembles a standard advisory object with satellite, soil, weather, recommendation, and provenance fields.
3. The client renders both the signals and the reasons behind the advice; it never presents an opaque score alone.
4. The farmer can proceed to crop options, diagnostics, market context, and a field task calendar.

## Cooperation model

AgriN Connect treats cross-border collaboration as exchange of **standards and aggregated learning**, not raw farm data extraction.

- **Local sovereignty:** fine-grained field location remains on the farmer's device or national deployment.
- **Consent:** an implementation should record purpose-specific, revocable farmer consent before synchronisation.
- **Portable contract:** `AgriN Connect Advisory v1` identifies standard signal groups—`soil`, `satellite`, `weather`, `advisory`, and `provenance`.
- **Provenance:** each advisory describes signal source compatibility and whether it is demo, observed, or modelled data.
- **Federated evolution:** BRICS partners can contribute local calibration models or anonymised aggregate statistics without centralising raw farm records.

## Production integration points

The demo is deliberately adapter-ready:

| Signal | Demo source | Production replacement |
| --- | --- | --- |
| Vegetation | Deterministic NDVI | Sentinel/Landsat catalogue or national Earth-observation service |
| Soil | Farmer-selected texture and sample values | Soil lab, public soil grids, or low-cost sensor integration |
| Weather | Deterministic seven-day outlook | National meteorological services or approved forecast providers |
| Disease | Fixed response contract | Regionally validated vision model with human escalation |

## Safeguards required before deployment

- Validate recommendations with local extension partners, per crop and agro-climatic zone.
- Add authenticated, consented data storage and a farmer data export/delete path.
- Calibrate uncertainty thresholds and show local-language, low-bandwidth versions.
- Monitor for crop, geography, and language performance gaps.
