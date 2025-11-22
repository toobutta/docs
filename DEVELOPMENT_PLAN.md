# Evoteli Development Plan: Enhancements 1-6

## Overview
This document outlines the complete development plan for implementing 6 critical enhancements to the Evoteli platform, covering both front-end (React/Next.js) and back-end (FastAPI/Python) requirements.

---

## IMMEDIATE PRIORITY (Next 30 Days)

### Enhancement 1: Real-Time Property Data Integration

**Total Effort:** 2-3 days (16-24 hours)
**Priority:** CRITICAL
**Dependencies:** None (standalone)

#### Back-End Requirements (60% of work - 10-14 hours)

**API Endpoints to Build:**
1. `POST /api/v1/properties/search` - Property search with filters
   - Input: PropertyFilters (bounds, roof_condition, solar_score, etc.)
   - Output: Paginated PropertySearchResponse
   - Query: PostGIS spatial query with multiple filters
   - Optimization: Use PostGIS indexes, query result caching (Valkey)

2. `GET /api/v1/properties/{id}` - Single property detail
   - Input: Property UUID
   - Output: Full Property object with all product data
   - Join: Properties + RoofIQ + SolarFit + DrivewayPro + PermitScope tables

3. `GET /api/v1/properties/{id}/roofiq` - RoofIQ specific data
4. `GET /api/v1/properties/{id}/solarfit` - SolarFit specific data
5. `GET /api/v1/properties/{id}/drivewaypro` - DrivewayPro data
6. `GET /api/v1/properties/{id}/permitscope` - PermitScope data

**Database Schema (if not exists):**
```sql
-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY,
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    zip TEXT,
    county TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type TEXT CHECK (property_type IN ('residential', 'commercial')),
    geometry GEOMETRY(Polygon, 4326),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_properties_location ON properties USING GIST(geometry);
CREATE INDEX idx_properties_coords ON properties(latitude, longitude);

-- RoofIQ table
CREATE TABLE roofiq_analyses (
    id UUID PRIMARY KEY,
    property_id UUID REFERENCES properties(id),
    condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    confidence INTEGER CHECK (confidence BETWEEN 0 AND 100),
    age_years INTEGER,
    material TEXT,
    area_sqft INTEGER,
    slope_degrees DECIMAL(5, 2),
    complexity TEXT CHECK (complexity IN ('simple', 'moderate', 'complex')),
    cost_low INTEGER,
    cost_high INTEGER,
    imagery_date DATE,
    analysis_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_roofiq_property ON roofiq_analyses(property_id);
CREATE INDEX idx_roofiq_condition ON roofiq_analyses(condition);
```

**Caching Strategy:**
```python
# Valkey/Redis caching
CACHE_KEYS = {
    'property_search': 'search:{hash}',  # 5 min TTL
    'property_detail': 'property:{id}',  # 15 min TTL
    'product_analysis': '{product}:{property_id}',  # 30 min TTL
}
```

**Pagination Implementation:**
```python
from fastapi import Query

@router.post("/properties/search")
async def search_properties(
    filters: PropertyFilters,
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0)
):
    # Apply filters + pagination
    # Return total count + results
    pass
```

#### Front-End Requirements (40% of work - 6-10 hours)

**Files to Modify:**
1. `lib/api/properties.ts` - Replace mock with real API calls
2. `lib/hooks/use-properties.ts` - Create TanStack Query hooks
3. `app/(dashboard)/map/page.tsx` - Connect to live data
4. `components/map/property-markers.tsx` - Handle loading states

**TanStack Query Implementation:**
```typescript
// lib/hooks/use-properties.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { searchProperties } from '@/lib/api/properties'

export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => searchProperties(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useInfiniteProperties(filters: PropertyFilters) {
  return useInfiniteQuery({
    queryKey: ['properties', 'infinite', filters],
    queryFn: ({ pageParam = 0 }) =>
      searchProperties({ ...filters, offset: pageParam }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.properties.length === 100 ? pages.length * 100 : undefined,
    initialPageParam: 0,
  })
}
```

**Loading States:**
```typescript
// components/map/property-markers.tsx
export function PropertyMarkers({ filters }: { filters: PropertyFilters }) {
  const { data, isLoading, error } = useProperties(filters)

  if (isLoading) return <MapLoadingOverlay />
  if (error) return <MapErrorState error={error} />
  if (!data?.properties.length) return <NoPropertiesFound />

  return <Markers properties={data.properties} />
}
```

**Deliverables:**
- [ ] Back-End: 6 API endpoints with OpenAPI docs
- [ ] Back-End: Database migrations for properties + products
- [ ] Back-End: Valkey caching layer
- [ ] Back-End: Unit tests for endpoints (90% coverage)
- [ ] Front-End: TanStack Query hooks
- [ ] Front-End: Loading/error states
- [ ] Front-End: Infinite scroll pagination
- [ ] Integration: E2E tests for search flow

---

### Enhancement 3: Saved Searches with Email Alerts

**Total Effort:** 4-5 days (32-40 hours)
**Priority:** CRITICAL
**Dependencies:** Enhancement 1 (property search API)

#### Back-End Requirements (70% of work - 22-28 hours)

**Database Schema:**
```sql
-- Saved searches table
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    filters JSONB NOT NULL,
    alert_frequency TEXT CHECK (alert_frequency IN ('realtime', 'daily', 'weekly')),
    is_active BOOLEAN DEFAULT true,
    last_check_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_active ON saved_searches(is_active);

-- Alert history table
CREATE TABLE alert_history (
    id UUID PRIMARY KEY,
    saved_search_id UUID REFERENCES saved_searches(id),
    properties_found INTEGER,
    email_sent_at TIMESTAMP,
    email_status TEXT CHECK (email_status IN ('sent', 'failed', 'bounced'))
);
```

**API Endpoints:**
1. `POST /api/v1/saved-searches` - Create saved search
2. `GET /api/v1/saved-searches` - List user's saved searches
3. `GET /api/v1/saved-searches/{id}` - Get specific search
4. `PUT /api/v1/saved-searches/{id}` - Update search
5. `DELETE /api/v1/saved-searches/{id}` - Delete search
6. `POST /api/v1/saved-searches/{id}/pause` - Pause alerts
7. `POST /api/v1/saved-searches/{id}/resume` - Resume alerts

**Background Job (Celery/APScheduler):**
```python
# services/alert_service.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

async def check_saved_searches_for_alerts():
    """Run every hour to check for new matches"""
    active_searches = await db.get_active_saved_searches()

    for search in active_searches:
        # Get properties added since last check
        new_properties = await get_new_matching_properties(
            filters=search.filters,
            since=search.last_check_at
        )

        if len(new_properties) > 0:
            await send_alert_email(
                user=search.user,
                search_name=search.name,
                properties=new_properties
            )

            await db.update_last_check(search.id)

async def send_alert_email(user, search_name, properties):
    """Send email via SendGrid"""
    message = Mail(
        from_email='alerts@evoteli.com',
        to_emails=user.email,
        subject=f'New properties match "{search_name}"',
        html_content=render_email_template(search_name, properties)
    )

    sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    response = sg.send(message)

    # Log to alert_history
    await db.create_alert_history(...)
```

**Email Template:**
```html
<!-- templates/alert_email.html -->
<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h2>{{ search_name }} - {{ property_count }} New Matches</h2>

    {% for property in properties[:5] %}
    <div style="border: 1px solid #ddd; padding: 16px; margin: 16px 0;">
        <h3>{{ property.address }}</h3>
        <p><strong>Roof Condition:</strong> {{ property.roofiq.condition }}</p>
        <p><strong>Solar Score:</strong> {{ property.solarfit.score }}/100</p>
        <a href="https://app.evoteli.com/property/{{ property.id }}">View Details</a>
    </div>
    {% endfor %}

    <a href="https://app.evoteli.com/alerts">Manage Alerts</a>
</div>
```

**Scheduler Setup:**
```python
# main.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def start_scheduler():
    scheduler.add_job(
        check_saved_searches_for_alerts,
        'interval',
        hours=1,
        id='alert_checker'
    )
    scheduler.start()
```

#### Front-End Requirements (30% of work - 10-12 hours)

**Files to Create/Modify:**
1. `app/(dashboard)/alerts/page.tsx` - Full alerts management UI
2. `components/alerts/create-alert-dialog.tsx` - Create alert modal
3. `components/alerts/alert-card.tsx` - Display saved search
4. `lib/api/alerts.ts` - API client functions
5. `lib/hooks/use-alerts.ts` - TanStack Query hooks

**Alert Creation Flow:**
```typescript
// components/alerts/create-alert-dialog.tsx
export function CreateAlertDialog({ isOpen, onClose, initialFilters }: Props) {
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [filters, setFilters] = useState(initialFilters)

  const { mutate: createAlert } = useCreateAlert()

  const handleSubmit = () => {
    createAlert({
      name,
      filters,
      alert_frequency: frequency
    }, {
      onSuccess: () => {
        toast.success('Alert created successfully')
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Form UI */}
    </Dialog>
  )
}
```

**Alert Management:**
```typescript
// app/(dashboard)/alerts/page.tsx
export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlerts()
  const { mutate: toggleAlert } = useToggleAlert()
  const { mutate: deleteAlert } = useDeleteAlert()

  return (
    <div className="p-8">
      <div className="flex justify-between mb-8">
        <h1>Email Alerts</h1>
        <Button onClick={() => setCreateOpen(true)}>
          Create Alert
        </Button>
      </div>

      <div className="space-y-4">
        {alerts?.map(alert => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onToggle={() => toggleAlert(alert.id)}
            onDelete={() => deleteAlert(alert.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

**Deliverables:**
- [ ] Back-End: Saved searches CRUD API
- [ ] Back-End: Background job scheduler
- [ ] Back-End: SendGrid integration
- [ ] Back-End: Email templates (HTML/text)
- [ ] Back-End: Alert history tracking
- [ ] Front-End: Alert management page
- [ ] Front-End: Create/edit alert dialogs
- [ ] Front-End: Pause/resume/delete actions
- [ ] Testing: Email delivery tests

---

### Enhancement 6: Google Ads Customer Match Integration

**Total Effort:** 6-8 days (48-64 hours)
**Priority:** CRITICAL
**Dependencies:** Enhancement 1, Enhancement 3 (audiences)

#### Back-End Requirements (75% of work - 36-48 hours)

**OAuth 2.0 Flow:**
```python
# services/google_ads_service.py
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleads import adwords

class GoogleAdsService:
    SCOPES = ['https://www.googleapis.com/auth/adwords']

    async def initiate_oauth(self, user_id: str) -> str:
        """Generate OAuth URL for user authorization"""
        flow = Flow.from_client_secrets_file(
            'google_credentials.json',
            scopes=self.SCOPES,
            redirect_uri=settings.GOOGLE_ADS_REDIRECT_URI
        )

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )

        # Store state in session
        await cache.set(f'oauth_state:{user_id}', state, expire=600)

        return authorization_url

    async def handle_oauth_callback(self, code: str, state: str):
        """Exchange code for access token"""
        flow = Flow.from_client_secrets_file(...)
        flow.fetch_token(code=code)

        credentials = flow.credentials

        # Store credentials encrypted in database
        await db.save_google_credentials(
            user_id=user_id,
            access_token=encrypt(credentials.token),
            refresh_token=encrypt(credentials.refresh_token)
        )
```

**Database Schema:**
```sql
-- Google Ads integrations
CREATE TABLE google_ads_integrations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    customer_id TEXT NOT NULL,  -- Google Ads customer ID
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    token_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audience syncs
CREATE TABLE audience_syncs (
    id UUID PRIMARY KEY,
    audience_id UUID REFERENCES audiences(id),
    integration_id UUID REFERENCES google_ads_integrations(id),
    google_list_id TEXT,  -- Customer Match list ID
    properties_count INTEGER,
    sync_status TEXT CHECK (sync_status IN ('pending', 'processing', 'completed', 'failed')),
    last_synced_at TIMESTAMP,
    error_message TEXT
);
```

**Customer Match Upload:**
```python
# services/google_ads_service.py
async def upload_customer_match(
    self,
    integration_id: str,
    audience_id: str,
    properties: List[Property]
):
    """Upload hashed PII to Google Ads Customer Match"""

    # Get credentials
    integration = await db.get_integration(integration_id)
    credentials = self.decrypt_credentials(integration)

    # Initialize Google Ads client
    client = adwords.AdWordsClient.LoadFromStorage()
    user_list_service = client.GetService('AdwordsUserListService')

    # Create Customer Match list (first time) or get existing
    if not audience.google_list_id:
        user_list = {
            'name': audience.name,
            'description': audience.description or '',
            'membershipLifeSpan': 10000,  # 10,000 days
            'uploadKeyType': 'CONTACT_INFO'
        }

        operations = [{
            'operator': 'ADD',
            'operand': user_list
        }]

        result = user_list_service.mutate(operations)
        list_id = result['value'][0]['id']

        await db.update_audience(audience_id, google_list_id=list_id)
    else:
        list_id = audience.google_list_id

    # Hash PII data (from tax records/public data)
    hashed_members = []
    for property in properties:
        # Get property owner info
        owner = await get_property_owner(property.id)

        hashed_members.append({
            'hashedEmail': hashlib.sha256(owner.email.lower().encode()).hexdigest(),
            'hashedPhoneNumber': hashlib.sha256(owner.phone.encode()).hexdigest(),
            'addressInfo': {
                'hashedFirstName': hashlib.sha256(owner.first_name.lower().encode()).hexdigest(),
                'hashedLastName': hashlib.sha256(owner.last_name.lower().encode()).hexdigest(),
                'zipCode': property.zip,
                'countryCode': 'US'
            }
        })

    # Upload in batches of 500
    mutate_members_operation = {
        'operand': {
            'userListId': list_id,
            'membersList': hashed_members[:500]
        },
        'operator': 'ADD'
    }

    result = user_list_service.mutateMembersOperand([mutate_members_operation])

    # Track sync
    await db.create_audience_sync(
        audience_id=audience_id,
        integration_id=integration_id,
        google_list_id=list_id,
        properties_count=len(properties),
        sync_status='completed'
    )
```

**API Endpoints:**
1. `GET /api/v1/integrations/google-ads/authorize` - Initiate OAuth
2. `GET /api/v1/integrations/google-ads/callback` - OAuth callback
3. `GET /api/v1/integrations/google-ads` - List user's integrations
4. `DELETE /api/v1/integrations/google-ads/{id}` - Disconnect
5. `POST /api/v1/audiences/{id}/sync/google-ads` - Upload to Google Ads
6. `GET /api/v1/audiences/{id}/syncs` - Get sync history

#### Front-End Requirements (25% of work - 12-16 hours)

**Files to Create:**
1. `app/(dashboard)/settings/integrations/page.tsx` - Integrations hub
2. `components/integrations/google-ads-connect.tsx` - OAuth flow
3. `components/audience/google-ads-export.tsx` - Export button
4. `lib/api/integrations.ts` - API functions

**OAuth Flow UI:**
```typescript
// components/integrations/google-ads-connect.tsx
export function GoogleAdsConnect() {
  const { mutate: connectGoogleAds, isLoading } = useConnectGoogleAds()

  const handleConnect = async () => {
    // Get OAuth URL from backend
    const { authorization_url } = await fetch('/api/v1/integrations/google-ads/authorize')

    // Open OAuth popup
    window.location.href = authorization_url
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GoogleAdsIcon />
          Google Ads
        </CardTitle>
        <CardDescription>
          Export audiences directly to Google Ads Customer Match
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleConnect} disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Connect Google Ads'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Export Button in Audience Builder:**
```typescript
// components/audience/google-ads-export.tsx
export function GoogleAdsExportButton({ audienceId }: Props) {
  const { data: integrations } = useGoogleAdsIntegrations()
  const { mutate: syncToGoogleAds, isLoading } = useSyncToGoogleAds()

  const handleExport = () => {
    if (!integrations?.length) {
      toast.error('Please connect Google Ads first')
      return
    }

    syncToGoogleAds({
      audience_id: audienceId,
      integration_id: integrations[0].id
    }, {
      onSuccess: () => {
        toast.success('Audience synced to Google Ads')
      }
    })
  }

  return (
    <Button onClick={handleExport} disabled={isLoading}>
      {isLoading ? 'Syncing...' : 'Export to Google Ads'}
    </Button>
  )
}
```

**Deliverables:**
- [ ] Back-End: Google OAuth 2.0 flow
- [ ] Back-End: Credentials encryption/storage
- [ ] Back-End: Customer Match API integration
- [ ] Back-End: PII hashing (SHA-256)
- [ ] Back-End: Batch upload (500 per batch)
- [ ] Back-End: Sync status tracking
- [ ] Front-End: OAuth popup/callback handling
- [ ] Front-End: Integration management UI
- [ ] Front-End: Export button in audience builder
- [ ] Testing: End-to-end OAuth flow

---

## NEAR-TERM PRIORITY (Next 60 Days)

### Enhancement 2: Advanced Territory Drawing

**Total Effort:** 3-4 days (24-32 hours)
**Priority:** HIGH
**Dependencies:** Enhancement 1 (property search)

#### Back-End Requirements (40% of work - 10-13 hours)

**Database Schema:**
```sql
-- Territories table
CREATE TABLE territories (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    geometry GEOMETRY(Polygon, 4326) NOT NULL,
    area_sqm DECIMAL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_territories_user ON territories(user_id);
CREATE INDEX idx_territories_geom ON territories USING GIST(geometry);
```

**API Endpoints:**
1. `POST /api/v1/territories` - Create territory
2. `GET /api/v1/territories` - List user territories
3. `GET /api/v1/territories/{id}` - Get territory
4. `PUT /api/v1/territories/{id}` - Update territory
5. `DELETE /api/v1/territories/{id}` - Delete territory
6. `POST /api/v1/territories/{id}/properties` - Get properties within territory

**Spatial Query:**
```python
@router.post("/territories/{id}/properties")
async def get_properties_in_territory(
    id: UUID,
    filters: PropertyFilters = None
):
    """Get all properties within territory boundaries"""

    territory = await db.get_territory(id)

    # PostGIS spatial query
    query = """
        SELECT p.*
        FROM properties p
        WHERE ST_Within(p.geometry, ST_GeomFromGeoJSON(%s))
    """

    properties = await db.execute(query, [territory.geometry])

    # Apply additional filters
    if filters:
        properties = apply_filters(properties, filters)

    return properties
```

#### Front-End Requirements (60% of work - 14-19 hours)

**Terra Draw Integration:**
```typescript
// components/map/territory-drawing.tsx
import { TerraDraw, TerraDrawPolygonMode, TerraDrawCircleMode } from 'terra-draw'

export function TerritoryDrawing({ mapRef }: { mapRef: MapRef }) {
  const [drawMode, setDrawMode] = useState<'polygon' | 'circle' | null>(null)
  const [drawnTerritory, setDrawnTerritory] = useState<GeoJSON.Polygon | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map: mapRef.current }),
      modes: [
        new TerraDrawPolygonMode(),
        new TerraDrawCircleMode()
      ]
    })

    draw.on('finish', (id) => {
      const feature = draw.getSnapshot()[0]
      setDrawnTerritory(feature.geometry as GeoJSON.Polygon)
      draw.clear()
    })

    draw.start()

    return () => draw.stop()
  }, [mapRef])

  const handleSaveTerritory = async () => {
    if (!drawnTerritory) return

    const { data } = await createTerritory({
      name: 'My Territory',
      geometry: drawnTerritory
    })

    toast.success('Territory saved')
  }

  return (
    <div className="absolute top-20 left-4 z-10">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Draw Territory</h3>
        <div className="space-y-2">
          <Button
            variant={drawMode === 'polygon' ? 'default' : 'outline'}
            onClick={() => setDrawMode('polygon')}
          >
            Polygon
          </Button>
          <Button
            variant={drawMode === 'circle' ? 'default' : 'outline'}
            onClick={() => setDrawMode('circle')}
          >
            Circle
          </Button>
          {drawnTerritory && (
            <Button onClick={handleSaveTerritory}>Save Territory</Button>
          )}
        </div>
      </Card>
    </div>
  )
}
```

**Deliverables:**
- [ ] Back-End: Territory CRUD API
- [ ] Back-End: PostGIS spatial queries
- [ ] Front-End: Terra Draw integration
- [ ] Front-End: Polygon/circle drawing modes
- [ ] Front-End: Territory library UI
- [ ] Front-End: Filter by territory
- [ ] Testing: Spatial query accuracy

---

### Enhancement 4: Property Comparison View

**Total Effort:** 3-4 days (24-32 hours)
**Priority:** MEDIUM-HIGH
**Dependencies:** Enhancement 1

#### Back-End Requirements (20% of work - 5-6 hours)

**API Endpoint:**
```python
@router.post("/properties/compare")
async def compare_properties(
    property_ids: List[UUID]
):
    """Get detailed comparison data for multiple properties"""

    if len(property_ids) > 4:
        raise HTTPException(400, "Maximum 4 properties for comparison")

    # Fetch all properties with full product data
    properties = await db.get_properties_with_products(property_ids)

    # Calculate comparison metrics
    comparison = {
        'properties': properties,
        'highlights': {
            'best_solar': max(properties, key=lambda p: p.solarfit.score),
            'worst_roof': min(properties, key=lambda p: roof_condition_score(p)),
            'lowest_cost': min(properties, key=lambda p: p.roofiq.cost_low)
        }
    }

    return comparison
```

#### Front-End Requirements (80% of work - 19-26 hours)

**Comparison UI:**
```typescript
// components/property/property-comparison.tsx
export function PropertyComparison({ propertyIds }: { propertyIds: string[] }) {
  const { data } = useCompareProperties(propertyIds)

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <h1>Compare Properties</h1>
          <Button onClick={onClose}>Close</Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {data?.properties.map(property => (
            <div key={property.id} className="border rounded-lg p-4">
              <h3>{property.address}</h3>

              <Separator className="my-4" />

              <div className="space-y-2">
                <ComparisonRow
                  label="Roof Condition"
                  values={data.properties.map(p => p.roofiq.condition)}
                  highlightBest
                />
                <ComparisonRow
                  label="Solar Score"
                  values={data.properties.map(p => p.solarfit.score)}
                  highlightBest
                />
                <ComparisonRow
                  label="Replacement Cost"
                  values={data.properties.map(p => p.roofiq.cost_low)}
                  highlightBest={false}
                />
              </div>
            </div>
          ))}
        </div>

        <Button className="mt-8">Export Comparison PDF</Button>
      </div>
    </div>
  )
}
```

**Deliverables:**
- [ ] Back-End: Comparison API endpoint
- [ ] Front-End: Multi-select mode on map
- [ ] Front-End: Comparison panel UI
- [ ] Front-End: Highlight best/worst values
- [ ] Front-End: PDF export

---

### Enhancement 8: Bulk Property Import

**Total Effort:** 5-6 days (40-48 hours)
**Priority:** MEDIUM
**Dependencies:** Enhancement 1

#### Back-End Requirements (65% of work - 26-31 hours)

**File Upload Endpoint:**
```python
from fastapi import UploadFile

@router.post("/properties/bulk-import")
async def bulk_import_properties(
    file: UploadFile,
    background_tasks: BackgroundTasks
):
    """Upload CSV/Shapefile for bulk analysis"""

    # Validate file type
    if file.content_type not in ['text/csv', 'application/zip']:
        raise HTTPException(400, "Only CSV and Shapefile supported")

    # Save file temporarily
    file_path = f"/tmp/{uuid4()}.{file.filename.split('.')[-1]}"
    with open(file_path, 'wb') as f:
        f.write(await file.read())

    # Parse file
    if file.content_type == 'text/csv':
        addresses = parse_csv(file_path)
    else:
        geometries = parse_shapefile(file_path)

    # Create background job
    job_id = str(uuid4())
    background_tasks.add_task(
        process_bulk_import,
        job_id=job_id,
        addresses=addresses
    )

    return {'job_id': job_id, 'status': 'processing'}

async def process_bulk_import(job_id: str, addresses: List[str]):
    """Background task to geocode and analyze properties"""

    total = len(addresses)
    processed = 0

    for address in addresses:
        # Geocode
        coords = await geocode_address(address)

        # Check if property exists
        property = await db.get_property_by_coords(coords)

        if not property:
            # Trigger analysis
            property = await trigger_property_analysis(coords)

        processed += 1

        # Update progress
        await cache.set(
            f'bulk_import:{job_id}',
            {'total': total, 'processed': processed},
            expire=3600
        )

    await cache.set(f'bulk_import:{job_id}:complete', True, expire=3600)
```

**CSV Parsing:**
```python
import csv

def parse_csv(file_path: str) -> List[str]:
    """Parse CSV and extract addresses"""
    addresses = []

    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)

        for row in reader:
            # Flexible column detection
            address = (
                row.get('address') or
                row.get('Address') or
                row.get('street_address')
            )
            city = row.get('city') or row.get('City')
            state = row.get('state') or row.get('State')
            zip_code = row.get('zip') or row.get('Zip')

            full_address = f"{address}, {city}, {state} {zip_code}"
            addresses.append(full_address)

    return addresses
```

#### Front-End Requirements (35% of work - 14-17 hours)

**File Upload UI:**
```typescript
// components/import/bulk-import-dialog.tsx
export function BulkImportDialog({ isOpen, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const { mutate: uploadFile, isLoading } = useBulkImport()

  const handleUpload = () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    uploadFile(formData, {
      onSuccess: (data) => {
        // Poll for progress
        pollImportProgress(data.job_id)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import Properties</DialogTitle>
          <DialogDescription>
            Upload a CSV file with addresses to analyze
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="file"
            accept=".csv,.zip"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <div className="text-sm text-muted-foreground">
            <p>CSV format: address, city, state, zip</p>
            <p>Maximum: 1,000 properties per upload</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpload} disabled={!file || isLoading}>
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Deliverables:**
- [ ] Back-End: File upload endpoint
- [ ] Back-End: CSV/Shapefile parsers
- [ ] Back-End: Geocoding service integration
- [ ] Back-End: Background job processing
- [ ] Back-End: Progress tracking
- [ ] Front-End: File upload dialog
- [ ] Front-End: Progress indicator
- [ ] Front-End: Import history

---

## IMPLEMENTATION TIMELINE

### Week 1 (Days 1-7): Enhancement 1 - Real-Time Data Integration
- Days 1-3: Back-End API development
- Days 4-5: Front-End integration
- Days 6-7: Testing & optimization

### Week 2 (Days 8-14): Enhancement 3 - Saved Searches & Alerts
- Days 8-11: Back-End API + scheduler
- Days 12-13: Front-End UI
- Day 14: Testing & email templates

### Week 3-4 (Days 15-28): Enhancement 6 - Google Ads Integration
- Days 15-20: Back-End OAuth + Customer Match
- Days 21-25: Front-End OAuth flow + export UI
- Days 26-28: End-to-end testing

### Week 5 (Days 29-35): Enhancement 2 - Territory Drawing
- Days 29-32: Front-End Terra Draw integration
- Days 33-34: Back-End spatial queries
- Day 35: Testing

### Week 6 (Days 36-42): Enhancement 4 - Property Comparison
- Days 36-37: Back-End comparison API
- Days 38-41: Front-End comparison UI
- Day 42: Testing

### Week 7-8 (Days 43-56): Enhancement 8 - Bulk Import
- Days 43-48: Back-End file parsing + geocoding
- Days 49-53: Front-End upload UI + progress
- Days 54-56: Testing & optimization

---

## RESOURCE ALLOCATION

**Full-Stack Developer:**
- 60% Back-End (API, database, integrations)
- 40% Front-End (React components, state management)

**Estimated Total Time:** 22-27 days (176-216 hours)

**Critical Path:**
Enhancement 1 → Enhancement 3 → Enhancement 6
(Must be sequential due to dependencies)

**Parallel Work Opportunities:**
- Enhancements 2, 4, 8 can be built independently after Enhancement 1

---

## TESTING STRATEGY

**Unit Tests:**
- API endpoint tests (pytest)
- Component tests (Vitest + React Testing Library)
- Coverage target: 85%+

**Integration Tests:**
- API → Database flows
- OAuth flows
- Email delivery

**E2E Tests:**
- Search → Filter → Export flow
- Alert creation → email delivery
- Google Ads sync flow

**Performance Tests:**
- 10,000 property search (< 500ms)
- Map rendering with 1,000 markers (< 2s)
- Bulk import 1,000 addresses (< 5 min)

---

## SUCCESS METRICS

**Enhancement 1:**
- 100,000+ properties searchable
- Search latency < 500ms (p95)
- Cache hit rate > 70%

**Enhancement 3:**
- 1,000+ saved searches created (month 1)
- Email delivery rate > 98%
- Alert open rate > 40%

**Enhancement 6:**
- 50+ Google Ads integrations (month 1)
- 10,000+ properties synced to Customer Match
- Sync success rate > 95%

**Enhancement 2:**
- 500+ territories created
- Avg 2.3 territories per user

**Enhancement 4:**
- 200+ comparisons performed weekly

**Enhancement 8:**
- 100+ bulk imports (month 1)
- Avg 250 properties per import
