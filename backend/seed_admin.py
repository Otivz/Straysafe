import sys
import os

# Add the root directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from models.user import User, Role, Subdivision
from utils.auth import get_password_hash
from dotenv import load_dotenv

# Explicitly load .env
load_dotenv()

def seed_db():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Roles
        print("Seeding roles...")
        roles = {
            1: 'Citizen',
            2: 'Leader',
            3: 'Barangay',
            4: 'Admin'
        }
        for r_id, r_name in roles.items():
            role = db.query(Role).filter(Role.role_id == r_id).first()
            if not role:
                db.add(Role(role_id=r_id, role_name=r_name))
        db.commit()

        # 2. Seed Subdivisions
        print("Seeding subdivisions...")
        subdivisions = [
            {'id': 1, 'name': 'Selera Homes', 'barangay': 'San Vicente'}
        ]
        for sub in subdivisions:
            subdivision = db.query(Subdivision).filter(Subdivision.subdivision_id == sub['id']).first()
            if not subdivision:
                db.add(Subdivision(subdivision_id=sub['id'], name=sub['name'], barangay_name=sub['barangay']))
        db.commit()

        # 3. Seed Admin User
        admin_email = os.getenv("ADMIN_EMAIL", "admin@straysafe.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "password123")
        
        # Look for existing admin by email
        admin = db.query(User).filter(User.email == admin_email).first()
        
        hashed_password = get_password_hash(admin_password)
        
        if not admin:
            print(f"Creating default admin: {admin_email}")
            new_admin = User(
                name="Admin User",
                email=admin_email,
                password=hashed_password,
                role_id=4,
                position="System Administrator",
                status="Active"
            )
            db.add(new_admin)
            print("Successfully created admin user.")
        else:
            print(f"Admin user {admin_email} exists. Updating password to match .env...")
            admin.password = hashed_password
            admin.role_id = 4  # Ensure they are an admin
            admin.status = "Active" # Ensure they are active
            print("Successfully updated admin user.")
            
        db.commit()
            
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
