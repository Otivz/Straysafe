from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.report import RescueRequest, Report
from app.schemas.rescue import RescueRequestCreate, RescueRequestResponse, RescueRequestUpdate

router = APIRouter(
    prefix="/rescue-requests",
    tags=["rescue-requests"]
)

@router.post("/", response_model=RescueRequestResponse)
def create_rescue_request(request_in: RescueRequestCreate, db: Session = Depends(get_db)):
    try:
        db_request = RescueRequest(**request_in.model_dump())
        db.add(db_request)
        db.commit()
        db.refresh(db_request)
        return db_request
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

from sqlalchemy.orm import joinedload

@router.get("/", response_model=List[RescueRequestResponse])
def get_rescue_requests(db: Session = Depends(get_db)):
    requests = db.query(RescueRequest).options(
        joinedload(RescueRequest.report).joinedload(Report.media),
        joinedload(RescueRequest.report).joinedload(Report.reporter),
        joinedload(RescueRequest.leader)
    ).all()
    
    # Manually populate some fields if needed, or rely on relationship loading
    for req in requests:
        if req.report:
            # Populate reporter_name for the nested report
            req.report.reporter_name = req.report.reporter.name if req.report.reporter else "Citizen"
        
        # Populate leader_name
        req.leader_name = req.leader.name if req.leader else "Subd Leader"
        
    return requests

@router.get("/report/{report_id}", response_model=Optional[RescueRequestResponse])
def get_request_by_report(report_id: int, db: Session = Depends(get_db)):
    return db.query(RescueRequest).options(
        joinedload(RescueRequest.report).joinedload(Report.media),
        joinedload(RescueRequest.report).joinedload(Report.reporter)
    ).filter(RescueRequest.report_id == report_id).first()

@router.patch("/{request_id}", response_model=RescueRequestResponse)
def update_rescue_request(request_id: int, request_in: RescueRequestUpdate, db: Session = Depends(get_db)):
    try:
        db_request = db.query(RescueRequest).options(
            joinedload(RescueRequest.report).joinedload(Report.media),
            joinedload(RescueRequest.report).joinedload(Report.reporter)
        ).filter(RescueRequest.request_id == request_id).first()
        if not db_request:
            raise HTTPException(status_code=404, detail="Rescue request not found")
        
        # Update fields
        update_data = request_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_request, key, value)
            
        db.commit()
        db.refresh(db_request)
        return db_request
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
