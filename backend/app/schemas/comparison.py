"""
Property Comparison Schemas
"""
from typing import List
from uuid import UUID
from pydantic import BaseModel, Field

from app.schemas.property import PropertyResponse


class PropertyComparisonRequest(BaseModel):
    """Schema for property comparison request"""
    property_ids: List[UUID] = Field(..., min_items=2, max_items=5)


class PropertyComparisonResponse(BaseModel):
    """Schema for property comparison response"""
    properties: List[PropertyResponse]
    comparison_matrix: dict  # Key insights and differences
