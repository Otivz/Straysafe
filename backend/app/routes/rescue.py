from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
# Import Rescue (not RescueRequest) to match the DB "rescues" table
from app.models.report import Rescue, Report, RescueAssignment, StatusHistory
from app.models.user import User
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
            "leader_id": request_in.leader_id if hasattr(request_in, 'leader_id') else None,
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
        joinedload(Rescue.report).joinedload(Report.history).joinedload(StatusHistory.updater),
        joinedload(Rescue.staff),
        joinedload(Rescue.leader).joinedload(User.position),
        joinedload(Rescue.assignments)
    ).all()

    for rescue in rescues:
        # Populate dynamic fields for frontend compatibility
        if rescue.report:
            rescue.report.reporter_name = rescue.report.reporter.name if rescue.report.reporter else "Citizen"  # type: ignore[attr-defined]
            rescue.report.status_id = rescue.report.current_status_id  # type: ignore[attr-defined]
            rescue.title = f"Rescue: {rescue.report.animal_type} at {rescue.report.landmark}"
            rescue.description = rescue.report.description
        else:
            rescue.title = f"Rescue Request #{rescue.rescue_id}"
            rescue.description = str(rescue.notes) if rescue.notes else "No description provided."

        # Determine the name of the Subdivision Leader who sent the request
        if rescue.leader:
            rescue.leader_name = rescue.leader.name
            rescue.leader_position = rescue.leader.position.name if rescue.leader.position else "Subdivision Leader"
        elif rescue.report and rescue.report.reporter and rescue.report.reporter.role_id == 2:
            # Fallback 1: Report creator if they are a Subdivision Leader
            rescue.leader_name = rescue.report.reporter.name
            rescue.leader_position = rescue.report.reporter.position.name if rescue.report.reporter.position else "Subdivision Leader"
        elif rescue.report and rescue.report.history:
            # Fallback 2: Look for the person who escalated the report (Status 4) or ANY official who touched it
            # Sort history by created_at descending to find the most recent official action
            official_actions = [h for h in rescue.report.history if h.updater and h.updater.role_id == 2]
            if official_actions:
                # Use the most recent official action
                latest_official = sorted(official_actions, key=lambda x: x.created_at, reverse=True)[0].updater
                rescue.leader_name = latest_official.name
                rescue.leader_position = latest_official.position.name if latest_official.position else "Subdivision Leader"
            else:
                rescue.leader_name = "Subdivision Leader"
                rescue.leader_position = "Official"
        else:
            rescue.leader_name = "Subdivision Leader"
            rescue.leader_position = "Official"
        
        # Determine assigned staff name
        rescue.assigned_staff_name = None
        if rescue.staff:
             # If staff_id is set on the rescue, that's the primary assigned person
             rescue.assigned_staff_name = rescue.staff.name
        elif rescue.assignments:
            # Fallback to history
            latest = sorted(rescue.assignments, key=lambda x: x.assigned_at, reverse=True)[0]  # type: ignore[arg-type]
            assigned_staff = db.query(User).filter(User.user_id == latest.staff_id).first()
            rescue.assigned_staff_name = str(assigned_staff.name) if assigned_staff else None
            
        # Populate request_id for frontend compatibility
        rescue.request_id = rescue.rescue_id  # type: ignore[assignment]

    return rescues


@router.get("/report/{report_id}", response_model=Optional[RescueRequestResponse])
def get_request_by_report(report_id: int, db: Session = Depends(get_db)):
    return db.query(Rescue).options(
        joinedload(Rescue.report).joinedload(Report.media),
        joinedload(Rescue.report).joinedload(Report.reporter),
        joinedload(Rescue.assignments)
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
        
        # Handle assignment if personnel ID is provided
        assigned_id = update_data.pop("assigned_personnel_id", None)
        remarks = update_data.pop("remarks", None)
        staff_id_for_assignment = update_data.get("barangay_staff_id") # Person who is doing the assigning

        # Map barangay_staff_id → staff_id (DB column name) if it exists in update_data
        if "barangay_staff_id" in update_data:
            update_data["staff_id"] = update_data.pop("barangay_staff_id")

        if assigned_id:
            # Update the main staff_id for the rescue as the assigned person
            db_rescue.staff_id = assigned_id
            
            # Also create record in assignment history
            new_assignment = RescueAssignment(
                rescue_id=rescue_id,
                staff_id=assigned_id,
                assigned_by=staff_id_for_assignment or (db_rescue.staff_id if db_rescue.staff_id else assigned_id),
                remarks=remarks
            )
            db.add(new_assignment)

        for key, value in update_data.items():
            setattr(db_rescue, key, value)

        db.commit()
        db.refresh(db_rescue)
        return db_rescue
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
