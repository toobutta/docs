"""
Territory API Endpoints

REST API for territory drawing and management.
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.functions import ST_AsGeoJSON, ST_GeomFromGeoJSON, ST_Contains, ST_Intersects
from datetime import datetime
import json
import logging

from app.core.database import get_db
from app.models.territory import Territory, SavedTerritoryGroup
from app.models.property import Property
from app.schemas.territory import (
    TerritoryCreate,
    TerritoryUpdate,
    TerritoryResponse,
    TerritoryListResponse,
    TerritoryPropertyCount,
    SavedTerritoryGroupCreate,
    SavedTerritoryGroupUpdate,
    SavedTerritoryGroupResponse,
    TerritoryGroupListResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/territories", tags=["territories"])


async def get_current_user_id() -> UUID:
    """Temporary: Return mock user ID. Replace with actual auth."""
    return UUID("00000000-0000-0000-0000-000000000001")


@router.post("", response_model=TerritoryResponse, status_code=201)
async def create_territory(
    territory_data: TerritoryCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Create a new territory"""
    try:
        # Convert GeoJSON to PostGIS geometry
        geojson_str = json.dumps(territory_data.geometry)

        territory = Territory(
            user_id=user_id,
            name=territory_data.name,
            description=territory_data.description,
            color=territory_data.color,
            territory_type=territory_data.territory_type,
            center_lat=territory_data.center_lat,
            center_lng=territory_data.center_lng,
            radius_meters=territory_data.radius_meters,
            is_exclusion=territory_data.is_exclusion,
        )

        # Set geometry from GeoJSON
        territory.geometry = func.ST_GeomFromGeoJSON(geojson_str)

        db.add(territory)
        await db.commit()
        await db.refresh(territory)

        # Get geometry as GeoJSON for response
        geom_query = select(func.ST_AsGeoJSON(territory.geometry))
        geom_result = await db.execute(geom_query)
        geom_json = json.loads(geom_result.scalar())

        response = TerritoryResponse.model_validate(territory)
        response.geometry = geom_json

        logger.info(f"Created territory {territory.id} for user {user_id}")

        return response

    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating territory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create territory: {str(e)}")


@router.get("", response_model=TerritoryListResponse)
async def list_territories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """List all territories for current user"""
    try:
        query = select(Territory).where(Territory.user_id == user_id)

        if active_only:
            query = query.where(Territory.is_active == True)

        query = query.order_by(Territory.created_at.desc())

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Get paginated results
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        territories = result.scalars().all()

        # Convert geometries to GeoJSON
        response_territories = []
        for territory in territories:
            geom_query = select(func.ST_AsGeoJSON(territory.geometry))
            geom_result = await db.execute(geom_query)
            geom_json = json.loads(geom_result.scalar())

            territory_response = TerritoryResponse.model_validate(territory)
            territory_response.geometry = geom_json
            response_territories.append(territory_response)

        return TerritoryListResponse(territories=response_territories, total=total)

    except Exception as e:
        logger.error(f"Error listing territories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list territories")


@router.get("/{territory_id}", response_model=TerritoryResponse)
async def get_territory(
    territory_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Get a specific territory"""
    try:
        query = select(Territory).where(
            and_(Territory.id == territory_id, Territory.user_id == user_id)
        )
        result = await db.execute(query)
        territory = result.scalar_one_or_none()

        if not territory:
            raise HTTPException(status_code=404, detail="Territory not found")

        # Get geometry as GeoJSON
        geom_query = select(func.ST_AsGeoJSON(territory.geometry))
        geom_result = await db.execute(geom_query)
        geom_json = json.loads(geom_result.scalar())

        response = TerritoryResponse.model_validate(territory)
        response.geometry = geom_json

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting territory: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get territory")


@router.patch("/{territory_id}", response_model=TerritoryResponse)
async def update_territory(
    territory_id: UUID,
    updates: TerritoryUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Update a territory"""
    try:
        query = select(Territory).where(
            and_(Territory.id == territory_id, Territory.user_id == user_id)
        )
        result = await db.execute(query)
        territory = result.scalar_one_or_none()

        if not territory:
            raise HTTPException(status_code=404, detail="Territory not found")

        # Update fields
        update_data = updates.model_dump(exclude_none=True)
        for field, value in update_data.items():
            if field == "geometry":
                geojson_str = json.dumps(value)
                territory.geometry = func.ST_GeomFromGeoJSON(geojson_str)
            else:
                setattr(territory, field, value)

        territory.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(territory)

        # Get geometry as GeoJSON
        geom_query = select(func.ST_AsGeoJSON(territory.geometry))
        geom_result = await db.execute(geom_query)
        geom_json = json.loads(geom_result.scalar())

        response = TerritoryResponse.model_validate(territory)
        response.geometry = geom_json

        logger.info(f"Updated territory {territory_id}")

        return response

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating territory: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update territory")


@router.delete("/{territory_id}", status_code=204)
async def delete_territory(
    territory_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Delete a territory (soft delete)"""
    try:
        query = select(Territory).where(
            and_(Territory.id == territory_id, Territory.user_id == user_id)
        )
        result = await db.execute(query)
        territory = result.scalar_one_or_none()

        if not territory:
            raise HTTPException(status_code=404, detail="Territory not found")

        territory.is_active = False
        territory.updated_at = datetime.utcnow()

        await db.commit()

        logger.info(f"Deleted territory {territory_id}")

        return None

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting territory: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete territory")


@router.get("/{territory_id}/properties/count", response_model=TerritoryPropertyCount)
async def get_territory_property_count(
    territory_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Get count of properties within a territory"""
    try:
        # Get territory
        terr_query = select(Territory).where(
            and_(Territory.id == territory_id, Territory.user_id == user_id)
        )
        terr_result = await db.execute(terr_query)
        territory = terr_result.scalar_one_or_none()

        if not territory:
            raise HTTPException(status_code=404, detail="Territory not found")

        # Count properties within territory
        count_query = select(func.count(Property.id)).where(
            func.ST_Contains(territory.geometry, Property.geometry)
        )
        count_result = await db.execute(count_query)
        count = count_result.scalar()

        # Update cached count
        territory.property_count = count
        territory.last_calculated_at = datetime.utcnow()
        await db.commit()

        return TerritoryPropertyCount(territory_id=territory_id, property_count=count)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error counting properties: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to count properties")


# Territory Groups


@router.post("/groups", response_model=SavedTerritoryGroupResponse, status_code=201)
async def create_territory_group(
    group_data: SavedTerritoryGroupCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Create a territory group"""
    try:
        group = SavedTerritoryGroup(
            user_id=user_id,
            name=group_data.name,
            description=group_data.description,
            territory_ids=[str(tid) for tid in group_data.territory_ids],
        )

        db.add(group)
        await db.commit()
        await db.refresh(group)

        logger.info(f"Created territory group {group.id}")

        return SavedTerritoryGroupResponse.model_validate(group)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating territory group: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create territory group")


@router.get("/groups", response_model=TerritoryGroupListResponse)
async def list_territory_groups(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """List territory groups"""
    try:
        query = select(SavedTerritoryGroup).where(SavedTerritoryGroup.user_id == user_id)
        query = query.order_by(SavedTerritoryGroup.created_at.desc())

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Get paginated results
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        groups = result.scalars().all()

        return TerritoryGroupListResponse(
            groups=[SavedTerritoryGroupResponse.model_validate(g) for g in groups], total=total
        )

    except Exception as e:
        logger.error(f"Error listing territory groups: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list territory groups")
