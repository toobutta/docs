"""
Saved Search Schemas

Pydantic schemas for saved search request/response validation.
"""
from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, field_validator

from app.schemas.property import PropertyFilters


class AlertFrequencyEnum(str):
    """Alert frequency options"""
    INSTANT = "instant"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class SavedSearchCreate(BaseModel):
    """Schema for creating a new saved search"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    filters: PropertyFilters
    alerts_enabled: bool = True
    alert_frequency: str = Field(default="daily", pattern="^(instant|daily|weekly|monthly)$")
    alert_email: EmailStr
    alert_time: Optional[int] = Field(9, ge=0, le=23)  # Hour of day
    alert_day: Optional[int] = Field(None, ge=0, le=6)  # Day of week

    @field_validator('alert_day')
    @classmethod
    def validate_alert_day(cls, v, info):
        frequency = info.data.get('alert_frequency')
        if frequency in ['weekly', 'monthly'] and v is None:
            raise ValueError(f'alert_day is required for {frequency} alerts')
        return v


class SavedSearchUpdate(BaseModel):
    """Schema for updating a saved search"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    filters: Optional[PropertyFilters] = None
    alerts_enabled: Optional[bool] = None
    alert_frequency: Optional[str] = Field(None, pattern="^(instant|daily|weekly|monthly)$")
    alert_email: Optional[EmailStr] = None
    alert_time: Optional[int] = Field(None, ge=0, le=23)
    alert_day: Optional[int] = Field(None, ge=0, le=6)
    is_active: Optional[bool] = None


class SearchAlertResponse(BaseModel):
    """Schema for search alert history response"""
    id: UUID
    sent_at: datetime
    property_count: int
    email_sent: bool
    email_opened: bool
    email_clicked: bool
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class SavedSearchResponse(BaseModel):
    """Schema for saved search response"""
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    last_checked_at: Optional[datetime]
    filters: dict  # PropertyFilters as dict
    alerts_enabled: bool
    alert_frequency: str
    alert_email: str
    alert_time: Optional[int]
    alert_day: Optional[int]
    total_matches: int
    new_matches_since_last_alert: int
    is_active: bool

    class Config:
        from_attributes = True


class SavedSearchWithAlerts(SavedSearchResponse):
    """Schema for saved search with alert history"""
    alert_history: List[SearchAlertResponse] = []

    class Config:
        from_attributes = True


class SavedSearchListResponse(BaseModel):
    """Schema for list of saved searches"""
    searches: List[SavedSearchResponse]
    total: int


class UserEmailPreferenceUpdate(BaseModel):
    """Schema for updating user email preferences"""
    email: Optional[EmailStr] = None
    all_alerts_enabled: Optional[bool] = None
    marketing_emails_enabled: Optional[bool] = None
    daily_digest_enabled: Optional[bool] = None
    daily_digest_time: Optional[int] = Field(None, ge=0, le=23)
    weekly_digest_enabled: Optional[bool] = None
    weekly_digest_day: Optional[int] = Field(None, ge=0, le=6)
    weekly_digest_time: Optional[int] = Field(None, ge=0, le=23)


class UserEmailPreferenceResponse(BaseModel):
    """Schema for user email preferences response"""
    id: UUID
    user_id: UUID
    email: str
    all_alerts_enabled: bool
    marketing_emails_enabled: bool
    daily_digest_enabled: bool
    daily_digest_time: int
    weekly_digest_enabled: bool
    weekly_digest_day: int
    weekly_digest_time: int
    unsubscribed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestAlertRequest(BaseModel):
    """Schema for testing an alert"""
    saved_search_id: UUID
    recipient_email: Optional[EmailStr] = None  # Override email for testing


class TestAlertResponse(BaseModel):
    """Schema for test alert response"""
    success: bool
    message: str
    property_count: int
    email_sent: bool
    sendgrid_message_id: Optional[str] = None
