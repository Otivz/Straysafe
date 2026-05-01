from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import os
import uuid
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.report import Report, ReportMedia, Comment
from app.schemas.report import ReportCreate, ReportResponse, ReportStatusUpdate, ReportUpdate, ReportMediaResponse, CommentCreate, CommentResponse
from app.utils.cloudinary_config import upload_to_cloudinary

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)

@router.get("/", response_model=List[ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).all()
    results = []
    for rep in reports:
        rep_data = ReportResponse.model_validate(rep)
        rep_data.reporter_name = rep.reporter.name if rep.reporter else "Unknown User"
        if rep.comments:
            for i, comment in enumerate(rep.comments):
                rep_data.comments[i].user_name = comment.user.name if comment.user else "Unknown User"
        results.append(rep_data)
    return results

@router.post("/", response_model=ReportResponse)
def create_report(report_in: ReportCreate, db: Session = Depends(get_db)):
    try:
        db_report = Report(**report_in.model_dump())
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        rep_data = ReportResponse.model_validate(db_report)
        rep_data.reporter_name = db_report.reporter.name if db_report.reporter else "Unknown User"
        if db_report.comments:
            for i, comment in enumerate(db_report.comments):
                rep_data.comments[i].user_name = comment.user.name if comment.user else "Unknown User"
                
        return rep_data
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}

@router.post("/{report_id}/media", response_model=ReportMediaResponse)
async def upload_report_media(report_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    # Determine resource type for Cloudinary
    resource_type = "image"
    filename = file.filename.lower() if file.filename else ""
    content_type = file.content_type.lower() if file.content_type else ""
    
    # Robust detection
    if content_type.startswith('video/') or filename.endswith(('.mp4', '.mov', '.avi', '.mkv')):
        resource_type = "video"
    elif content_type == 'application/pdf' or filename.endswith('.pdf'):
        resource_type = "image"
    elif content_type.startswith('image/') or filename.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
        resource_type = "image"
    else:
        resource_type = "raw"

    # Read file content (required for async UploadFile)
    file_content = await file.read()

    # Upload to Cloudinary
    file_url = upload_to_cloudinary(file_content, folder="reports", resource_type=resource_type, filename=file.filename)
    
    if not file_url:
        raise HTTPException(status_code=500, detail="Failed to upload to Cloudinary")
        
    if file.content_type and file.content_type.startswith('image/'):
        media_type = 'Image'
    elif file.content_type and file.content_type.startswith('video/'):
        media_type = 'Video'
    else:
        media_type = 'Document'
    
    db_media = ReportMedia(
        report_id=report_id,
        file_url=file_url,
        media_type=media_type
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    
    return db_media

@router.patch("/{report_id}", response_model=ReportResponse)
def update_report(report_id: int, report_update: ReportUpdate, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    update_data = report_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(report, key, value)
        
    db.commit()
    db.refresh(report)
    
    rep_data = ReportResponse.model_validate(report)
    rep_data.reporter_name = report.reporter.name if report.reporter else "Unknown User"
    if report.comments:
        for i, comment in enumerate(report.comments):
            rep_data.comments[i].user_name = comment.user.name if comment.user else "Unknown User"
    
    return rep_data

@router.patch("/{report_id}/status", response_model=ReportResponse)
def update_report_status(report_id: int, status_update: ReportStatusUpdate, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.status_id = status_update.status_id
    db.commit()
    db.refresh(report)
    
    rep_data = ReportResponse.model_validate(report)
    rep_data.reporter_name = report.reporter.name if report.reporter else "Unknown User"
    if report.comments:
        for i, comment in enumerate(report.comments):
            rep_data.comments[i].user_name = comment.user.name if comment.user else "Unknown User"
    
    return rep_data

@router.post("/{report_id}/comments", response_model=CommentResponse)
def add_comment(report_id: int, comment_in: CommentCreate, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    db_comment = Comment(
        report_id=report_id,
        user_id=comment_in.user_id,
        parent_comment_id=comment_in.parent_comment_id,
        message=comment_in.message
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    comment_data = CommentResponse.model_validate(db_comment)
    comment_data.user_name = db_comment.user.name if db_comment.user else "Unknown User"
    return comment_data

@router.get("/{report_id}/comments", response_model=List[CommentResponse])
def get_comments(report_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.report_id == report_id).all()
    results = []
    for comment in comments:
        comment_data = CommentResponse.model_validate(comment)
        comment_data.user_name = comment.user.name if comment.user else "Unknown User"
        results.append(comment_data)
    return results
