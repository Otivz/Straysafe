from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.report import ReportResponse

class RequestStatusBase(BaseModel):
    status_name: str

class RequestStatusResponse(RequestStatusBase):
    status_id: int
    class Config:
        from_attributes = True

class RescueRequestBase(BaseModel):
    report_id: int
    leader_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    status_id: Optional[int] = 1

class RescueRequestCreate(RescueRequestBase):
    pass

class RescueRequestUpdate(BaseModel):
    status_id: Optional[int] = None
    barangay_staff_id: Optional[int] = None

class RescueRequestResponse(RescueRequestBase):
    request_id: int
    created_at: datetime
    barangay_staff_id: Optional[int] = None
    report: Optional[ReportResponse] = None
    leader_name: Optional[str] = None
    
    class Config:
        from_attributes = True
