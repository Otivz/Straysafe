import os
import sys
from sqlalchemy import text

# Add the backend directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine

def alter_db():
    try:
        with engine.begin() as conn:
            # Check if column exists first or just try to drop it
            print("Attempting to drop image_url from reports table...")
            conn.execute(text("ALTER TABLE reports DROP COLUMN IF EXISTS image_url;"))
            print("Successfully dropped image_url column.")
    except Exception as e:
        # If DROP COLUMN IF EXISTS isn't supported in this MySQL version, 
        # we catch the specific error or just log it
        print(f"Note: {e}")

if __name__ == "__main__":
    alter_db()
