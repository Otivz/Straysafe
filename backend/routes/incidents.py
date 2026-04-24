from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from models.incident import Incident
from models.user import User
from schemas.incident import IncidentCreate, IncidentUpdate, IncidentResponse

router = APIRouter(
    prefix="/incidents",
    tags=["incidents"]
)

@router.get("/", response_model=List[IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    
    # Enrich with reporter name
    results = []
    for inc in incidents:
        inc_data = IncidentResponse.model_validate(inc)
        inc_data.reporter_name = inc.reporter.name if inc.reporter else "Unknown"
        results.append(inc_data)
        
    return results

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.incident_id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    inc_data = IncidentResponse.model_validate(incident)
    inc_data.reporter_name = incident.reporter.name if incident.reporter else "Unknown"
    return inc_data

@router.post("/", response_model=IncidentResponse)
def create_incident(incident_in: IncidentCreate, db: Session = Depends(get_db)):
    db_incident = Incident(**incident_in.model_dump())
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    
    inc_data = IncidentResponse.model_validate(db_incident)
    inc_data.reporter_name = db_incident.reporter.name if db_incident.reporter else "Unknown"
    return inc_data

@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: int, incident_in: IncidentUpdate, db: Session = Depends(get_db)):
    db_incident = db.query(Incident).filter(Incident.incident_id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    update_data = incident_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_incident, field, value)
        
    db.commit()
    db.refresh(db_incident)
    
    inc_data = IncidentResponse.model_validate(db_incident)
    inc_data.reporter_name = db_incident.reporter.name if db_incident.reporter else "Unknown"
    return inc_data

@router.delete("/{incident_id}")
def delete_incident(incident_id: int, db: Session = Depends(get_db)):
    db_incident = db.query(Incident).filter(Incident.incident_id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db.delete(db_incident)
    db.commit()
    return {"message": "Incident deleted successfully"}
