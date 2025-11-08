"""
Google Ads Integration Models

Database models for Google Ads Customer Match integration.
"""
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Boolean, DateTime, Integer, JSON, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class GoogleAdsAccountStatus(str, PyEnum):
    """Google Ads account connection status"""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    PENDING = "pending"


class AudienceSyncStatus(str, PyEnum):
    """Audience sync status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"  # Some records failed


class GoogleAdsAccount(Base):
    """Google Ads account connection"""
    __tablename__ = "google_ads_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Google Ads account details
    customer_id = Column(String(50), nullable=False, unique=True, index=True)
    account_name = Column(String(255))
    currency_code = Column(String(3))
    time_zone = Column(String(50))

    # OAuth credentials (encrypted in production)
    access_token = Column(Text)
    refresh_token = Column(Text)
    token_expires_at = Column(DateTime)

    # Account status
    status = Column(Enum(GoogleAdsAccountStatus), default=GoogleAdsAccountStatus.PENDING, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Error tracking
    last_error = Column(Text)
    last_error_at = Column(DateTime)

    # Timestamps
    connected_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_sync_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    audiences = relationship("CustomerMatchAudience", back_populates="google_ads_account", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<GoogleAdsAccount(customer_id={self.customer_id}, status={self.status})>"


class CustomerMatchAudience(Base):
    """Customer Match audience in Google Ads"""
    __tablename__ = "customer_match_audiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_ads_account_id = Column(UUID(as_uuid=True), ForeignKey("google_ads_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Audience details
    name = Column(String(255), nullable=False)
    description = Column(Text)

    # Google Ads resource names
    user_list_resource_name = Column(String(500))  # e.g., customers/{customer_id}/userLists/{user_list_id}
    user_list_id = Column(String(50))

    # Property filters used to build this audience
    property_filters = Column(JSON, nullable=False)

    # Audience statistics
    total_properties = Column(Integer, default=0, nullable=False)
    total_contacts = Column(Integer, default=0, nullable=False)  # Unique emails/phones
    uploaded_count = Column(Integer, default=0, nullable=False)
    matched_count = Column(Integer, default=0, nullable=False)  # Matched by Google
    match_rate = Column(Integer, default=0, nullable=False)  # Percentage

    # Sync status
    sync_status = Column(Enum(AudienceSyncStatus), default=AudienceSyncStatus.PENDING, nullable=False)
    last_sync_at = Column(DateTime)
    next_sync_at = Column(DateTime)

    # Auto-sync settings
    auto_sync_enabled = Column(Boolean, default=False, nullable=False)
    sync_frequency_hours = Column(Integer, default=24, nullable=False)  # How often to sync

    # Error tracking
    last_error = Column(Text)
    failed_records_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    google_ads_account = relationship("GoogleAdsAccount", back_populates="audiences")
    sync_history = relationship("AudienceSyncHistory", back_populates="audience", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CustomerMatchAudience(name={self.name}, status={self.sync_status})>"


class AudienceSyncHistory(Base):
    """History of audience syncs to Google Ads"""
    __tablename__ = "audience_sync_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    audience_id = Column(UUID(as_uuid=True), ForeignKey("customer_match_audiences.id", ondelete="CASCADE"), nullable=False, index=True)

    # Sync details
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)
    status = Column(Enum(AudienceSyncStatus), default=AudienceSyncStatus.PENDING, nullable=False)

    # Statistics
    properties_processed = Column(Integer, default=0)
    contacts_uploaded = Column(Integer, default=0)
    contacts_matched = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)

    # Error details
    error_message = Column(Text)
    error_details = Column(JSON)  # Detailed error info

    # Metadata
    triggered_by = Column(String(50))  # 'manual', 'auto_sync', 'scheduled'
    sync_metadata = Column(JSON)  # Additional sync info

    # Relationships
    audience = relationship("CustomerMatchAudience", back_populates="sync_history")

    def __repr__(self):
        return f"<AudienceSyncHistory(audience_id={self.audience_id}, status={self.status})>"


class GoogleAdsWebhook(Base):
    """Webhook events from Google Ads"""
    __tablename__ = "google_ads_webhooks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_ads_account_id = Column(UUID(as_uuid=True), ForeignKey("google_ads_accounts.id", ondelete="CASCADE"), index=True)

    # Event details
    event_type = Column(String(100), nullable=False)  # e.g., 'user_list.updated'
    resource_name = Column(String(500))
    event_data = Column(JSON)

    # Processing status
    processed = Column(Boolean, default=False, nullable=False)
    processed_at = Column(DateTime)
    processing_error = Column(Text)

    # Timestamps
    received_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<GoogleAdsWebhook(event_type={self.event_type}, processed={self.processed})>"
