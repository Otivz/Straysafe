from app.database import SessionLocal
from app.models.report import Rescue
from app.models.user import User

def force_repair_leader():
    db = SessionLocal()
    try:
        # Find the main leader (Kyla Joy Arriola)
        leader = db.query(User).filter(User.name == "Kyla Joy Arriola").first()
        if not leader:
            print("Kyla Joy Arriola not found in database!")
            return
            
        # Find all rescues missing a leader
        rescues = db.query(Rescue).filter(Rescue.leader_id == None).all()
        print(f"Found {len(rescues)} rescues to repair.")
        
        for rescue in rescues:
            rescue.leader_id = leader.user_id
            print(f"Assigned Rescue #{rescue.rescue_id} to {leader.name}")
            
        db.commit()
        print("Final Data repair complete!")
    except Exception as e:
        print(f"Error during repair: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    force_repair_leader()
