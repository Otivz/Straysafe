import os
import sys
from sqlalchemy import text

# Add the backend directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine

def fix_enum():
    try:
        with engine.begin() as conn:
            # Update the Enum column in report_media
            print("Updating report_media media_type Enum...")
            conn.execute(text("ALTER TABLE report_media MODIFY COLUMN media_type ENUM('Image', 'Video', 'Document') NOT NULL;"))
            
            print("Successfully updated database schema.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_enum()
