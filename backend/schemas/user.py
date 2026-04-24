from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role_id: int
    subdivision_id: Optional[int] = None
    barangay: Optional[str] = "Unknown"
    city: Optional[str] = "Unknown"
    address: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = "Active"
    is_verified: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    role_id: Optional[int] = None
    subdivision_id: Optional[int] = None
    barangay: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = None
    is_verified: Optional[bool] = None

class UserResponse(UserBase):
    user_id: int
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True
