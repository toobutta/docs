# Evoteli Backend API

FastAPI-based backend for the Evoteli Market Intelligence Platform.

## Features

- **Property Search API** - Advanced filtering by location, roof condition, solar potential, permits
- **Product Analysis Endpoints** - RoofIQ, SolarFit, DrivewayPro, PermitScope
- **Redis Caching** - 5-30 minute TTL for optimal performance
- **PostGIS Spatial Queries** - Efficient geospatial filtering
- **OpenAPI Documentation** - Auto-generated API docs at `/api/v1/docs`

## Tech Stack

- **Framework:** FastAPI 0.109
- **Database:** PostgreSQL 15 with PostGIS extension
- **ORM:** SQLAlchemy 2.0 (async)
- **Caching:** Redis/Valkey
- **Authentication:** JWT with python-jose
- **Email:** SendGrid
- **Task Queue:** Celery (for alerts)

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+ with PostGIS
- Redis/Valkey

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Create database:
```bash
createdb evoteli
psql evoteli -c "CREATE EXTENSION postgis;"
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Seed sample data (optional):
```bash
python scripts/seed_data.py
```

### Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at:
- http://localhost:8000
- Docs: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## API Endpoints

### Properties

- `POST /api/v1/properties/search` - Search properties with filters
- `GET /api/v1/properties/{id}` - Get property details
- `GET /api/v1/properties/{id}/roofiq` - Get RoofIQ analysis
- `GET /api/v1/properties/{id}/solarfit` - Get SolarFit analysis
- `GET /api/v1/properties/{id}/drivewaypro` - Get DrivewayPro analysis
- `GET /api/v1/properties/{id}/permitscope` - Get PermitScope analysis

### Example Request

```bash
curl -X POST http://localhost:8000/api/v1/properties/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Atlanta",
    "state": "GA",
    "roof_condition": ["good", "excellent"],
    "solar_score_min": 70,
    "limit": 100
  }'
```

## Database Schema

See `app/models/property.py` for complete schema.

**Tables:**
- `properties` - Core property data with PostGIS geometry
- `roofiq_analyses` - Roof condition analysis
- `solarfit_analyses` - Solar potential analysis
- `drivewaypro_analyses` - Driveway condition analysis
- `permitscope_analyses` - Building permit data

## Caching Strategy

- Property search results: 5 minutes
- Property details: 15 minutes
- Product analyses: 30 minutes

Cache keys are auto-generated MD5 hashes of query parameters.

## Performance

- Search query: < 500ms (p95) with 100k properties
- Cache hit rate: > 70% expected
- Concurrent requests: 500+ (with gunicorn workers)

## Testing

```bash
pytest
pytest --cov=app tests/
```

## Deployment

See `/infrastructure` directory for Terraform/Docker configurations.

Recommended production stack:
- AWS RDS PostgreSQL with PostGIS
- AWS ElastiCache (Redis)
- AWS ECS/Fargate or EC2 with gunicorn
- CloudFront for API caching

## Contributing

See main repository README for contribution guidelines.
