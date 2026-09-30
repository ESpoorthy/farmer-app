# AgriN Connect Advisory v1

## Purpose

`AgriN Connect Advisory v1` is a provider-neutral response shape for moving a farm advisory between interfaces and data providers while preserving context and provenance.

## Implemented field groups

| Group | Example content |
| --- | --- |
| `field` | Location label and data mode |
| `satellite` | Source compatibility, NDVI, trend, observation date |
| `soil` | Texture, pH, organic carbon, moisture |
| `weather` | Rainfall, maximum temperature, risk flag |
| `advisory` | Headline, confidence, regenerative actions |
| `provenance` | Contract version, shareable fields, privacy note |

## Consent and sovereignty

The prototype states the intended governance model but does not persist or transmit farmer data. A production implementation should collect purpose-specific, revocable consent; keep precise location within the farmer's or national jurisdiction; and share only approved, aggregated indicators or model artifacts.

## Example request

```json
{
  "location": "Nashik, India",
  "soil_type": "loamy",
  "water_availability": "medium"
}
```

Send this body to `POST /field-intelligence`.
