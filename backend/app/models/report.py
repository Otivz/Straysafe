from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey, Numeric, Boolean, Enum
from sqlalchemy.orm import relationship
from app.database import Base

class ReportCategory(Base):
    __tablename__ = "report_categories"
    category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(100), unique=True, nullable=False)

class ReportStatus(Base):
    __tablename__ = "report_statuses"
    status_id = Column(Integer, primary_key=True, index=True)
    status_name = Column(String(60), unique=True, nullable=False)

class Report(Base):
    __tablename__ = "reports"

    report_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    subdivision_id = Column(Integer, ForeignKey("subdivisions.subdivision_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("report_categories.category_id"), nullable=False)
    
    description = Column(Text, nullable=True)
    
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    
    animal_count = Column(Integer, default=1)
    landmark = Column(String(255), nullable=True)
    
    priority_level = Column(Enum('Low', 'Regular', 'High', 'Emergency', name='priority_level'), default='Regular')
    visibility = Column(Enum('Public', 'Private', name='report_visibility'), default='Public')
    
    status_id = Column(Integer, ForeignKey("report_statuses.status_id", ondelete="SET NULL"), nullable=True)
    is_archived = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    reporter = relationship("User", backref="reports")
    category = relationship("ReportCategory")
    status = relationship("ReportStatus")
    subdivision = relationship("Subdivision")
    media = relationship("ReportMedia", backref="report", cascade="all, delete-orphan")
    comments = relationship("Comment", backref="report", cascade="all, delete-orphan")
    rescue_requests = relationship("RescueRequest", back_populates="report", cascade="all, delete-orphan")
    ai_predictions = relationship("AIPrediction", backref="report", cascade="all, delete-orphan")
    verifications = relationship("ReportVerification", backref="report", cascade="all, delete-orphan")

class ReportMedia(Base):
    __tablename__ = "report_media"
    
    media_id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.report_id", ondelete="CASCADE"), nullable=False)
    file_url = Column(String(255), nullable=False)
    media_type = Column(Enum('Image', 'Video', 'Document', name='media_type'), nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())

class Comment(Base):
    __tablename__ = "comments"
    
    comment_id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.report_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    parent_comment_id = Column(Integer, ForeignKey("comments.comment_id", ondelete="CASCADE"), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User")

class RequestStatus(Base):
    __tablename__ = "request_statuses"
    status_id = Column(Integer, primary_key=True, index=True)
    status_name = Column(String(50), unique=True, nullable=False)

class RescueRequest(Base):
    __tablename__ = "rescue_requests"
    request_id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.report_id", ondelete="CASCADE"), nullable=False)
    leader_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    barangay_staff_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    
    title = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    status_id = Column(Integer, ForeignKey("request_statuses.status_id"), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    report = relationship("Report", back_populates="rescue_requests")
    leader = relationship("User", foreign_keys=[leader_id])
    barangay_staff = relationship("User", foreign_keys=[barangay_staff_id])
    status = relationship("RequestStatus")

class AIPrediction(Base):
    __tablename__ = "ai_predictions"
    prediction_id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.report_id", ondelete="CASCADE"), nullable=False)
    species_prediction = Column(String(50))
    breed_prediction = Column(String(50))
    condition_prediction = Column(Text)
    behavior_tags = Column(Text)
    confidence = Column(Numeric(5, 2))
    model_version = Column(String(50))
    processed_at = Column(DateTime, server_default=func.now())

class VerificationStatus(Base):
    __tablename__ = "verification_statuses"
    status_id = Column(Integer, primary_key=True, index=True)
    status_name = Column(String(50), unique=True, nullable=False)

class ReportVerification(Base):
    __tablename__ = "report_verifications"
    verification_id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.report_id", ondelete="CASCADE"), nullable=False)
    leader_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    status_id = Column(Integer, ForeignKey("verification_statuses.status_id"), nullable=False)
    remarks = Column(Text)
    verified_at = Column(DateTime, server_default=func.now())
    
    leader = relationship("User")
    verification_status = relationship("VerificationStatus")
