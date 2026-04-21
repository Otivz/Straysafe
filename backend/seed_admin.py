import sys
import os

# Add the root directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from models.user import User
from utils.auth import get_password_hash

def seed_db():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_email = os.getenv("ADMIN_EMAIL", "admin@straysafe.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "password123")
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if not admin:
            print(f"Creating default admin: {admin_email}")
            hashed_password = get_password_hash(admin_password)
            new_admin = User(
                name="Admin User",
                email=admin_email,
                password=hashed_password,
                role_id=4  # Admin role
            )
            db.add(new_admin)
            db.commit()
            print("Successfully seeded database with admin user.")
        else:
            print(f"Admin user {admin_email} already exists.")
            
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
