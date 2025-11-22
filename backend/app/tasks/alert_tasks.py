"""
Alert Tasks

Celery tasks for processing saved search alerts.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import joinedload
import logging

from app.tasks.celery_app import celery_app
from app.core.database import AsyncSessionLocal
from app.models.saved_search import SavedSearch, SearchAlert, AlertFrequency
from app.models.property import Property
from app.services.email_service import email_service
from app.core.cache import cache

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.alert_tasks.check_instant_alerts")
def check_instant_alerts():
    """Check and process instant alerts (every 5 minutes)"""
    import asyncio
    return asyncio.run(_check_instant_alerts())


async def _check_instant_alerts():
    """Async implementation of instant alert checking"""
    async with AsyncSessionLocal() as session:
        try:
            # Get all active saved searches with instant alerts
            query = select(SavedSearch).where(
                and_(
                    SavedSearch.is_active == True,
                    SavedSearch.alerts_enabled == True,
                    SavedSearch.alert_frequency == AlertFrequency.INSTANT
                )
            )
            result = await session.execute(query)
            searches = result.scalars().all()

            logger.info(f"Checking {len(searches)} instant alert searches")

            for search in searches:
                await _process_search_alert(session, search)

            await session.commit()
            return {"processed": len(searches)}

        except Exception as e:
            logger.error(f"Error checking instant alerts: {str(e)}")
            await session.rollback()
            raise


@celery_app.task(name="app.tasks.alert_tasks.process_daily_alerts")
def process_daily_alerts():
    """Process daily alerts at configured times"""
    import asyncio
    return asyncio.run(_process_daily_alerts())


async def _process_daily_alerts():
    """Async implementation of daily alert processing"""
    async with AsyncSessionLocal() as session:
        try:
            current_hour = datetime.utcnow().hour

            # Get saved searches with daily alerts scheduled for this hour
            query = select(SavedSearch).where(
                and_(
                    SavedSearch.is_active == True,
                    SavedSearch.alerts_enabled == True,
                    SavedSearch.alert_frequency == AlertFrequency.DAILY,
                    SavedSearch.alert_time == current_hour
                )
            )
            result = await session.execute(query)
            searches = result.scalars().all()

            logger.info(f"Processing {len(searches)} daily alerts for hour {current_hour}")

            for search in searches:
                await _process_search_alert(session, search)

            await session.commit()
            return {"processed": len(searches), "hour": current_hour}

        except Exception as e:
            logger.error(f"Error processing daily alerts: {str(e)}")
            await session.rollback()
            raise


@celery_app.task(name="app.tasks.alert_tasks.process_weekly_alerts")
def process_weekly_alerts():
    """Process weekly alerts on configured day"""
    import asyncio
    return asyncio.run(_process_weekly_alerts())


async def _process_weekly_alerts():
    """Async implementation of weekly alert processing"""
    async with AsyncSessionLocal() as session:
        try:
            current_day = datetime.utcnow().weekday()  # 0=Monday
            current_hour = datetime.utcnow().hour

            # Get saved searches with weekly alerts for this day/hour
            query = select(SavedSearch).where(
                and_(
                    SavedSearch.is_active == True,
                    SavedSearch.alerts_enabled == True,
                    SavedSearch.alert_frequency == AlertFrequency.WEEKLY,
                    SavedSearch.alert_day == current_day,
                    SavedSearch.alert_time == current_hour
                )
            )
            result = await session.execute(query)
            searches = result.scalars().all()

            logger.info(f"Processing {len(searches)} weekly alerts for day {current_day}")

            for search in searches:
                await _process_search_alert(session, search)

            await session.commit()
            return {"processed": len(searches), "day": current_day}

        except Exception as e:
            logger.error(f"Error processing weekly alerts: {str(e)}")
            await session.rollback()
            raise


@celery_app.task(name="app.tasks.alert_tasks.process_monthly_alerts")
def process_monthly_alerts():
    """Process monthly alerts on configured day"""
    import asyncio
    return asyncio.run(_process_monthly_alerts())


async def _process_monthly_alerts():
    """Async implementation of monthly alert processing"""
    async with AsyncSessionLocal() as session:
        try:
            current_day = datetime.utcnow().day
            current_hour = datetime.utcnow().hour

            # Get saved searches with monthly alerts for this day/hour
            query = select(SavedSearch).where(
                and_(
                    SavedSearch.is_active == True,
                    SavedSearch.alerts_enabled == True,
                    SavedSearch.alert_frequency == AlertFrequency.MONTHLY,
                    SavedSearch.alert_day == current_day,
                    SavedSearch.alert_time == current_hour
                )
            )
            result = await session.execute(query)
            searches = result.scalars().all()

            logger.info(f"Processing {len(searches)} monthly alerts for day {current_day}")

            for search in searches:
                await _process_search_alert(session, search)

            await session.commit()
            return {"processed": len(searches), "day": current_day}

        except Exception as e:
            logger.error(f"Error processing monthly alerts: {str(e)}")
            await session.rollback()
            raise


async def _process_search_alert(session, search: SavedSearch):
    """
    Process a single saved search alert

    Args:
        session: Database session
        search: SavedSearch instance to process
    """
    try:
        # Build property query from saved search filters
        filters = search.filters
        query = select(Property).options(
            joinedload(Property.roofiq),
            joinedload(Property.solarfit),
            joinedload(Property.drivewaypro),
            joinedload(Property.permitscope)
        )

        # Apply filters
        conditions = []

        # Location filters
        if filters.get('city'):
            conditions.append(Property.city == filters['city'])
        if filters.get('state'):
            conditions.append(Property.state == filters['state'])
        if filters.get('zip_code'):
            conditions.append(Property.zip_code == filters['zip_code'])

        # Bounding box filter
        if filters.get('bounds'):
            west, south, east, north = filters['bounds']
            conditions.append(and_(
                Property.longitude >= west,
                Property.longitude <= east,
                Property.latitude >= south,
                Property.latitude <= north
            ))

        # Property type filter
        if filters.get('property_type'):
            conditions.append(Property.property_type.in_(filters['property_type']))

        # Only get properties updated since last check
        if search.last_checked_at:
            conditions.append(Property.updated_at > search.last_checked_at)

        if conditions:
            query = query.where(and_(*conditions))

        # Execute query
        result = await session.execute(query)
        properties = result.unique().scalars().all()

        if not properties:
            logger.info(f"No new properties found for search {search.id}")
            search.last_checked_at = datetime.utcnow()
            search.new_matches_since_last_alert = 0
            return

        # Prepare property data for email
        property_data = []
        property_ids = []
        for prop in properties:
            property_ids.append(str(prop.id))
            prop_dict = {
                'id': str(prop.id),
                'address': prop.address,
                'property_type': prop.property_type.value if prop.property_type else 'N/A',
            }
            if prop.roofiq:
                prop_dict['roofiq'] = {'score': prop.roofiq.score}
            if prop.solarfit:
                prop_dict['solarfit'] = {'solar_score': prop.solarfit.solar_score}
            if prop.drivewaypro:
                prop_dict['drivewaypro'] = {'condition_score': prop.drivewaypro.condition_score}

            property_data.append(prop_dict)

        # Send email alert
        success, message_id, error_msg = await email_service.send_property_alert(
            to_email=search.alert_email,
            search_name=search.name,
            properties=property_data,
            search_id=str(search.id),
            unsubscribe_token=None  # TODO: Get from user preferences
        )

        # Create alert record
        alert = SearchAlert(
            saved_search_id=search.id,
            property_count=len(properties),
            property_ids=property_ids,
            email_sent=success,
            sendgrid_message_id=message_id,
            error_message=error_msg
        )
        session.add(alert)

        # Update search statistics
        search.last_checked_at = datetime.utcnow()
        search.total_matches += len(properties)
        search.new_matches_since_last_alert = len(properties)

        logger.info(f"Processed alert for search {search.id}: {len(properties)} properties, email_sent={success}")

    except Exception as e:
        logger.error(f"Error processing search alert {search.id}: {str(e)}")
        raise


@celery_app.task(name="app.tasks.alert_tasks.cleanup_old_alerts")
def cleanup_old_alerts():
    """Cleanup alert history older than 90 days"""
    import asyncio
    return asyncio.run(_cleanup_old_alerts())


async def _cleanup_old_alerts():
    """Async implementation of alert cleanup"""
    async with AsyncSessionLocal() as session:
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=90)

            # Delete old alerts
            from sqlalchemy import delete
            stmt = delete(SearchAlert).where(SearchAlert.sent_at < cutoff_date)
            result = await session.execute(stmt)
            await session.commit()

            deleted_count = result.rowcount
            logger.info(f"Cleaned up {deleted_count} old alerts")

            return {"deleted": deleted_count}

        except Exception as e:
            logger.error(f"Error cleaning up old alerts: {str(e)}")
            await session.rollback()
            raise


@celery_app.task(name="app.tasks.alert_tasks.send_test_alert")
def send_test_alert(search_id: str, recipient_email: str = None):
    """Send a test alert for a saved search"""
    import asyncio
    return asyncio.run(_send_test_alert(search_id, recipient_email))


async def _send_test_alert(search_id: str, recipient_email: str = None):
    """Async implementation of test alert"""
    async with AsyncSessionLocal() as session:
        try:
            from uuid import UUID

            # Get saved search
            query = select(SavedSearch).where(SavedSearch.id == UUID(search_id))
            result = await session.execute(query)
            search = result.scalar_one_or_none()

            if not search:
                return {"success": False, "error": "Search not found"}

            # Use provided email or search's configured email
            email = recipient_email or search.alert_email

            # Send test email
            success, message_id, error_msg = await email_service.send_test_alert(
                to_email=email,
                search_name=search.name
            )

            return {
                "success": success,
                "message_id": message_id,
                "error": error_msg
            }

        except Exception as e:
            logger.error(f"Error sending test alert: {str(e)}")
            return {"success": False, "error": str(e)}
