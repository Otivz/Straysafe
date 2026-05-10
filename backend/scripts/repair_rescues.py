from app.database import SessionLocal
from app.models.report import Rescue, StatusHistory
from app.models.user import User

def repair_leader_data():
    db = SessionLocal()
    try:
        # Find all rescues where leader_id is missing
        rescues = db.query(Rescue).filter(Rescue.leader_id == None).all()
        print(f"Found {len(rescues)} rescues to repair.")
        
        for rescue in rescues:
            # Look for the escalation event in history (Status 4)
            history = db.query(StatusHistory).filter(
                StatusHistory.report_id == rescue.report_id,
                StatusHistory.report_status_id == 4,
                StatusHistory.updated_by != None
            ).first()
            
            if history:
                rescue.leader_id = history.updated_by
                print(f"Repaired Rescue #{rescue.rescue_id}: Linked to Leader ID {history.updated_by}")
            else:
                # If no status 4, look for ANY action by a leader on this report
                any_leader_action = db.query(StatusHistory).join(User, StatusHistory.updated_by == User.user_id).filter(
                    StatusHistory.report_id == rescue.report_id,
                    User.role_id == 2
                ).first()
                if any_leader_action:
                    rescue.leader_id = any_leader_action.updated_by
                    print(f"Repaired Rescue #{rescue.rescue_id}: Linked to Leader ID {any_leader_action.updated_by} via history audit")

        db.commit()
        print("Data repair complete!")
    except Exception as e:
        print(f"Error during repair: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    repair_leader_data()
