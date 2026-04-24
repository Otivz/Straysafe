from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    incident_id = Column(Integer, primary_key=True, index=True)
    species = Column(String(50), nullable=False)
    condition = Column(String(100), nullable=False)
    priority = Column(String(20), default="Medium")
    location = Column(String(255), nullable=False)
    status = Column(String(20), default="Pending")
    
    # Foreign key to users table
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship to User model
    reporter = relationship("User", backref="reported_incidents")
