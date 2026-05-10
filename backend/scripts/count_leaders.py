from app.database import engine
from sqlalchemy import text

def count_leaders():
    with engine.connect() as conn:
        res = conn.execute(text('SELECT user_id, name FROM users WHERE role_id = 2'))
        rows = res.fetchall()
        print(f"Leaders found: {len(rows)}")
        for row in rows:
            print(row)

if __name__ == "__main__":
    count_leaders()
