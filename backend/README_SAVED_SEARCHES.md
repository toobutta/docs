# Saved Searches with Email Alerts

## Overview

This feature enables users to save property searches and receive automated email alerts when new properties match their criteria.

## Components

### Database Models

#### SavedSearch
- Stores user-defined search criteria and alert preferences
- Supports instant, daily, weekly, and monthly alert frequencies
- Tracks statistics (total matches, new matches since last alert)

#### SearchAlert
- Alert history tracking
- Email delivery status (sent, opened, clicked)
- SendGrid integration for tracking

#### UserEmailPreference
- Global email preferences per user
- Digest preferences (daily/weekly)
- Unsubscribe management

### API Endpoints

#### Saved Searches CRUD
- `POST /api/v1/saved-searches` - Create new saved search
- `GET /api/v1/saved-searches` - List user's saved searches
- `GET /api/v1/saved-searches/{id}` - Get specific saved search with alert history
- `PATCH /api/v1/saved-searches/{id}` - Update saved search
- `DELETE /api/v1/saved-searches/{id}` - Delete (soft delete) saved search

#### Alert Management
- `POST /api/v1/saved-searches/{id}/test-alert` - Send test alert
- `GET /api/v1/saved-searches/{id}/alerts` - Get alert history

#### Email Preferences
- `GET /api/v1/saved-searches/preferences/email` - Get user preferences
- `PATCH /api/v1/saved-searches/preferences/email` - Update preferences

### Background Tasks (Celery)

#### Periodic Tasks
- **check_instant_alerts** - Runs every 5 minutes
  - Checks saved searches with instant alert frequency
  - Sends emails immediately when new properties match

- **process_daily_alerts** - Runs hourly
  - Processes daily alerts at configured times (0-23 hour)
  - Sends daily digest emails

- **process_weekly_alerts** - Runs on configured weekday
  - Sends weekly digest emails
  - Day 0 = Monday, 6 = Sunday

- **process_monthly_alerts** - Runs on configured day of month
  - Sends monthly digest emails

- **cleanup_old_alerts** - Runs daily at 2 AM UTC
  - Removes alert history older than 90 days

### Email Service

#### SendGrid Integration
- HTML and plain text email templates
- Property details with scores (RoofIQ, SolarFit, DrivewayPro)
- Unsubscribe links and preference management
- Tracking (message ID, open/click tracking)

## Setup

### Environment Variables

Add to `.env`:

```bash
# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=alerts@evoteli.com
SENDGRID_FROM_NAME=Evoteli Alerts
SENDGRID_UNSUBSCRIBE_GROUP_ID=12345  # Optional

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Database Migration

Run Alembic migration to create tables:

```bash
cd backend
alembic revision --autogenerate -m "Add saved searches and alerts"
alembic upgrade head
```

### Start Celery Workers

Start Celery worker for processing tasks:

```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

Start Celery beat for periodic tasks:

```bash
celery -A app.tasks.celery_app beat --loglevel=info
```

Optional: Start Flower for monitoring:

```bash
celery -A app.tasks.celery_app flower
# Access at http://localhost:5555
```

### SendGrid Setup

1. Create SendGrid account and get API key
2. Verify sender email address
3. Create unsubscribe group (optional)
4. Configure webhooks for tracking (optional):
   - Event Notification webhook: `{BACKEND_URL}/api/v1/webhooks/sendgrid`

## Usage Examples

### Create Saved Search

```bash
curl -X POST http://localhost:8000/api/v1/saved-searches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "High-value solar leads",
    "description": "Properties with high solar scores in target areas",
    "filters": {
      "city": "Austin",
      "state": "TX",
      "solar_score_min": 80
    },
    "alerts_enabled": true,
    "alert_frequency": "daily",
    "alert_email": "user@example.com",
    "alert_time": 9
  }'
```

### Test Alert

```bash
curl -X POST http://localhost:8000/api/v1/saved-searches/{search_id}/test-alert \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_email": "test@example.com"
  }'
```

### Update Alert Preferences

```bash
curl -X PATCH http://localhost:8000/api/v1/saved-searches/{search_id} \
  -H "Content-Type: application/json" \
  -d '{
    "alert_frequency": "weekly",
    "alert_day": 1,
    "alert_time": 10
  }'
```

### Get Alert History

```bash
curl http://localhost:8000/api/v1/saved-searches/{search_id}/alerts?limit=10
```

## Alert Frequency Options

### Instant
- Checks every 5 minutes
- Sends email immediately when new properties match
- Best for time-sensitive leads

### Daily
- Sends digest at configured hour (0-23 UTC)
- Includes all new properties since last alert
- Default: 9 AM

### Weekly
- Sends digest on configured weekday (0=Monday, 6=Sunday)
- At configured hour
- Default: Monday 9 AM

### Monthly
- Sends digest on configured day of month (1-31)
- At configured hour
- Default: 1st at 9 AM

## Email Template Customization

Edit `app/services/email_service.py` to customize:

- HTML template: `_generate_alert_html()`
- Plain text template: `_generate_alert_plain()`
- Subject lines
- Styles and branding

## Monitoring

### Celery Tasks
Monitor task execution with Flower:
```bash
celery -A app.tasks.celery_app flower
```

### Database Queries
Check alert statistics:
```sql
SELECT
  s.name,
  s.total_matches,
  s.new_matches_since_last_alert,
  s.last_checked_at,
  COUNT(a.id) as alert_count
FROM saved_searches s
LEFT JOIN search_alerts a ON a.saved_search_id = s.id
GROUP BY s.id
ORDER BY s.created_at DESC;
```

### SendGrid Dashboard
- Email delivery rates
- Open/click rates
- Bounce/spam reports

## Troubleshooting

### Emails Not Sending

1. Check SendGrid API key is valid
2. Verify sender email is verified in SendGrid
3. Check Celery worker is running: `celery -A app.tasks.celery_app inspect active`
4. Check logs: `celery -A app.tasks.celery_app events`
5. Test SendGrid connectivity:
   ```python
   from app.services.email_service import email_service
   email_service.send_test_alert("test@example.com", "Test Search")
   ```

### Alerts Not Processing

1. Check Celery beat is running for periodic tasks
2. Verify Redis connection: `redis-cli ping`
3. Check task schedule: `celery -A app.tasks.celery_app inspect scheduled`
4. Review saved search is active: `is_active=true AND alerts_enabled=true`

### Performance Issues

1. Adjust Celery worker concurrency:
   ```bash
   celery -A app.tasks.celery_app worker --concurrency=8
   ```
2. Enable result backend cleanup in Celery config
3. Add database indexes for frequently queried fields
4. Consider batching alerts for users with many saved searches

## Next Steps

- [ ] Implement user authentication (replace mock user ID)
- [ ] Add webhook endpoint for SendGrid event tracking
- [ ] Implement unsubscribe token generation
- [ ] Add email templates for other notification types
- [ ] Set up monitoring and alerting for failed emails
- [ ] Add rate limiting for email sends
- [ ] Implement A/B testing for email templates
