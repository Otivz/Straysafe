from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    user_id: int
    email: EmailStr
    name: Optional[str] = None
    role_id: int
    profile_picture: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None
    is_verified: Optional[bool] = False
    created_at: Optional[datetime] = None

    def from_orm(user):
        return {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "role_id": user.role_id,
            "profile_picture": user.profile_picture,
            "phone": user.phone,
            "address": user.address,
            "status": user.status,
            "is_verified": user.is_verified,
            "created_at": user.created_at
        }
