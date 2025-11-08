"""
Territory Models

Database models for custom territory drawing and management.
"""
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Boolean, DateTime, Integer, JSON, ForeignKey, Enum, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
import uuid

from app.core.database import Base


class TerritoryType(str, PyEnum):
    """Territory shape type"""
    POLYGON = "polygon"
    CIRCLE = "circle"
    RECTANGLE = "rectangle"


class Territory(Base):
    """Custom territory boundary"""
    __tablename__ = "territories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Territory metadata
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    color = Column(String(7), default="#3B82F6")  # Hex color
    territory_type = Column(Enum(TerritoryType), nullable=False)

    # Geometry (PostGIS)
    geometry = Column(Geometry('POLYGON', srid=4326), nullable=False)

    # For circles: center point and radius
    center_lat = Column(Float)
    center_lng = Column(Float)
    radius_meters = Column(Float)

    # Territory metadata
    is_exclusion = Column(Boolean, default=False, nullable=False)  # Exclusion zone vs inclusion
    is_active = Column(Boolean, default=True, nullable=False)

    # Statistics (cached)
    property_count = Column(Integer, default=0)
    last_calculated_at = Column(DateTime)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Territory(id={self.id}, name={self.name}, type={self.territory_type})>"


class SavedTerritoryGroup(Base):
    """Group of territories saved together"""
    __tablename__ = "saved_territory_groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Group metadata
    name = Column(String(255), nullable=False)
    description = Column(String(1000))

    # Territory IDs in this group
    territory_ids = Column(JSON, nullable=False)  # List of UUID strings

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<SavedTerritoryGroup(id={self.id}, name={self.name})>"
