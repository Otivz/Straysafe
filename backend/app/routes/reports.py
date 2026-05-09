from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import os
import uuid
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List, Optional
from app.database import get_db
from app.models.report import Report, ReportMedia, Comment, StatusHistory
from app.models.user import User, Subdivision
from app.schemas.report import ReportCreate, ReportResponse, ReportStatusUpdate, ReportUpdate, ReportMediaResponse, CommentCreate, CommentResponse
from app.utils.cloudinary_config import upload_to_cloudinary

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)


@router.get("/", response_model=List[ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).options(
        joinedload(Report.reporter),
        joinedload(Report.category),
        joinedload(Report.status),
        joinedload(Report.subdivision),
        selectinload(Report.media),
        selectinload(Report.comments).joinedload(Comment.user),
        selectinload(Report.history)
    ).all()
    results = []
    for rep in reports:
        try:
            rep_data = ReportResponse.model_validate(rep)
            # Map current_status_id → status_id for frontend compatibility
            rep_data.status_id = rep.current_status_id
            rep_data.reporter_name = rep.reporter.name if rep.reporter else "Unknown User"
            if rep.comments:
                for i, comment in enumerate(rep.comments):
                    if i < len(rep_data.comments):
                        rep_data.comments[i].user_name = comment.user.name if comment.user else "Unknown User"
            results.append(rep_data)
        except Exception as e:
            print(f"Error validating report {rep.report_id}: {e}")
            continue
    return results


@router.post("/", response_model=ReportResponse)
def create_report(report_in: ReportCreate, db: Session = Depends(get_db)):
    try:
        report_data = report_in.model_dump()

        # Map frontend "status_id" → DB "current_status_id"
        report_data["current_status_id"] = report_data.pop("status_id", 1)

        # Drop any frontend-only fields not in the DB (condition, behavior_tags, is_archived are not in reports table)
        for field in ["condition", "behavior_tags", "is_archived", "status_remarks"]:
            report_data.pop(field, None)

        db_report = Report(**report_data)
        db.add(db_report)
        db.commit()
        db.refresh(db_report)

        rep_data = ReportResponse.model_validate(db_report)
        rep_data.status_id = db_report.current_status_id
        rep_data.reporter_name = db_report.reporter.name if db_report.reporter else "Unknown User"
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


@router.patch("/{report_id}", response_model=ReportResponse)
def update_report(report_id: int, report_update: ReportUpdate, db: Session = Depends(get_db)):
    db_report = db.query(Report).filter(Report.report_id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")

    update_data = report_update.model_dump(exclude_unset=True)

    # Map frontend "status_id" → DB "current_status_id" if present
    if "status_id" in update_data:
        update_data["current_status_id"] = update_data.pop("status_id")

    for key, value in update_data.items():
        if hasattr(db_report, key):
            setattr(db_report, key, value)

    db.commit()
    db.refresh(db_report)

    rep_data = ReportResponse.model_validate(db_report)
    rep_data.status_id = db_report.current_status_id
    rep_data.reporter_name = db_report.reporter.name if db_report.reporter else "Unknown User"
    return rep_data


@router.post("/{report_id}/media", response_model=ReportMediaResponse)
async def upload_report_media(
    report_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    try:
        file_content = await file.read()
        file_url = upload_to_cloudinary(file_content, unique_filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")

    # Determine media_type from extension
    ext = file_extension.lower()
    if ext in ['.mp4', '.mov', '.avi', '.webm']:
        media_type = 'Video'
    elif ext in ['.pdf', '.docx', '.doc']:
        media_type = 'Document'
    else:
        media_type = 'Image'

    db_media = ReportMedia(
        report_id=report_id,
        file_url=file_url,
        media_type=media_type
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media


@router.patch("/{report_id}/status", response_model=ReportResponse)
def update_report_status(report_id: int, status_update: ReportStatusUpdate, db: Session = Depends(get_db)):
    report = db.query(Report).options(
        selectinload(Report.history)
    ).filter(Report.report_id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Update current_status_id (DB column name)
    report.current_status_id = status_update.status_id

    # Use either remarks or status_remarks
    final_remarks = status_update.remarks or status_update.status_remarks

    # Create status history entry using DB column names
    db_history = StatusHistory(
        report_id=report_id,
        report_status_id=status_update.status_id,
        updated_by=None,  # nullable in DB
        remarks=final_remarks
    )
    db.add(db_history)
    
    db.commit()
    db.refresh(report)

    rep_data = ReportResponse.model_validate(report)
    rep_data.status_id = report.current_status_id
    rep_data.reporter_name = report.reporter.name if report.reporter else "Unknown User"
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
        comment=comment_in.comment
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    comment_data = CommentResponse.model_validate(db_comment)
    comment_data.user_name = db_comment.user.name if db_comment.user else "Unknown User"
    return comment_data


@router.delete("/media/{media_id}")
def delete_report_media(media_id: int, db: Session = Depends(get_db)):
    media = db.query(ReportMedia).filter(ReportMedia.media_id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    db.delete(media)
    db.commit()
    return {"message": "Media deleted successfully"}
