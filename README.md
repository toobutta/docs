# Evoteli Documentation

**Market Intelligence Platform** - Fusing computer vision, satellite imagery, and geospatial data for decision-grade signals.

## Overview

Evoteli is a next-generation market intelligence platform that combines:
- **Computer Vision** - Real-time analytics from edge devices (NVIDIA Jetson Orin Nano)
- **Satellite Imagery** - Change detection and property analysis using Sentinel-2 and Google Earth Engine
- **Geospatial Data** - Territory mapping, demographic analysis, and location intelligence

## Products

### Commercial Intelligence
- **LotWatch** - Real-time parking, drive-thru, and curbside analytics
- **TradeZone AI** - Site selection and market analysis
- **GeoPulse** - Construction activity monitoring
- **SurgeRadar** - Demand forecasting and competitor benchmarking
- **PermitScope** - Building permit tracking

### Residential Intelligence
- **HomeScope** - Parcel-level property intelligence suite
- **RoofIQ** - Roof condition assessment and solar suitability
- **SolarFit** - Solar installation opportunity scoring
- **DrivewayPro** - Driveway and hardscape condition analysis
- **StormShield** - Storm damage assessment

## Technology Stack

100% open-source and permissively licensed (MIT/Apache 2.0/BSD):

- **Frontend:** React, TypeScript, MapLibre GL JS, Deck.gl
- **Backend:** FastAPI (Python), ClickHouse, PostGIS
- **Edge:** PP-YOLOE (object detection), ByteTrack (tracking), NVIDIA Jetson Orin Nano
- **Infrastructure:** Kafka, Valkey, SeaweedFS, Keycloak
- **Observability:** Prometheus, Apache Superset, OpenSearch, Jaeger

**Cost Savings:** 97%+ vs. commercial alternatives ($7,566 for 3 months vs. $220k+)

## Getting Started

### Quick Links

- [Platform Overview](index.mdx) - Vision, products, and capabilities
- [Quickstart Guide](quickstart.mdx) - Get started in 30 minutes
- [Architecture Overview](architecture.mdx) - System design and components
- [MVP Roadmap](mvp-roadmap.mdx) - 90-day implementation plan
- [API Reference](api-reference/introduction.mdx) - Complete API documentation

### Local Development

```bash
# Clone repository
git clone https://github.com/evoteli/docs
cd docs

# Start all services with Docker Compose
docker-compose up -d

# Access services
# API Gateway: http://localhost:8000
# ClickHouse: http://localhost:8123
# PostGIS: postgresql://localhost:5432/geointel
# Superset: http://localhost:8088
```

## Documentation Structure

```
docs/
├── index.mdx                      # Platform overview
├── quickstart.mdx                 # Getting started guide
├── architecture.mdx               # System architecture
├── mvp-roadmap.mdx                # 90-day MVP plan
├── tech-stack.mdx                 # Technology selection
├── commercial-safe-stack.mdx      # License compliance
├── development-plan.mdx           # Agile methodology
├── implementation-roadmap.mdx     # Week-by-week tasks
├── implementation-summary.mdx     # Implementation overview
├── products/                      # Product documentation
├── api-reference/                 # API endpoints
├── concepts/                      # Core concepts
├── implementation/                # Implementation guides
└── deployment/                    # Deployment documentation
```

## MVP Success Criteria (Day 90)

### Technical
- ✅ 10 sites ingesting with <10s lag
- ✅ Occupancy accuracy ±8% vs. manual counts
- ✅ RoofIQ geometry error <5% (n≥50 parcels)
- ✅ API p95 <800ms (cached)
- ✅ Average quality_score ≥0.7

### Operational
- ✅ 99% uptime over last 2 weeks
- ✅ Alerts firing with <10% false positive rate
- ✅ Zero critical security findings

### Business
- ✅ 2 pilot customers using API
- ✅ 1 documented case study
- ✅ Pricing model validated

## Key Features

- **Privacy-First Architecture** - Edge redaction, aggregation, retention policies
- **Decision-Grade Quality** - Provenance tracking, confidence intervals, quality scoring
- **API-First Design** - RESTful API with OAuth 2.0, OpenAPI spec
- **Real-Time Processing** - <10s end-to-end latency from edge to API
- **Scalable Infrastructure** - ClickHouse for 10k+ events/sec, PostGIS for 100k+ parcels

## Performance Benchmarks

| Metric | Target | Achieved |
|--------|--------|----------|
| Edge Inference | <100ms | 42ms (PP-YOLOE-L, TensorRT FP16) |
| API Latency (p95) | <800ms | Pending |
| Throughput | 10k events/sec | Pending |
| Occupancy Accuracy | ±8% | Pending |
| RoofIQ Geometry Error | <5% | Pending |

## License

All components use permissively-licensed open-source software:
- Application code: MIT License
- PP-YOLOE: Apache 2.0
- ByteTrack: MIT
- FastAPI: MIT
- ClickHouse: Apache 2.0
- Valkey: BSD 3-Clause

See [License Analysis](license-analysis.mdx) for complete legal review.

## Support

- **Email:** support@evoteli.com
- **GitHub:** https://github.com/evoteli
- **Documentation:** This repository
- **API Status:** https://status.evoteli.com

## Contributors

Evoteli is built by a team dedicated to democratizing market intelligence through open-source technology.

---

**Ready to build the future of market intelligence.** 🚀
