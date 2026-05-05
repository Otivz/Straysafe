import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def fix_enum():
    try:
        with engine.connect() as conn:
            # Update the Enum column in report_media
            print("Updating report_media media_type Enum...")
            conn.execute(text("ALTER TABLE report_media MODIFY COLUMN media_type ENUM('Image', 'Video', 'Document') NOT NULL;"))
            
            # Also update the reports table if we added anything there
            # (Check if we added priority_level or visibility changes)
            
            conn.commit()
            print("Successfully updated database schema.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_enum()
