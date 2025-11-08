"""
Google Ads Schemas

Pydantic schemas for Google Ads Customer Match integration.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl

from app.schemas.property import PropertyFilters


class GoogleAdsAccountStatus(str):
    """Account status enum"""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    PENDING = "pending"


class AudienceSyncStatus(str):
    """Sync status enum"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"


# OAuth Flow Schemas

class GoogleAdsAuthURL(BaseModel):
    """Schema for OAuth authorization URL"""
    auth_url: HttpUrl
    state: str  # CSRF token


class GoogleAdsOAuthCallback(BaseModel):
    """Schema for OAuth callback"""
    code: str
    state: str


class GoogleAdsTokenResponse(BaseModel):
    """Schema for OAuth token response"""
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: int
    token_type: str = "Bearer"


# Account Schemas

class GoogleAdsAccountCreate(BaseModel):
    """Schema for creating Google Ads account connection"""
    customer_id: str = Field(..., pattern=r'^\d{10}$', description="10-digit customer ID")
    access_token: str
    refresh_token: str


class GoogleAdsAccountResponse(BaseModel):
    """Schema for Google Ads account response"""
    id: UUID
    user_id: UUID
    customer_id: str
    account_name: Optional[str]
    currency_code: Optional[str]
    time_zone: Optional[str]
    status: str
    is_active: bool
    last_error: Optional[str]
    last_sync_at: Optional[datetime]
    connected_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Audience Schemas

class CustomerMatchAudienceCreate(BaseModel):
    """Schema for creating a Customer Match audience"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    property_filters: PropertyFilters
    auto_sync_enabled: bool = False
    sync_frequency_hours: int = Field(24, ge=1, le=168)  # 1 hour to 1 week


class CustomerMatchAudienceUpdate(BaseModel):
    """Schema for updating a Customer Match audience"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    property_filters: Optional[PropertyFilters] = None
    auto_sync_enabled: Optional[bool] = None
    sync_frequency_hours: Optional[int] = Field(None, ge=1, le=168)


class AudienceSyncHistoryResponse(BaseModel):
    """Schema for sync history response"""
    id: UUID
    started_at: datetime
    completed_at: Optional[datetime]
    status: str
    properties_processed: int
    contacts_uploaded: int
    contacts_matched: int
    failed_count: int
    error_message: Optional[str]
    triggered_by: Optional[str]

    class Config:
        from_attributes = True


class CustomerMatchAudienceResponse(BaseModel):
    """Schema for Customer Match audience response"""
    id: UUID
    google_ads_account_id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    user_list_resource_name: Optional[str]
    user_list_id: Optional[str]
    property_filters: dict
    total_properties: int
    total_contacts: int
    uploaded_count: int
    matched_count: int
    match_rate: int
    sync_status: str
    last_sync_at: Optional[datetime]
    next_sync_at: Optional[datetime]
    auto_sync_enabled: bool
    sync_frequency_hours: int
    last_error: Optional[str]
    failed_records_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomerMatchAudienceWithHistory(CustomerMatchAudienceResponse):
    """Schema for audience with sync history"""
    sync_history: List[AudienceSyncHistoryResponse] = []

    class Config:
        from_attributes = True


class AudienceListResponse(BaseModel):
    """Schema for list of audiences"""
    audiences: List[CustomerMatchAudienceResponse]
    total: int


# Sync Schemas

class AudienceSyncRequest(BaseModel):
    """Schema for triggering audience sync"""
    audience_id: UUID
    force_refresh: bool = False


class AudienceSyncResponse(BaseModel):
    """Schema for sync response"""
    sync_id: UUID
    status: str
    message: str
    estimated_contacts: int


class ContactData(BaseModel):
    """Schema for contact data to upload"""
    email: Optional[str] = None
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    country_code: str = "US"
    zip_code: Optional[str] = None


class AudienceExportRequest(BaseModel):
    """Schema for exporting audience data"""
    property_filters: PropertyFilters
    include_email: bool = True
    include_phone: bool = True
    include_address: bool = False


class AudienceExportResponse(BaseModel):
    """Schema for export response"""
    total_properties: int
    total_contacts: int
    contacts: List[ContactData]
    export_id: UUID
    created_at: datetime


# Statistics Schemas

class AudienceStatistics(BaseModel):
    """Schema for audience statistics"""
    total_audiences: int
    active_audiences: int
    total_contacts: int
    total_synced: int
    average_match_rate: float
    last_sync: Optional[datetime]


class GoogleAdsAccountStatistics(BaseModel):
    """Schema for account-level statistics"""
    account: GoogleAdsAccountResponse
    statistics: AudienceStatistics
    recent_syncs: List[AudienceSyncHistoryResponse]
