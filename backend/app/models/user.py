from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey, Enum
from app.database import Base
from sqlalchemy.orm import relationship

class Role(Base):
    __tablename__ = "roles"
    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)

class Position(Base):
    __tablename__ = "positions"
    position_id = Column(Integer, primary_key=True, index=True)
    position_name = Column(String(100), unique=True, nullable=False)

class Barangay(Base):
    __tablename__ = "barangays"
    barangay_id = Column(Integer, primary_key=True, index=True)
    barangay_name = Column(String(100), unique=True, nullable=False)
    city = Column(String(100), nullable=False)
    contact_no = Column(String(20), nullable=True)

class Subdivision(Base):
    __tablename__ = "subdivisions"
    subdivision_id = Column(Integer, primary_key=True, index=True)
    barangay_id = Column(Integer, ForeignKey("barangays.barangay_id"), nullable=False)
    subdivision_name = Column(String(100), nullable=False)
    
    barangay = relationship("Barangay")

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    position_id = Column(Integer, ForeignKey("positions.position_id"), nullable=True)
    subdivision_id = Column(Integer, ForeignKey("subdivisions.subdivision_id"), nullable=True)
    
    address = Column(String(255), nullable=True)
    profile_picture = Column(String(255), nullable=True)
    
    status = Column(Enum('Active','Inactive','Suspended', name='user_status'), default='Active')
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    role = relationship("Role")
    position = relationship("Position")
    subdivision = relationship("Subdivision")
