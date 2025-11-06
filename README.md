# Geo-Intelligence Platform Documentation

Comprehensive documentation for the Geo-Intelligence Platform - decision-grade intelligence from computer vision, satellite imagery, and location data.

## Overview

This repository contains the complete documentation for the Geo-Intelligence Platform MVP, including:

- **Product Documentation:** LotWatch, HomeScope, TradeZone AI, GeoPulse, SurgeRadar, PermitScope
- **API Reference:** REST API for signals, alerts, audiences, Earth Engine, and provenance
- **Architecture Guides:** Edge, stream, and batch processing components
- **Concept Guides:** Signals, data model, provenance & quality
- **MVP Roadmap:** 0-90 day implementation plan

## Quick Links

- **[Platform Overview](./index.mdx)** - Vision, products, and capabilities
- **[Quickstart Guide](./quickstart.mdx)** - Get started in 30 minutes
- **[Architecture](./architecture.mdx)** - System architecture overview
- **[MVP Roadmap](./mvp-roadmap.mdx)** - 90-day implementation plan
- **[API Reference](./api-reference/introduction.mdx)** - REST API documentation

## Core Products

### Commercial Intelligence
- **[LotWatch](./products/lotwatch.mdx)** - Real-time parking, drive-thru, curbside analytics
- **[TradeZone AI](./products/tradezone-ai.mdx)** - Site selection and cannibalization
- **[GeoPulse](./products/geopulse.mdx)** - Construction and change detection
- **[SurgeRadar](./products/surgeradar.mdx)** - Event/weather demand forecasting
- **[PermitScope](./products/permitscope.mdx)** - Competitor opening early-warning

### Residential Intelligence
- **[HomeScope](./products/homescope.mdx)** - Parcel-level property intelligence
- **[RoofIQ](./products/roofiq.mdx)** - Roof geometry and condition analysis
- **[SolarFit](./products/solarfit.mdx)** - Solar suitability scoring
- **[DrivewayPro](./products/driveway-pro.mdx)** - Driveway material and condition
- **[StormShield](./products/stormshield.mdx)** - Post-storm damage triage

## MVP Scope (0-90 Days)

**Phase 0 Goals:**
1. LotWatch for 10 QSR pilot sites
2. HomeScope RoofIQ + SolarFit
3. Signal API with OAuth 2.0
4. Threshold alerts (Slack integration)
5. Privacy-by-design (redaction, provenance)

**Success Criteria:**
- 10 sites live with <10s lag
- Occupancy accuracy ±8%
- RoofIQ geometry error <5%
- Average quality_score ≥0.7

## Technology Stack

- **Edge:** NVIDIA Jetson, YOLO11n, ByteTrack, OpenCV
- **Stream:** Kafka, Apache Beam/Flink, GStreamer
- **Batch:** Dagster, Raster-Vision, ChangeFormer, Earth Engine
- **Storage:** ClickHouse, PostGIS, S3/GCS
- **Serving:** FastAPI, NVIDIA Triton, Redis
- **Observability:** Prometheus, Grafana, OpenTelemetry

## Local Development

Install the Mintlify CLI:

```bash
npm i -g mint
```

Run the development server:

```bash
mint dev
```

View at `http://localhost:3000`.

## Documentation Structure

```
docs/
├── index.mdx                    # Platform overview
├── quickstart.mdx               # Getting started guide
├── architecture.mdx             # Platform architecture
├── mvp-roadmap.mdx             # MVP implementation plan
├── products/                    # Product documentation (10 files)
├── api-reference/              # API reference (7 files)
├── concepts/                   # Core concepts (3 files)
└── docs.json                   # Navigation configuration
```

## Support

- **Email:** support@geointel.example.com
- **API Status:** https://status.geointel.example.com

## License

Documentation: CC BY 4.0
Platform components: Apache 2.0 / MIT (see individual licenses)
