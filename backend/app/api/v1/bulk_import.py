"""
Bulk Property Import API Endpoints
"""
from typing import List
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import pandas as pd
import io
import logging

from app.core.database import get_db
from app.models.property import Property, PropertyType
from app.schemas.bulk_import import BulkImportResponse
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bulk-import", tags=["bulk-import"])


@router.post("/properties", response_model=BulkImportResponse)
async def bulk_import_properties(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Bulk import properties from CSV or Excel file

    Expected columns:
    - address (required)
    - city
    - state
    - zip_code
    - latitude (required)
    - longitude (required)
    - property_type
    """
    try:
        import_id = uuid4()
        errors = []
        successful = 0
        failed = 0

        # Read file
        contents = await file.read()

        # Parse file based on extension
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload CSV or Excel file.",
            )

        total_rows = len(df)

        # Validate required columns
        required_cols = ['address', 'latitude', 'longitude']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_cols)}",
            )

        # Process each row
        for idx, row in df.iterrows():
            try:
                # Validate data
                if pd.isna(row['address']) or pd.isna(row['latitude']) or pd.isna(row['longitude']):
                    errors.append({
                        "row": idx + 2,  # +2 for header and 0-index
                        "error": "Missing required fields",
                    })
                    failed += 1
                    continue

                # Map property type
                property_type = None
                if 'property_type' in row and not pd.isna(row['property_type']):
                    type_str = str(row['property_type']).lower()
                    if type_str in ['residential', 'commercial', 'industrial', 'agricultural']:
                        property_type = PropertyType[type_str.upper()]

                # Create property
                property = Property(
                    address=str(row['address']),
                    city=str(row['city']) if 'city' in row and not pd.isna(row['city']) else None,
                    state=str(row['state']) if 'state' in row and not pd.isna(row['state']) else None,
                    zip_code=str(row['zip_code']) if 'zip_code' in row and not pd.isna(row['zip_code']) else None,
                    latitude=float(row['latitude']),
                    longitude=float(row['longitude']),
                    property_type=property_type,
                )

                # Set geometry from lat/lng
                from sqlalchemy import func
                property.geometry = func.ST_MakePoint(
                    float(row['longitude']),
                    float(row['latitude'])
                )

                db.add(property)
                successful += 1

                # Commit in batches of 100
                if successful % 100 == 0:
                    await db.commit()

            except Exception as e:
                errors.append({
                    "row": idx + 2,
                    "error": str(e),
                })
                failed += 1

        # Final commit
        await db.commit()

        logger.info(
            f"Bulk import {import_id} completed: {successful} successful, {failed} failed"
        )

        return BulkImportResponse(
            import_id=import_id,
            status="completed",
            total_rows=total_rows,
            successful=successful,
            failed=failed,
            errors=errors[:100],  # Limit errors to first 100
            created_at=datetime.utcnow(),
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error during bulk import: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
