"""
Analytics Dashboard API

Unified analytics across all platform features.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from uuid import UUID
import logging

from app.core.database import get_db
from app.models.property import Property
from app.models.saved_search import SavedSearch, SearchAlert
from app.models.google_ads import GoogleAdsAccount, CustomerMatchAudience
from app.models.territory import Territory

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["analytics"])


async def get_current_user_id() -> UUID:
    """Temporary: Return mock user ID. Replace with actual auth."""
    return UUID("00000000-0000-0000-0000-000000000001")


@router.get("/dashboard")
async def get_dashboard_analytics(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Get comprehensive dashboard analytics across all features
    """
    try:
        # Property Statistics
        total_properties_query = select(func.count(Property.id))
        total_properties = await db.execute(total_properties_query)
        total_properties_count = total_properties.scalar()

        # Recent properties (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_properties_query = select(func.count(Property.id)).where(
            Property.created_at >= week_ago
        )
        recent_properties = await db.execute(recent_properties_query)
        recent_properties_count = recent_properties.scalar()

        # Saved Searches Statistics
        saved_searches_query = select(func.count(SavedSearch.id)).where(
            SavedSearch.user_id == user_id, SavedSearch.is_active == True
        )
        saved_searches = await db.execute(saved_searches_query)
        saved_searches_count = saved_searches.scalar()

        # Active alerts (alerts_enabled=true)
        active_alerts_query = select(func.count(SavedSearch.id)).where(
            SavedSearch.user_id == user_id,
            SavedSearch.is_active == True,
            SavedSearch.alerts_enabled == True,
        )
        active_alerts = await db.execute(active_alerts_query)
        active_alerts_count = active_alerts.scalar()

        # Alerts sent (last 30 days)
        month_ago = datetime.utcnow() - timedelta(days=30)
        alerts_sent_query = (
            select(func.count(SearchAlert.id))
            .join(SavedSearch)
            .where(
                SavedSearch.user_id == user_id, SearchAlert.sent_at >= month_ago
            )
        )
        alerts_sent = await db.execute(alerts_sent_query)
        alerts_sent_count = alerts_sent.scalar()

        # Google Ads Statistics
        google_ads_account_query = select(GoogleAdsAccount).where(
            GoogleAdsAccount.user_id == user_id,
            GoogleAdsAccount.is_active == True,
        )
        google_ads_account = await db.execute(google_ads_account_query)
        google_ads_connected = google_ads_account.scalar_one_or_none() is not None

        audiences_query = select(func.count(CustomerMatchAudience.id)).where(
            CustomerMatchAudience.user_id == user_id
        )
        audiences = await db.execute(audiences_query)
        audiences_count = audiences.scalar()

        # Total contacts in audiences
        total_contacts_query = select(
            func.sum(CustomerMatchAudience.total_contacts)
        ).where(CustomerMatchAudience.user_id == user_id)
        total_contacts = await db.execute(total_contacts_query)
        total_contacts_count = total_contacts.scalar() or 0

        # Territory Statistics
        territories_query = select(func.count(Territory.id)).where(
            Territory.user_id == user_id, Territory.is_active == True
        )
        territories = await db.execute(territories_query)
        territories_count = territories.scalar()

        # Total properties in territories (sum of cached counts)
        territory_properties_query = select(
            func.sum(Territory.property_count)
        ).where(Territory.user_id == user_id, Territory.is_active == True)
        territory_properties = await db.execute(territory_properties_query)
        territory_properties_count = territory_properties.scalar() or 0

        # Recent Activity (last 10 saved searches)
        recent_searches_query = (
            select(SavedSearch)
            .where(SavedSearch.user_id == user_id)
            .order_by(SavedSearch.created_at.desc())
            .limit(10)
        )
        recent_searches = await db.execute(recent_searches_query)
        recent_searches_list = recent_searches.scalars().all()

        return {
            "properties": {
                "total": total_properties_count,
                "recent_week": recent_properties_count,
                "growth_rate": (
                    (recent_properties_count / total_properties_count * 100)
                    if total_properties_count > 0
                    else 0
                ),
            },
            "saved_searches": {
                "total": saved_searches_count,
                "active_alerts": active_alerts_count,
                "alerts_sent_30d": alerts_sent_count,
            },
            "google_ads": {
                "connected": google_ads_connected,
                "total_audiences": audiences_count,
                "total_contacts": total_contacts_count,
            },
            "territories": {
                "total": territories_count,
                "total_properties": territory_properties_count,
                "avg_properties_per_territory": (
                    territory_properties_count / territories_count
                    if territories_count > 0
                    else 0
                ),
            },
            "recent_activity": [
                {
                    "id": str(s.id),
                    "name": s.name,
                    "type": "saved_search",
                    "created_at": s.created_at.isoformat(),
                    "new_matches": s.new_matches_since_last_alert,
                }
                for s in recent_searches_list
            ],
            "generated_at": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.error(f"Error getting dashboard analytics: {str(e)}")
        # Return empty stats on error
        return {
            "properties": {"total": 0, "recent_week": 0, "growth_rate": 0},
            "saved_searches": {"total": 0, "active_alerts": 0, "alerts_sent_30d": 0},
            "google_ads": {"connected": False, "total_audiences": 0, "total_contacts": 0},
            "territories": {
                "total": 0,
                "total_properties": 0,
                "avg_properties_per_territory": 0,
            },
            "recent_activity": [],
            "generated_at": datetime.utcnow().isoformat(),
        }
