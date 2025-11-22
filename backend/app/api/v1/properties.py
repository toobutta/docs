from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import joinedload
from typing import List, Optional
from uuid import UUID
import json

from app.core.database import get_db
from app.core.cache import cache
from app.core.config import settings
from app.models.property import Property, RoofIQAnalysis, SolarFitAnalysis, DrivewayProAnalysis, PermitScopeAnalysis
from app.schemas.property import PropertyFilters, PropertyResponse, PropertySearchResponse, RoofIQData, SolarFitData

router = APIRouter(prefix="/properties", tags=["properties"])


@router.post("/search", response_model=PropertySearchResponse)
async def search_properties(
    filters: PropertyFilters,
    db: AsyncSession = Depends(get_db)
):
    """
    Search properties with advanced filtering.

    Supports filtering by:
    - Location (city, state, zip, bounds, territory)
    - Property type (residential/commercial)
    - Roof condition, age, material
    - Solar potential score
    - Construction permits
    - And more...
    """

    # Generate cache key
    cache_key = cache.generate_cache_key("property_search", **filters.dict())

    # Try to get from cache
    cached_result = await cache.get(cache_key)
    if cached_result:
        return PropertySearchResponse(**cached_result)

    # Build query
    query = select(Property).options(
        joinedload(Property.roofiq),
        joinedload(Property.solarfit),
        joinedload(Property.drivewaypro),
        joinedload(Property.permitscope)
    )

    conditions = []

    # Location filters
    if filters.city:
        conditions.append(Property.city.ilike(f"%{filters.city}%"))

    if filters.state:
        conditions.append(Property.state == filters.state.upper())

    if filters.zip:
        conditions.append(Property.zip == filters.zip)

    if filters.county:
        conditions.append(Property.county.ilike(f"%{filters.county}%"))

    if filters.bounds:
        # Bounding box filter
        west, south, east, north = filters.bounds
        conditions.append(and_(
            Property.longitude >= west,
            Property.longitude <= east,
            Property.latitude >= south,
            Property.latitude <= north
        ))

    # Property type filter
    if filters.property_type:
        conditions.append(Property.property_type == filters.property_type)

    # RoofIQ filters (requires join)
    roof_conditions = []
    if filters.roof_condition:
        roof_conditions.append(RoofIQAnalysis.condition.in_(filters.roof_condition))

    if filters.roof_age_years_max:
        roof_conditions.append(RoofIQAnalysis.age_years <= filters.roof_age_years_max)

    if filters.roof_age_years_min:
        roof_conditions.append(RoofIQAnalysis.age_years >= filters.roof_age_years_min)

    if filters.roof_material:
        roof_conditions.append(RoofIQAnalysis.material.in_(filters.roof_material))

    if roof_conditions:
        query = query.join(RoofIQAnalysis)
        conditions.extend(roof_conditions)

    # SolarFit filters
    solar_conditions = []
    if filters.solar_score_min is not None:
        solar_conditions.append(SolarFitAnalysis.score >= filters.solar_score_min)

    if filters.solar_score_max is not None:
        solar_conditions.append(SolarFitAnalysis.score <= filters.solar_score_max)

    if filters.panel_count_min:
        solar_conditions.append(SolarFitAnalysis.panel_count >= filters.panel_count_min)

    if filters.roi_years_max:
        solar_conditions.append(SolarFitAnalysis.roi_years <= filters.roi_years_max)

    if solar_conditions:
        query = query.join(SolarFitAnalysis)
        conditions.extend(solar_conditions)

    # Apply all conditions
    if conditions:
        query = query.where(and_(*conditions))

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total = result.scalar_one()

    # Apply sorting
    if filters.sort_by == 'solar_score':
        query = query.join(SolarFitAnalysis) if not solar_conditions else query
        order_col = SolarFitAnalysis.score
    elif filters.sort_by == 'roof_age':
        query = query.join(RoofIQAnalysis) if not roof_conditions else query
        order_col = RoofIQAnalysis.age_years
    else:
        order_col = Property.updated_at

    if filters.sort_order == 'desc':
        query = query.order_by(order_col.desc())
    else:
        query = query.order_by(order_col.asc())

    # Apply pagination
    query = query.limit(filters.limit).offset(filters.offset)

    # Execute query
    result = await db.execute(query)
    properties = result.unique().scalars().all()

    # Calculate center point
    center = None
    if properties:
        avg_lat = sum(float(p.latitude) for p in properties) / len(properties)
        avg_lng = sum(float(p.longitude) for p in properties) / len(properties)
        center = [avg_lng, avg_lat]

    # Build response
    response_data = {
        "properties": properties,
        "total": total,
        "limit": filters.limit,
        "offset": filters.offset,
        "center": center
    }

    # Cache result
    await cache.set(cache_key, response_data, settings.CACHE_PROPERTY_SEARCH_TTL)

    return PropertySearchResponse(**response_data)


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed property information by ID"""

    # Try cache first
    cache_key = f"property:{property_id}"
    cached_property = await cache.get(cache_key)
    if cached_property:
        return PropertyResponse(**cached_property)

    # Query database
    query = select(Property).where(Property.id == property_id).options(
        joinedload(Property.roofiq),
        joinedload(Property.solarfit),
        joinedload(Property.drivewaypro),
        joinedload(Property.permitscope)
    )

    result = await db.execute(query)
    property_obj = result.unique().scalar_one_or_none()

    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    # Cache result
    property_dict = PropertyResponse.from_orm(property_obj).dict()
    await cache.set(cache_key, property_dict, settings.CACHE_PROPERTY_DETAIL_TTL)

    return property_obj


@router.get("/{property_id}/roofiq", response_model=RoofIQData)
async def get_roofiq_data(
    property_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get RoofIQ analysis for a specific property"""

    cache_key = f"roofiq:{property_id}"
    cached_data = await cache.get(cache_key)
    if cached_data:
        return RoofIQData(**cached_data)

    query = select(RoofIQAnalysis).where(RoofIQAnalysis.property_id == property_id)
    result = await db.execute(query)
    roofiq = result.scalar_one_or_none()

    if not roofiq:
        raise HTTPException(status_code=404, detail="RoofIQ data not found")

    roofiq_dict = RoofIQData.from_orm(roofiq).dict()
    await cache.set(cache_key, roofiq_dict, settings.CACHE_PRODUCT_ANALYSIS_TTL)

    return roofiq


@router.get("/{property_id}/solarfit", response_model=SolarFitData)
async def get_solarfit_data(
    property_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get SolarFit analysis for a specific property"""

    cache_key = f"solarfit:{property_id}"
    cached_data = await cache.get(cache_key)
    if cached_data:
        return SolarFitData(**cached_data)

    query = select(SolarFitAnalysis).where(SolarFitAnalysis.property_id == property_id)
    result = await db.execute(query)
    solarfit = result.scalar_one_or_none()

    if not solarfit:
        raise HTTPException(status_code=404, detail="SolarFit data not found")

    solarfit_dict = SolarFitData.from_orm(solarfit).dict()
    await cache.set(cache_key, solarfit_dict, settings.CACHE_PRODUCT_ANALYSIS_TTL)

    return solarfit
