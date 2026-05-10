from app.database import engine
from sqlalchemy import text

def add_leader_id():
    with engine.connect() as conn:
        try:
            conn.execute(text('ALTER TABLE rescues ADD COLUMN leader_id INTEGER REFERENCES users(user_id)'))
            conn.commit()
            print("Successfully added leader_id column to rescues table")
        except Exception as e:
            print(f"Error adding column: {e}")

if __name__ == "__main__":
    add_leader_id()
