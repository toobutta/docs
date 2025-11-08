"""
Google Ads API Endpoints

REST API for Google Ads Customer Match integration.
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from google_auth_oauthlib.flow import Flow
from datetime import datetime
import secrets
import logging

from app.core.database import get_db
from app.core.config import settings
from app.models.google_ads import (
    GoogleAdsAccount,
    CustomerMatchAudience,
    AudienceSyncHistory,
    GoogleAdsAccountStatus,
    AudienceSyncStatus
)
from app.models.property import Property
from app.schemas.google_ads import (
    GoogleAdsAuthURL,
    GoogleAdsOAuthCallback,
    GoogleAdsAccountResponse,
    GoogleAdsAccountStatistics,
    CustomerMatchAudienceCreate,
    CustomerMatchAudienceUpdate,
    CustomerMatchAudienceResponse,
    CustomerMatchAudienceWithHistory,
    AudienceListResponse,
    AudienceSyncRequest,
    AudienceSyncResponse,
    AudienceStatistics,
)
from app.services.google_ads_service import google_ads_service
from app.tasks.google_ads_tasks import sync_audience_to_google_ads

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/google-ads", tags=["google-ads"])

# Session storage for OAuth state (in production, use Redis)
oauth_states = {}


async def get_current_user_id() -> UUID:
    """Temporary: Return mock user ID. Replace with actual auth."""
    return UUID("00000000-0000-0000-0000-000000000001")


# OAuth Flow Endpoints

@router.get("/auth/url", response_model=GoogleAdsAuthURL)
async def get_authorization_url(
    user_id: UUID = Depends(get_current_user_id)
):
    """
    Get Google Ads OAuth authorization URL
    """
    try:
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_ADS_CLIENT_ID,
                    "client_secret": settings.GOOGLE_ADS_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_ADS_REDIRECT_URI],
                }
            },
            scopes=["https://www.googleapis.com/auth/adwords"],
            redirect_uri=settings.GOOGLE_ADS_REDIRECT_URI,
        )

        # Generate state token
        state = secrets.token_urlsafe(32)
        oauth_states[state] = {"user_id": str(user_id), "created_at": datetime.utcnow()}

        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            state=state,
            prompt="consent",  # Force consent to get refresh token
        )

        return GoogleAdsAuthURL(auth_url=auth_url, state=state)

    except Exception as e:
        logger.error(f"Error generating auth URL: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate authorization URL")


@router.post("/auth/callback", response_model=GoogleAdsAccountResponse)
async def oauth_callback(
    callback_data: GoogleAdsOAuthCallback,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Handle OAuth callback and create Google Ads account connection
    """
    try:
        # Validate state
        if callback_data.state not in oauth_states:
            raise HTTPException(status_code=400, detail="Invalid state token")

        state_data = oauth_states.pop(callback_data.state)

        # Exchange code for tokens
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_ADS_CLIENT_ID,
                    "client_secret": settings.GOOGLE_ADS_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_ADS_REDIRECT_URI],
                }
            },
            scopes=["https://www.googleapis.com/auth/adwords"],
            redirect_uri=settings.GOOGLE_ADS_REDIRECT_URI,
        )

        flow.fetch_token(code=callback_data.code)
        credentials = flow.credentials

        # Get account info - user needs to provide customer ID
        # For now, we'll create a pending account
        account = GoogleAdsAccount(
            user_id=user_id,
            customer_id="0000000000",  # Placeholder, will be updated
            access_token=credentials.token,
            refresh_token=credentials.refresh_token,
            token_expires_at=credentials.expiry,
            status=GoogleAdsAccountStatus.PENDING,
        )

        db.add(account)
        await db.commit()
        await db.refresh(account)

        logger.info(f"Created Google Ads account connection for user {user_id}")

        return GoogleAdsAccountResponse.model_validate(account)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"OAuth callback error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to complete OAuth flow")


# Account Management Endpoints

@router.get("/accounts", response_model=list[GoogleAdsAccountResponse])
async def list_google_ads_accounts(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """List all Google Ads accounts for current user"""
    try:
        query = select(GoogleAdsAccount).where(
            GoogleAdsAccount.user_id == user_id
        ).order_by(GoogleAdsAccount.created_at.desc())

        result = await db.execute(query)
        accounts = result.scalars().all()

        return [GoogleAdsAccountResponse.model_validate(acc) for acc in accounts]

    except Exception as e:
        logger.error(f"Error listing accounts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list accounts")


@router.patch("/accounts/{account_id}/customer-id")
async def update_customer_id(
    account_id: UUID,
    customer_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Update customer ID and fetch account details"""
    try:
        query = select(GoogleAdsAccount).where(
            and_(
                GoogleAdsAccount.id == account_id,
                GoogleAdsAccount.user_id == user_id,
            )
        )
        result = await db.execute(query)
        account = result.scalar_one_or_none()

        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        # Update customer ID
        account.customer_id = customer_id

        # Fetch account details from Google Ads
        try:
            account_info = await google_ads_service.get_account_info(
                customer_id=customer_id,
                access_token=account.access_token,
                refresh_token=account.refresh_token,
            )

            account.account_name = account_info["account_name"]
            account.currency_code = account_info["currency_code"]
            account.time_zone = account_info["time_zone"]
            account.status = GoogleAdsAccountStatus.CONNECTED

        except Exception as e:
            account.status = GoogleAdsAccountStatus.ERROR
            account.last_error = str(e)
            account.last_error_at = datetime.utcnow()

        await db.commit()
        await db.refresh(account)

        return GoogleAdsAccountResponse.model_validate(account)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating customer ID: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update customer ID")


@router.delete("/accounts/{account_id}", status_code=204)
async def disconnect_account(
    account_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Disconnect Google Ads account"""
    try:
        query = select(GoogleAdsAccount).where(
            and_(
                GoogleAdsAccount.id == account_id,
                GoogleAdsAccount.user_id == user_id,
            )
        )
        result = await db.execute(query)
        account = result.scalar_one_or_none()

        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        account.is_active = False
        account.status = GoogleAdsAccountStatus.DISCONNECTED

        await db.commit()

        logger.info(f"Disconnected Google Ads account {account_id}")

        return None

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error disconnecting account: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to disconnect account")


# Audience Management Endpoints

@router.post("/audiences", response_model=CustomerMatchAudienceResponse, status_code=201)
async def create_audience(
    audience_data: CustomerMatchAudienceCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Create a new Customer Match audience"""
    try:
        # Get active Google Ads account
        query = select(GoogleAdsAccount).where(
            and_(
                GoogleAdsAccount.user_id == user_id,
                GoogleAdsAccount.is_active == True,
                GoogleAdsAccount.status == GoogleAdsAccountStatus.CONNECTED,
            )
        )
        result = await db.execute(query)
        account = result.scalar_one_or_none()

        if not account:
            raise HTTPException(
                status_code=400,
                detail="No active Google Ads account. Please connect an account first.",
            )

        # Create audience record
        audience = CustomerMatchAudience(
            google_ads_account_id=account.id,
            user_id=user_id,
            name=audience_data.name,
            description=audience_data.description,
            property_filters=audience_data.property_filters.model_dump(exclude_none=True),
            auto_sync_enabled=audience_data.auto_sync_enabled,
            sync_frequency_hours=audience_data.sync_frequency_hours,
        )

        db.add(audience)
        await db.commit()
        await db.refresh(audience)

        # Trigger initial sync in background
        background_tasks.add_task(
            sync_audience_to_google_ads,
            audience_id=str(audience.id),
        )

        logger.info(f"Created audience {audience.id}, queued for sync")

        return CustomerMatchAudienceResponse.model_validate(audience)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating audience: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create audience")


@router.get("/audiences", response_model=AudienceListResponse)
async def list_audiences(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """List all Customer Match audiences"""
    try:
        query = select(CustomerMatchAudience).where(
            CustomerMatchAudience.user_id == user_id
        ).order_by(CustomerMatchAudience.created_at.desc())

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Get paginated results
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        audiences = result.scalars().all()

        return AudienceListResponse(
            audiences=[CustomerMatchAudienceResponse.model_validate(a) for a in audiences],
            total=total,
        )

    except Exception as e:
        logger.error(f"Error listing audiences: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list audiences")


@router.get("/audiences/{audience_id}", response_model=CustomerMatchAudienceWithHistory)
async def get_audience(
    audience_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Get audience details with sync history"""
    try:
        query = select(CustomerMatchAudience).where(
            and_(
                CustomerMatchAudience.id == audience_id,
                CustomerMatchAudience.user_id == user_id,
            )
        ).options(joinedload(CustomerMatchAudience.sync_history))

        result = await db.execute(query)
        audience = result.unique().scalar_one_or_none()

        if not audience:
            raise HTTPException(status_code=404, detail="Audience not found")

        return CustomerMatchAudienceWithHistory.model_validate(audience)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting audience: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get audience")


@router.patch("/audiences/{audience_id}", response_model=CustomerMatchAudienceResponse)
async def update_audience(
    audience_id: UUID,
    updates: CustomerMatchAudienceUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Update audience settings"""
    try:
        query = select(CustomerMatchAudience).where(
            and_(
                CustomerMatchAudience.id == audience_id,
                CustomerMatchAudience.user_id == user_id,
            )
        )
        result = await db.execute(query)
        audience = result.scalar_one_or_none()

        if not audience:
            raise HTTPException(status_code=404, detail="Audience not found")

        # Update fields
        update_data = updates.model_dump(exclude_none=True)
        for field, value in update_data.items():
            if field == "property_filters":
                setattr(audience, field, value.model_dump(exclude_none=True))
            else:
                setattr(audience, field, value)

        audience.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(audience)

        logger.info(f"Updated audience {audience_id}")

        return CustomerMatchAudienceResponse.model_validate(audience)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating audience: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update audience")


@router.post("/audiences/{audience_id}/sync", response_model=AudienceSyncResponse)
async def trigger_audience_sync(
    audience_id: UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Manually trigger audience sync to Google Ads"""
    try:
        query = select(CustomerMatchAudience).where(
            and_(
                CustomerMatchAudience.id == audience_id,
                CustomerMatchAudience.user_id == user_id,
            )
        )
        result = await db.execute(query)
        audience = result.scalar_one_or_none()

        if not audience:
            raise HTTPException(status_code=404, detail="Audience not found")

        # Create sync history record
        sync_record = AudienceSyncHistory(
            audience_id=audience.id,
            status=AudienceSyncStatus.PENDING,
            triggered_by="manual",
        )
        db.add(sync_record)
        await db.commit()
        await db.refresh(sync_record)

        # Queue sync task
        background_tasks.add_task(
            sync_audience_to_google_ads,
            audience_id=str(audience_id),
            sync_id=str(sync_record.id),
        )

        logger.info(f"Queued sync for audience {audience_id}")

        return AudienceSyncResponse(
            sync_id=sync_record.id,
            status="pending",
            message="Sync queued successfully",
            estimated_contacts=audience.total_contacts,
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error triggering sync: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to trigger sync")


@router.get("/statistics", response_model=GoogleAdsAccountStatistics)
async def get_account_statistics(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Get Google Ads account statistics"""
    try:
        # Get active account
        acc_query = select(GoogleAdsAccount).where(
            and_(
                GoogleAdsAccount.user_id == user_id,
                GoogleAdsAccount.is_active == True,
            )
        )
        acc_result = await db.execute(acc_query)
        account = acc_result.scalar_one_or_none()

        if not account:
            raise HTTPException(status_code=404, detail="No active Google Ads account")

        # Get audience statistics
        aud_query = select(CustomerMatchAudience).where(
            CustomerMatchAudience.google_ads_account_id == account.id
        )
        aud_result = await db.execute(aud_query)
        audiences = aud_result.scalars().all()

        total_audiences = len(audiences)
        active_audiences = sum(1 for a in audiences if a.sync_status == AudienceSyncStatus.COMPLETED)
        total_contacts = sum(a.total_contacts for a in audiences)
        total_synced = sum(a.uploaded_count for a in audiences)
        avg_match_rate = (
            sum(a.match_rate for a in audiences) / total_audiences if total_audiences > 0 else 0
        )

        # Get recent syncs
        sync_query = (
            select(AudienceSyncHistory)
            .join(CustomerMatchAudience)
            .where(CustomerMatchAudience.google_ads_account_id == account.id)
            .order_by(AudienceSyncHistory.started_at.desc())
            .limit(10)
        )
        sync_result = await db.execute(sync_query)
        recent_syncs = sync_result.scalars().all()

        from app.schemas.google_ads import AudienceSyncHistoryResponse

        return GoogleAdsAccountStatistics(
            account=GoogleAdsAccountResponse.model_validate(account),
            statistics=AudienceStatistics(
                total_audiences=total_audiences,
                active_audiences=active_audiences,
                total_contacts=total_contacts,
                total_synced=total_synced,
                average_match_rate=avg_match_rate,
                last_sync=account.last_sync_at,
            ),
            recent_syncs=[AudienceSyncHistoryResponse.model_validate(s) for s in recent_syncs],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get statistics")
