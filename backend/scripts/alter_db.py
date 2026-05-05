import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

engine = create_engine(DATABASE_URL)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE reports DROP COLUMN image_url;"))
        conn.commit()
        print("Dropped image_url")
except Exception as e:
    print(f"Error: {e}")
