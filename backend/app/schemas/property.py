from pydantic import BaseModel, Field, field_validator, ValidationInfo
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID


class PropertyFilters(BaseModel):
    """Filters for property search"""

    # Location filters
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    county: Optional[str] = None
    bounds: Optional[List[float]] = Field(
        None, description="[west, south, east, north]"
    )
    territory: Optional[dict] = None  # GeoJSON Polygon

    # Property type
    property_type: Optional[str] = None

    # RoofIQ filters
    roof_condition: Optional[List[str]] = None
    roof_age_years_max: Optional[int] = None
    roof_age_years_min: Optional[int] = None
    roof_material: Optional[List[str]] = None

    # SolarFit filters
    solar_score_min: Optional[int] = Field(None, ge=0, le=100)
    solar_score_max: Optional[int] = Field(None, ge=0, le=100)
    panel_count_min: Optional[int] = None
    roi_years_max: Optional[float] = None

    # DrivewayPro filters
    driveway_condition: Optional[List[str]] = None
    driveway_sealing_recommended: Optional[bool] = None

    # PermitScope filters
    permit_activity_days: Optional[int] = None
    construction_activity_min: Optional[int] = None

    # Pagination
    limit: int = Field(100, ge=1, le=500)
    offset: int = Field(0, ge=0)

    # Sorting
    sort_by: Optional[str] = Field(None, description="Field to sort by")
    sort_order: str = Field("asc", description="asc or desc")


class RoofIQData(BaseModel):
    condition: str
    confidence: int
    age_years: Optional[int]
    material: Optional[str]
    area_sqft: Optional[int]
    slope_degrees: Optional[Decimal]
    complexity: Optional[str]
    cost_low: Optional[int]
    cost_high: Optional[int]
    imagery_date: Optional[date]
    analysis_date: datetime

    class Config:
        from_attributes = True


class SolarFitData(BaseModel):
    score: int
    confidence: int
    annual_kwh_potential: Optional[int]
    panel_count: Optional[int]
    panel_layout: Optional[dict]
    system_size_kw: Optional[Decimal]
    estimated_cost: Optional[int]
    annual_savings: Optional[int]
    roi_years: Optional[Decimal]
    shading_analysis: Optional[dict]
    orientation: Optional[str]
    tilt_degrees: Optional[Decimal]
    analysis_date: datetime

    class Config:
        from_attributes = True

    @field_validator("shading_analysis", mode="before")
    @classmethod
    def build_shading_analysis(cls, v, info: ValidationInfo):
        """Build shading_analysis dict from individual fields"""
        if v is not None:
            return v
        # In Pydantic v2, access other fields via info.data
        if not info or not hasattr(info, "data"):
            return None
        values = info.data
        return {
            "spring": values.get("shading_spring"),
            "summer": values.get("shading_summer"),
            "fall": values.get("shading_fall"),
            "winter": values.get("shading_winter"),
        }


class DrivewayProData(BaseModel):
    condition: str
    confidence: int
    area_sqft: Optional[int]
    surface_type: Optional[str]
    cracking_severity: Optional[str]
    sealing_recommended: Optional[bool]
    estimated_cost_low: Optional[int]
    estimated_cost_high: Optional[int]
    imagery_date: Optional[date]
    analysis_date: datetime

    class Config:
        from_attributes = True


class PermitScopeData(BaseModel):
    recent_permits: Optional[List[dict]]
    total_permits: Optional[int]
    last_permit_date: Optional[date]
    construction_activity_score: Optional[int]
    confidence: Optional[int]
    analysis_date: datetime

    class Config:
        from_attributes = True


class PropertyResponse(BaseModel):
    id: UUID
    address: str
    city: Optional[str]
    state: Optional[str]
    zip: Optional[str]
    county: Optional[str]
    latitude: Decimal
    longitude: Decimal
    property_type: str
    geometry: dict  # GeoJSON Polygon

    roofiq: Optional[RoofIQData]
    solarfit: Optional[SolarFitData]
    drivewaypro: Optional[DrivewayProData]
    permitscope: Optional[PermitScopeData]

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PropertySearchResponse(BaseModel):
    properties: List[PropertyResponse]
    total: int
    limit: int
    offset: int
    center: Optional[List[float]] = None  # [longitude, latitude]
