"""
Saved Searches API Endpoints

REST API for managing saved searches and alerts.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy import select, and_, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.database import get_db
from app.core.cache import cache
from app.models.saved_search import SavedSearch, SearchAlert, UserEmailPreference
from app.schemas.saved_search import (
    SavedSearchCreate,
    SavedSearchUpdate,
    SavedSearchResponse,
    SavedSearchWithAlerts,
    SavedSearchListResponse,
    UserEmailPreferenceUpdate,
    UserEmailPreferenceResponse,
    TestAlertRequest,
    TestAlertResponse
)
from app.tasks.alert_tasks import send_test_alert
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/saved-searches", tags=["saved-searches"])


# TODO: Replace with actual user authentication
async def get_current_user_id() -> UUID:
    """Temporary: Return mock user ID. Replace with actual auth."""
    from uuid import uuid4
    # In production, this would come from JWT token
    return UUID("00000000-0000-0000-0000-000000000001")


@router.post("", response_model=SavedSearchResponse, status_code=201)
async def create_saved_search(
    search: SavedSearchCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Create a new saved search with alert preferences
    """
    try:
        # Create saved search
        db_search = SavedSearch(
            user_id=user_id,
            name=search.name,
            description=search.description,
            filters=search.filters.model_dump(exclude_none=True),
            alerts_enabled=search.alerts_enabled,
            alert_frequency=search.alert_frequency,
            alert_email=search.alert_email,
            alert_time=search.alert_time,
            alert_day=search.alert_day
        )

        db.add(db_search)
        await db.commit()
        await db.refresh(db_search)

        logger.info(f"Created saved search {db_search.id} for user {user_id}")

        return SavedSearchResponse.model_validate(db_search)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating saved search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create saved search: {str(e)}")


@router.get("", response_model=SavedSearchListResponse)
async def list_saved_searches(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    List all saved searches for the current user
    """
    try:
        # Build query
        query = select(SavedSearch).where(SavedSearch.user_id == user_id)

        if active_only:
            query = query.where(SavedSearch.is_active == True)

        query = query.order_by(SavedSearch.created_at.desc())

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Get paginated results
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        searches = result.scalars().all()

        return SavedSearchListResponse(
            searches=[SavedSearchResponse.model_validate(s) for s in searches],
            total=total
        )

    except Exception as e:
        logger.error(f"Error listing saved searches: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list saved searches: {str(e)}")


@router.get("/{search_id}", response_model=SavedSearchWithAlerts)
async def get_saved_search(
    search_id: UUID,
    include_alerts: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Get a specific saved search with optional alert history
    """
    try:
        # Build query with optional alert history
        query = select(SavedSearch).where(
            and_(
                SavedSearch.id == search_id,
                SavedSearch.user_id == user_id
            )
        )

        if include_alerts:
            query = query.options(joinedload(SavedSearch.alert_history))

        result = await db.execute(query)
        search = result.unique().scalar_one_or_none()

        if not search:
            raise HTTPException(status_code=404, detail="Saved search not found")

        return SavedSearchWithAlerts.model_validate(search)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting saved search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get saved search: {str(e)}")


@router.patch("/{search_id}", response_model=SavedSearchResponse)
async def update_saved_search(
    search_id: UUID,
    updates: SavedSearchUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Update a saved search
    """
    try:
        # Get existing search
        query = select(SavedSearch).where(
            and_(
                SavedSearch.id == search_id,
                SavedSearch.user_id == user_id
            )
        )
        result = await db.execute(query)
        search = result.scalar_one_or_none()

        if not search:
            raise HTTPException(status_code=404, detail="Saved search not found")

        # Update fields
        update_data = updates.model_dump(exclude_none=True)
        for field, value in update_data.items():
            if field == 'filters':
                # Convert Pydantic model to dict
                setattr(search, field, value.model_dump(exclude_none=True))
            else:
                setattr(search, field, value)

        search.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(search)

        logger.info(f"Updated saved search {search_id}")

        return SavedSearchResponse.model_validate(search)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating saved search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update saved search: {str(e)}")


@router.delete("/{search_id}", status_code=204)
async def delete_saved_search(
    search_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Delete a saved search (soft delete by setting is_active=False)
    """
    try:
        # Get existing search
        query = select(SavedSearch).where(
            and_(
                SavedSearch.id == search_id,
                SavedSearch.user_id == user_id
            )
        )
        result = await db.execute(query)
        search = result.scalar_one_or_none()

        if not search:
            raise HTTPException(status_code=404, detail="Saved search not found")

        # Soft delete
        search.is_active = False
        search.alerts_enabled = False
        search.updated_at = datetime.utcnow()

        await db.commit()

        logger.info(f"Deleted saved search {search_id}")

        return None

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting saved search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete saved search: {str(e)}")


@router.post("/{search_id}/test-alert", response_model=TestAlertResponse)
async def test_search_alert(
    search_id: UUID,
    test_request: Optional[TestAlertRequest] = None,
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Send a test alert email for a saved search
    """
    try:
        # Verify search exists and belongs to user
        query = select(SavedSearch).where(
            and_(
                SavedSearch.id == search_id,
                SavedSearch.user_id == user_id
            )
        )
        result = await db.execute(query)
        search = result.scalar_one_or_none()

        if not search:
            raise HTTPException(status_code=404, detail="Saved search not found")

        # Use provided email or search's configured email
        recipient_email = test_request.recipient_email if test_request else None

        # Trigger background task to send test email
        background_tasks.add_task(
            send_test_alert,
            search_id=str(search_id),
            recipient_email=recipient_email
        )

        logger.info(f"Queued test alert for search {search_id}")

        return TestAlertResponse(
            success=True,
            message="Test alert queued successfully",
            property_count=0,
            email_sent=False
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test alert: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send test alert: {str(e)}")


@router.get("/{search_id}/alerts", response_model=list)
async def get_alert_history(
    search_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Get alert history for a saved search
    """
    try:
        # Verify search belongs to user
        search_query = select(SavedSearch).where(
            and_(
                SavedSearch.id == search_id,
                SavedSearch.user_id == user_id
            )
        )
        search_result = await db.execute(search_query)
        if not search_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Saved search not found")

        # Get alert history
        alerts_query = select(SearchAlert).where(
            SearchAlert.saved_search_id == search_id
        ).order_by(SearchAlert.sent_at.desc()).offset(skip).limit(limit)

        result = await db.execute(alerts_query)
        alerts = result.scalars().all()

        from app.schemas.saved_search import SearchAlertResponse
        return [SearchAlertResponse.model_validate(alert) for alert in alerts]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting alert history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get alert history: {str(e)}")


# Email Preferences Endpoints

@router.get("/preferences/email", response_model=UserEmailPreferenceResponse)
async def get_email_preferences(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Get user email preferences
    """
    try:
        query = select(UserEmailPreference).where(UserEmailPreference.user_id == user_id)
        result = await db.execute(query)
        preferences = result.scalar_one_or_none()

        if not preferences:
            raise HTTPException(status_code=404, detail="Email preferences not found")

        return UserEmailPreferenceResponse.model_validate(preferences)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting email preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get email preferences: {str(e)}")


@router.patch("/preferences/email", response_model=UserEmailPreferenceResponse)
async def update_email_preferences(
    updates: UserEmailPreferenceUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Update user email preferences
    """
    try:
        query = select(UserEmailPreference).where(UserEmailPreference.user_id == user_id)
        result = await db.execute(query)
        preferences = result.scalar_one_or_none()

        if not preferences:
            # Create new preferences if they don't exist
            preferences = UserEmailPreference(
                user_id=user_id,
                email=updates.email or "user@example.com"  # TODO: Get from user profile
            )
            db.add(preferences)

        # Update fields
        update_data = updates.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(preferences, field, value)

        preferences.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(preferences)

        logger.info(f"Updated email preferences for user {user_id}")

        return UserEmailPreferenceResponse.model_validate(preferences)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating email preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update email preferences: {str(e)}")
