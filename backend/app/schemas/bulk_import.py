"""
Bulk Import Schemas
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel


class BulkImportResponse(BaseModel):
    """Response for bulk import operation"""
    import_id: UUID
    status: str
    total_rows: int
    successful: int
    failed: int
    errors: List[dict]
    created_at: datetime


class BulkImportStatus(BaseModel):
    """Status of a bulk import operation"""
    import_id: UUID
    status: str
    total_rows: int
    processed: int
    successful: int
    failed: int
    errors: List[dict]
    started_at: datetime
    completed_at: Optional[datetime]
