"""
Property Comparison API Endpoints
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
import logging

from app.core.database import get_db
from app.models.property import Property
from app.schemas.comparison import PropertyComparisonRequest, PropertyComparisonResponse
from app.schemas.property import PropertyResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/comparison", tags=["comparison"])


@router.post("", response_model=PropertyComparisonResponse)
async def compare_properties(
    request: PropertyComparisonRequest,
    db: AsyncSession = Depends(get_db),
):
    """Compare multiple properties side by side"""
    try:
        # Fetch properties
        query = (
            select(Property)
            .where(Property.id.in_(request.property_ids))
            .options(
                joinedload(Property.roofiq),
                joinedload(Property.solarfit),
                joinedload(Property.drivewaypro),
                joinedload(Property.permitscope),
            )
        )

        result = await db.execute(query)
        properties = result.unique().scalars().all()

        if len(properties) != len(request.property_ids):
            raise HTTPException(
                status_code=404, detail="One or more properties not found"
            )

        # Build comparison matrix
        comparison_matrix = {
            "roof_scores": [
                {
                    "property_id": str(p.id),
                    "score": p.roofiq.score if p.roofiq else None,
                }
                for p in properties
            ],
            "solar_scores": [
                {
                    "property_id": str(p.id),
                    "score": p.solarfit.solar_score if p.solarfit else None,
                }
                for p in properties
            ],
            "property_types": [
                {"property_id": str(p.id), "type": p.property_type.value if p.property_type else None}
                for p in properties
            ],
        }

        return PropertyComparisonResponse(
            properties=[PropertyResponse.model_validate(p) for p in properties],
            comparison_matrix=comparison_matrix,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing properties: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to compare properties")
