"""
Google Ads Background Tasks

Celery tasks for syncing audiences to Google Ads Customer Match.
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
import logging

from app.tasks.celery_app import celery_app
from app.core.database import AsyncSessionLocal
from app.models.google_ads import (
    GoogleAdsAccount,
    CustomerMatchAudience,
    AudienceSyncHistory,
    AudienceSyncStatus,
)
from app.models.property import Property
from app.services.google_ads_service import google_ads_service

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.google_ads_tasks.sync_audience_to_google_ads")
def sync_audience_to_google_ads(audience_id: str, sync_id: Optional[str] = None):
    """Sync audience to Google Ads Customer Match"""
    import asyncio
    return asyncio.run(_sync_audience_to_google_ads(audience_id, sync_id))


async def _sync_audience_to_google_ads(audience_id: str, sync_id: Optional[str] = None):
    """Async implementation of audience sync"""
    async with AsyncSessionLocal() as session:
        try:
            from uuid import UUID

            # Get audience with account
            query = (
                select(CustomerMatchAudience)
                .where(CustomerMatchAudience.id == UUID(audience_id))
                .options(joinedload(CustomerMatchAudience.google_ads_account))
            )
            result = await session.execute(query)
            audience = result.unique().scalar_one_or_none()

            if not audience:
                logger.error(f"Audience {audience_id} not found")
                return {"success": False, "error": "Audience not found"}

            account = audience.google_ads_account

            # Create or get sync record
            if sync_id:
                sync_query = select(AudienceSyncHistory).where(
                    AudienceSyncHistory.id == UUID(sync_id)
                )
                sync_result = await session.execute(sync_query)
                sync_record = sync_result.scalar_one_or_none()
            else:
                sync_record = AudienceSyncHistory(
                    audience_id=UUID(audience_id),
                    status=AudienceSyncStatus.PENDING,
                    triggered_by="auto_sync",
                )
                session.add(sync_record)
                await session.commit()
                await session.refresh(sync_record)

            # Update status to in progress
            sync_record.status = AudienceSyncStatus.IN_PROGRESS
            audience.sync_status = AudienceSyncStatus.IN_PROGRESS
            await session.commit()

            # Refresh access token if needed
            if account.token_expires_at and account.token_expires_at < datetime.utcnow():
                try:
                    new_token, expires_at = await google_ads_service.refresh_access_token(
                        account.refresh_token
                    )
                    account.access_token = new_token
                    account.token_expires_at = expires_at
                    await session.commit()
                except Exception as e:
                    logger.error(f"Failed to refresh token: {str(e)}")
                    raise

            # Create user list in Google Ads if not exists
            if not audience.user_list_resource_name:
                try:
                    resource_name, user_list_id = await google_ads_service.create_customer_match_user_list(
                        customer_id=account.customer_id,
                        access_token=account.access_token,
                        refresh_token=account.refresh_token,
                        name=audience.name,
                        description=audience.description or "",
                    )

                    audience.user_list_resource_name = resource_name
                    audience.user_list_id = user_list_id
                    await session.commit()

                    logger.info(f"Created user list {resource_name} for audience {audience_id}")

                except Exception as e:
                    logger.error(f"Failed to create user list: {str(e)}")
                    raise

            # Query properties based on filters
            filters = audience.property_filters
            prop_query = select(Property).options(
                joinedload(Property.roofiq),
                joinedload(Property.solarfit),
                joinedload(Property.drivewaypro),
                joinedload(Property.permitscope),
            )

            # Apply filters
            conditions = []

            if filters.get("city"):
                conditions.append(Property.city == filters["city"])
            if filters.get("state"):
                conditions.append(Property.state == filters["state"])
            if filters.get("zip_code"):
                conditions.append(Property.zip_code == filters["zip_code"])

            if filters.get("bounds"):
                west, south, east, north = filters["bounds"]
                conditions.append(
                    and_(
                        Property.longitude >= west,
                        Property.longitude <= east,
                        Property.latitude >= south,
                        Property.latitude <= north,
                    )
                )

            if filters.get("property_type"):
                conditions.append(Property.property_type.in_(filters["property_type"]))

            if conditions:
                prop_query = prop_query.where(and_(*conditions))

            # Limit to avoid memory issues
            prop_query = prop_query.limit(50000)

            prop_result = await session.execute(prop_query)
            properties = prop_result.unique().scalars().all()

            sync_record.properties_processed = len(properties)
            audience.total_properties = len(properties)

            # Extract contact data
            contacts = []
            seen_contacts = set()

            for prop in properties:
                # Extract email and phone if available
                # In production, these would come from property owner data
                # For now, we'll generate sample data based on property ID
                contact_key = f"{prop.id}"

                if contact_key not in seen_contacts:
                    seen_contacts.add(contact_key)

                    contact = {}

                    # In production, get from property.owner_email, property.owner_phone
                    # For demo, we'll skip actual contact upload
                    if prop.address:
                        # Generate demo email from address
                        email_local = prop.address.lower().replace(" ", ".")[:20]
                        contact["email"] = f"{email_local}@example.com"

                    if prop.zip_code:
                        contact["zip_code"] = prop.zip_code
                        contact["country_code"] = "US"

                    if contact.get("email"):
                        contacts.append(contact)

            sync_record.contacts_uploaded = len(contacts)
            audience.total_contacts = len(contacts)

            # Upload contacts to Google Ads
            if contacts:
                try:
                    upload_result = await google_ads_service.upload_customer_match_data(
                        customer_id=account.customer_id,
                        access_token=account.access_token,
                        refresh_token=account.refresh_token,
                        user_list_resource_name=audience.user_list_resource_name,
                        contacts=contacts,
                    )

                    audience.uploaded_count = upload_result["total_uploaded"]
                    sync_record.contacts_uploaded = upload_result["total_uploaded"]

                    logger.info(
                        f"Uploaded {upload_result['total_uploaded']} contacts for audience {audience_id}"
                    )

                except Exception as e:
                    logger.error(f"Failed to upload contacts: {str(e)}")
                    raise

            # Wait a bit then get stats from Google Ads
            import asyncio
            await asyncio.sleep(5)

            try:
                stats = await google_ads_service.get_user_list_stats(
                    customer_id=account.customer_id,
                    access_token=account.access_token,
                    refresh_token=account.refresh_token,
                    user_list_resource_name=audience.user_list_resource_name,
                )

                audience.matched_count = stats.get("size_for_display", 0)
                audience.match_rate = stats.get("match_rate_percentage", 0)
                sync_record.contacts_matched = stats.get("size_for_display", 0)

            except Exception as e:
                logger.warning(f"Failed to get user list stats: {str(e)}")

            # Update sync record
            sync_record.status = AudienceSyncStatus.COMPLETED
            sync_record.completed_at = datetime.utcnow()

            # Update audience
            audience.sync_status = AudienceSyncStatus.COMPLETED
            audience.last_sync_at = datetime.utcnow()

            if audience.auto_sync_enabled:
                audience.next_sync_at = datetime.utcnow() + timedelta(
                    hours=audience.sync_frequency_hours
                )

            # Update account last sync
            account.last_sync_at = datetime.utcnow()

            await session.commit()

            logger.info(f"Successfully synced audience {audience_id}")

            return {
                "success": True,
                "audience_id": str(audience_id),
                "contacts_uploaded": audience.uploaded_count,
                "contacts_matched": audience.matched_count,
                "match_rate": audience.match_rate,
            }

        except Exception as e:
            logger.error(f"Error syncing audience {audience_id}: {str(e)}")

            # Update sync record with error
            if sync_record:
                sync_record.status = AudienceSyncStatus.FAILED
                sync_record.error_message = str(e)
                sync_record.completed_at = datetime.utcnow()

            # Update audience
            if audience:
                audience.sync_status = AudienceSyncStatus.FAILED
                audience.last_error = str(e)

            await session.commit()

            return {"success": False, "error": str(e)}


@celery_app.task(name="app.tasks.google_ads_tasks.process_auto_sync_audiences")
def process_auto_sync_audiences():
    """Process audiences with auto-sync enabled"""
    import asyncio
    return asyncio.run(_process_auto_sync_audiences())


async def _process_auto_sync_audiences():
    """Async implementation of auto-sync processing"""
    async with AsyncSessionLocal() as session:
        try:
            # Get audiences due for sync
            query = select(CustomerMatchAudience).where(
                and_(
                    CustomerMatchAudience.auto_sync_enabled == True,
                    CustomerMatchAudience.next_sync_at <= datetime.utcnow(),
                )
            )
            result = await session.execute(query)
            audiences = result.scalars().all()

            logger.info(f"Processing {len(audiences)} audiences for auto-sync")

            for audience in audiences:
                # Queue sync task
                sync_audience_to_google_ads.delay(str(audience.id))

            return {"processed": len(audiences)}

        except Exception as e:
            logger.error(f"Error processing auto-sync audiences: {str(e)}")
            raise
