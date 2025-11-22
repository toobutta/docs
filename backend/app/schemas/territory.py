"""
Territory Schemas

Pydantic schemas for territory request/response validation.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class TerritoryType(str):
    """Territory shape type enum"""
    POLYGON = "polygon"
    CIRCLE = "circle"
    RECTANGLE = "rectangle"


class TerritoryCreate(BaseModel):
    """Schema for creating a territory"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    color: str = Field("#3B82F6", pattern=r'^#[0-9A-Fa-f]{6}$')
    territory_type: str = Field(..., pattern=r'^(polygon|circle|rectangle)$')

    # GeoJSON geometry
    geometry: dict = Field(..., description="GeoJSON Polygon geometry")

    # Circle-specific fields
    center_lat: Optional[float] = None
    center_lng: Optional[float] = None
    radius_meters: Optional[float] = Field(None, gt=0)

    is_exclusion: bool = False


class TerritoryUpdate(BaseModel):
    """Schema for updating a territory"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    geometry: Optional[dict] = None
    center_lat: Optional[float] = None
    center_lng: Optional[float] = None
    radius_meters: Optional[float] = Field(None, gt=0)
    is_exclusion: Optional[bool] = None
    is_active: Optional[bool] = None


class TerritoryResponse(BaseModel):
    """Schema for territory response"""
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    color: str
    territory_type: str
    geometry: dict  # GeoJSON
    center_lat: Optional[float]
    center_lng: Optional[float]
    radius_meters: Optional[float]
    is_exclusion: bool
    is_active: bool
    property_count: int
    last_calculated_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TerritoryListResponse(BaseModel):
    """Schema for list of territories"""
    territories: List[TerritoryResponse]
    total: int


class TerritoryPropertyCount(BaseModel):
    """Schema for property count in territory"""
    territory_id: UUID
    property_count: int


class SavedTerritoryGroupCreate(BaseModel):
    """Schema for creating a territory group"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    territory_ids: List[UUID] = Field(..., min_items=1)


class SavedTerritoryGroupUpdate(BaseModel):
    """Schema for updating a territory group"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    territory_ids: Optional[List[UUID]] = Field(None, min_items=1)


class SavedTerritoryGroupResponse(BaseModel):
    """Schema for territory group response"""
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    territory_ids: List[str]  # UUIDs as strings
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TerritoryGroupListResponse(BaseModel):
    """Schema for list of territory groups"""
    groups: List[SavedTerritoryGroupResponse]
    total: int
