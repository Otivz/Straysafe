from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportBase(BaseModel):
    user_id: int
    subdivision_id: int
    category_id: int
    description: Optional[str] = None
    latitude: float
    longitude: float
    animal_count: Optional[int] = 1
    landmark: Optional[str] = None
    priority_level: Optional[str] = 'Regular'
    visibility: Optional[str] = 'Public'
    status_id: Optional[int] = 1
    is_archived: Optional[bool] = False

class ReportCreate(ReportBase):
    pass

class CommentBase(BaseModel):
    message: str

class CommentCreate(CommentBase):
    user_id: int
    parent_comment_id: Optional[int] = None

class CommentResponse(CommentBase):
    comment_id: int
    report_id: int
    user_id: int
    parent_comment_id: Optional[int] = None
    created_at: datetime
    user_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class ReportMediaResponse(BaseModel):
    media_id: int
    file_url: str
    media_type: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class ReportResponse(ReportBase):
    report_id: int
    created_at: datetime
    reporter_name: Optional[str] = None
    media: Optional[list[ReportMediaResponse]] = []
    comments: Optional[list[CommentResponse]] = []
    
    class Config:
        from_attributes = True

class ReportStatusUpdate(BaseModel):
    status_id: int

class ReportUpdate(BaseModel):
    category_id: Optional[int] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    animal_count: Optional[int] = None
    landmark: Optional[str] = None
    visibility: Optional[str] = None
