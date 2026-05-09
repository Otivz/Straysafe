from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
# Import Rescue (not RescueRequest) to match the DB "rescues" table
from app.models.report import Rescue, Report
from app.schemas.rescue import RescueRequestCreate, RescueRequestResponse, RescueRequestUpdate

router = APIRouter(
    prefix="/rescue-requests",
    tags=["rescue-requests"]
)


@router.post("/", response_model=RescueRequestResponse)
def create_rescue_request(request_in: RescueRequestCreate, db: Session = Depends(get_db)):
    try:
        rescue_data = {
            "report_id": request_in.report_id,
            "staff_id": request_in.barangay_staff_id if hasattr(request_in, 'barangay_staff_id') else None,
            "status_id": request_in.status_id,
            "notes": request_in.description
        }
        db_rescue = Rescue(**{k: v for k, v in rescue_data.items() if v is not None or k == "report_id"})
        db.add(db_rescue)
        db.commit()
        db.refresh(db_rescue)
        return db_rescue
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[RescueRequestResponse])
def get_rescue_requests(db: Session = Depends(get_db)):
    rescues = db.query(Rescue).options(
        joinedload(Rescue.report).joinedload(Report.media),
        joinedload(Rescue.report).joinedload(Report.reporter),
        joinedload(Rescue.staff)
    ).all()

    for rescue in rescues:
        if rescue.report:
            rescue.report.reporter_name = rescue.report.reporter.name if rescue.report.reporter else "Citizen"
        rescue.leader_name = rescue.staff.name if rescue.staff else "Barangay Staff"
        # Populate request_id for frontend compatibility
        rescue.request_id = rescue.rescue_id

    return rescues


@router.get("/report/{report_id}", response_model=Optional[RescueRequestResponse])
def get_request_by_report(report_id: int, db: Session = Depends(get_db)):
    return db.query(Rescue).options(
        joinedload(Rescue.report).joinedload(Report.media),
        joinedload(Rescue.report).joinedload(Report.reporter)
    ).filter(Rescue.report_id == report_id).first()


@router.patch("/{rescue_id}", response_model=RescueRequestResponse)
def update_rescue_request(rescue_id: int, request_in: RescueRequestUpdate, db: Session = Depends(get_db)):
    try:
        db_rescue = db.query(Rescue).options(
            joinedload(Rescue.report).joinedload(Report.media),
            joinedload(Rescue.report).joinedload(Report.reporter)
        ).filter(Rescue.rescue_id == rescue_id).first()

        if not db_rescue:
            raise HTTPException(status_code=404, detail="Rescue not found")

        update_data = request_in.model_dump(exclude_unset=True)
        # Map barangay_staff_id → staff_id (DB column name)
        if "barangay_staff_id" in update_data:
            update_data["staff_id"] = update_data.pop("barangay_staff_id")

        for key, value in update_data.items():
            setattr(db_rescue, key, value)

        db.commit()
        db.refresh(db_rescue)
        return db_rescue
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
