"""
Saved Search Models

Database models for saved searches and alert preferences.
"""
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Boolean, DateTime, Integer, JSON, ForeignKey, Enum, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class AlertFrequency(str, PyEnum):
    """Alert frequency options"""
    INSTANT = "instant"  # Immediately when new properties match
    DAILY = "daily"  # Daily digest at specified time
    WEEKLY = "weekly"  # Weekly digest on specified day
    MONTHLY = "monthly"  # Monthly digest on specified day


class SavedSearch(Base):
    """Saved search with filter criteria and alert preferences"""
    __tablename__ = "saved_searches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # Future: ForeignKey to users table

    # Search metadata
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_checked_at = Column(DateTime)

    # Search filters (stored as JSON matching PropertyFilters schema)
    filters = Column(JSON, nullable=False)

    # Alert configuration
    alerts_enabled = Column(Boolean, default=True, nullable=False)
    alert_frequency = Column(Enum(AlertFrequency), default=AlertFrequency.DAILY, nullable=False)
    alert_email = Column(String(255), nullable=False)
    alert_time = Column(Integer, CheckConstraint("alert_time >= 0 AND alert_time <= 23"))  # Hour of day (0-23)
    alert_day = Column(Integer, CheckConstraint("alert_day >= 0 AND alert_day <= 6"))  # Day of week (0=Monday, 6=Sunday)

    # Statistics
    total_matches = Column(Integer, default=0, nullable=False)
    new_matches_since_last_alert = Column(Integer, default=0, nullable=False)

    # Active status
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    alert_history = relationship("SearchAlert", back_populates="saved_search", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SavedSearch(id={self.id}, name={self.name}, user_id={self.user_id})>"


class SearchAlert(Base):
    """Alert history for saved searches"""
    __tablename__ = "search_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    saved_search_id = Column(UUID(as_uuid=True), ForeignKey("saved_searches.id", ondelete="CASCADE"), nullable=False, index=True)

    # Alert details
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    property_count = Column(Integer, nullable=False)
    property_ids = Column(JSON, nullable=False)  # List of property UUIDs included in alert

    # Email delivery status
    email_sent = Column(Boolean, default=False, nullable=False)
    email_opened = Column(Boolean, default=False, nullable=False)
    email_clicked = Column(Boolean, default=False, nullable=False)
    sendgrid_message_id = Column(String(255))

    # Error tracking
    error_message = Column(String(1000))
    retry_count = Column(Integer, default=0, nullable=False)

    # Relationships
    saved_search = relationship("SavedSearch", back_populates="alert_history")

    def __repr__(self):
        return f"<SearchAlert(id={self.id}, search_id={self.saved_search_id}, sent_at={self.sent_at})>"


class UserEmailPreference(Base):
    """User email preferences and settings"""
    __tablename__ = "user_email_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=False)

    # Global preferences
    all_alerts_enabled = Column(Boolean, default=True, nullable=False)
    marketing_emails_enabled = Column(Boolean, default=False, nullable=False)

    # Digest preferences
    daily_digest_enabled = Column(Boolean, default=True, nullable=False)
    daily_digest_time = Column(Integer, default=9, CheckConstraint("daily_digest_time >= 0 AND daily_digest_time <= 23"))

    weekly_digest_enabled = Column(Boolean, default=False, nullable=False)
    weekly_digest_day = Column(Integer, default=1, CheckConstraint("weekly_digest_day >= 0 AND weekly_digest_day <= 6"))
    weekly_digest_time = Column(Integer, default=9, CheckConstraint("weekly_digest_time >= 0 AND weekly_digest_time <= 23"))

    # Unsubscribe
    unsubscribed_at = Column(DateTime)
    unsubscribe_token = Column(String(255), unique=True, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<UserEmailPreference(user_id={self.user_id}, email={self.email})>"
