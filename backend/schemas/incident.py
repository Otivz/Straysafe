from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IncidentBase(BaseModel):
    species: str
    condition: str
    priority: Optional[str] = "Medium"
    location: str
    status: Optional[str] = "Pending"
    description: Optional[str] = None
    image_url: Optional[str] = None

class IncidentCreate(IncidentBase):
    user_id: int

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    condition: Optional[str] = None

class IncidentResponse(IncidentBase):
    incident_id: int
    user_id: int
    reporter_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
