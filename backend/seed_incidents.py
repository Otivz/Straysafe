import os
import sys

# Add root directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from models.incident import Incident
from models.user import User

def seed_incidents():
    db = SessionLocal()
    try:
        # Get admin user ID
        admin = db.query(User).filter(User.role_id == 4).first()
        if not admin:
            print("Admin user not found. Please run seed_admin.py first.")
            return
            
        user_id = admin.user_id
        
        incidents_data = [
            {
                "species": "Dog (Golden Retriever)",
                "condition": "Stray, appears hungry but friendly",
                "priority": "Low",
                "location": "Selera Homes, Phase 1, Blk 2",
                "status": "Pending",
                "user_id": user_id,
                "description": "Found wandering near the clubhouse."
            },
            {
                "species": "Cat (Persian Mix)",
                "condition": "Injured leg, needs immediate attention",
                "priority": "High",
                "location": "Selera Homes, Main Gate",
                "status": "Ongoing",
                "user_id": user_id,
                "description": "Limping badly, hiding under a parked car."
            },
            {
                "species": "Dog (Aspin)",
                "condition": "Weak and dehydrated",
                "priority": "Medium",
                "location": "Selera Homes, Phase 2, Park Area",
                "status": "Resolved",
                "user_id": user_id,
                "description": "Given water and food by residents, now at the shelter."
            }
        ]
        
        print("Seeding sample incidents...")
        for data in incidents_data:
            # Check if exists
            exists = db.query(Incident).filter(
                Incident.species == data["species"],
                Incident.location == data["location"]
            ).first()
            
            if not exists:
                db.add(Incident(**data))
        
        db.commit()
        print("Successfully seeded incidents.")
        
    except Exception as e:
        print(f"Error seeding incidents: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_incidents()
