-- Performance Optimization: Database Indexes
-- Run this after Alembic migrations

-- Properties table indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_city_state_zip
ON properties(city, state, zip_code)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_properties_type
ON properties(property_type)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_properties_updated
ON properties(updated_at DESC);

-- Saved searches for user lookups
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_active
ON saved_searches(user_id, is_active, created_at DESC);

-- Google Ads accounts and audiences
CREATE INDEX IF NOT EXISTS idx_google_ads_accounts_user_status
ON google_ads_accounts(user_id, status, is_active);

CREATE INDEX IF NOT EXISTS idx_customer_match_audiences_sync
ON customer_match_audiences(sync_status, next_sync_at)
WHERE auto_sync_enabled = true;

-- Territories for spatial queries
CREATE INDEX IF NOT EXISTS idx_territories_user_active
ON territories(user_id, is_active, created_at DESC);

-- Search alerts for performance monitoring
CREATE INDEX IF NOT EXISTS idx_search_alerts_search_sent
ON search_alerts(saved_search_id, sent_at DESC);

-- Comment: GIST spatial index on geometry already created in model definitions
