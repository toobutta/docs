from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey, Enum, Boolean, Date, DECIMAL, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class PropertyType(str, enum.Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"


class RoofCondition(str, enum.Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class RoofMaterial(str, enum.Enum):
    ASPHALT = "asphalt"
    METAL = "metal"
    TILE = "tile"
    SLATE = "slate"
    WOOD = "wood"
    UNKNOWN = "unknown"


class Complexity(str, enum.Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"


class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address = Column(String, nullable=False, index=True)
    city = Column(String, index=True)
    state = Column(String(2), index=True)
    zip = Column(String(10), index=True)
    county = Column(String)
    latitude = Column(DECIMAL(10, 8), nullable=False)
    longitude = Column(DECIMAL(11, 8), nullable=False)
    property_type = Column(Enum(PropertyType), nullable=False, index=True)
    geometry = Column(Geometry('POLYGON', srid=4326), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    roofiq = relationship("RoofIQAnalysis", back_populates="property", uselist=False)
    solarfit = relationship("SolarFitAnalysis", back_populates="property", uselist=False)
    drivewaypro = relationship("DrivewayProAnalysis", back_populates="property", uselist=False)
    permitscope = relationship("PermitScopeAnalysis", back_populates="property", uselist=False)

    __table_args__ = (
        CheckConstraint("latitude >= -90 AND latitude <= 90", name="valid_latitude"),
        CheckConstraint("longitude >= -180 AND longitude <= 180", name="valid_longitude"),
    )


class RoofIQAnalysis(Base):
    __tablename__ = "roofiq_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False, index=True)

    condition = Column(Enum(RoofCondition), nullable=False, index=True)
    confidence = Column(Integer, nullable=False)
    age_years = Column(Integer)
    material = Column(Enum(RoofMaterial))
    area_sqft = Column(Integer)
    slope_degrees = Column(DECIMAL(5, 2))
    complexity = Column(Enum(Complexity))
    cost_low = Column(Integer)
    cost_high = Column(Integer)

    imagery_date = Column(Date)
    analysis_date = Column(DateTime, default=datetime.utcnow)

    # Relationship
    property = relationship("Property", back_populates="roofiq")

    __table_args__ = (
        CheckConstraint("confidence >= 0 AND confidence <= 100", name="valid_confidence"),
        CheckConstraint("age_years >= 0", name="valid_age"),
    )


class SolarFitAnalysis(Base):
    __tablename__ = "solarfit_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False, index=True)

    score = Column(Integer, nullable=False, index=True)
    confidence = Column(Integer, nullable=False)
    annual_kwh_potential = Column(Integer)
    panel_count = Column(Integer)
    panel_layout = Column(JSONB)  # GeoJSON MultiPolygon
    system_size_kw = Column(DECIMAL(6, 2))
    estimated_cost = Column(Integer)
    annual_savings = Column(Integer)
    roi_years = Column(DECIMAL(5, 1))

    shading_spring = Column(DECIMAL(3, 2))
    shading_summer = Column(DECIMAL(3, 2))
    shading_fall = Column(DECIMAL(3, 2))
    shading_winter = Column(DECIMAL(3, 2))

    orientation = Column(String(20))
    tilt_degrees = Column(DECIMAL(5, 2))

    analysis_date = Column(DateTime, default=datetime.utcnow)

    # Relationship
    property = relationship("Property", back_populates="solarfit")

    __table_args__ = (
        CheckConstraint("score >= 0 AND score <= 100", name="valid_score"),
        CheckConstraint("confidence >= 0 AND confidence <= 100", name="valid_confidence"),
    )


class DrivewayProAnalysis(Base):
    __tablename__ = "drivewaypro_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False, index=True)

    condition = Column(Enum(RoofCondition), nullable=False)
    confidence = Column(Integer, nullable=False)
    area_sqft = Column(Integer)
    surface_type = Column(String(50))
    cracking_severity = Column(String(20))
    sealing_recommended = Column(Boolean)
    estimated_cost_low = Column(Integer)
    estimated_cost_high = Column(Integer)

    imagery_date = Column(Date)
    analysis_date = Column(DateTime, default=datetime.utcnow)

    # Relationship
    property = relationship("Property", back_populates="drivewaypro")


class PermitScopeAnalysis(Base):
    __tablename__ = "permitscope_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False, index=True)

    recent_permits = Column(JSONB)  # Array of permit objects
    total_permits = Column(Integer)
    last_permit_date = Column(Date)
    construction_activity_score = Column(Integer)
    confidence = Column(Integer)

    analysis_date = Column(DateTime, default=datetime.utcnow)

    # Relationship
    property = relationship("Property", back_populates="permitscope")
