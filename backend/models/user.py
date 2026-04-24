from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey
from app.database import Base

class Role(Base):
    __tablename__ = "roles"
    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)

class Subdivision(Base):
    __tablename__ = "subdivisions"
    subdivision_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    barangay_name = Column(String(100), nullable=False)

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Referencing the table names defined in Role and Subdivision classes above
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    subdivision_id = Column(Integer, ForeignKey("subdivisions.subdivision_id"), nullable=True)

    barangay = Column(String(100), default='Unknown')
    city = Column(String(100), default='Unknown')
    address = Column(String(255), nullable=True)
    position = Column(String(100), nullable=True)

    profile_picture = Column(String(255), nullable=True)
    status = Column(String(20), default="Active")
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
