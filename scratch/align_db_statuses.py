from sqlalchemy import create_engine, text

DATABASE_URL = "mysql+pymysql://root:password@localhost/straysafe_db"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Updating report_statuses names for 6-stage alignment...")
    
    # Update status names to match the new 6-stage terminology
    status_updates = [
        (1, "Reported"),
        (4, "Verified & Forwarded"),
        (5, "Team Dispatched"),
        (7, "Picked Up"),
        (9, "Impounded"),
        (6, "Resolved")
    ]
    
    for sid, sname in status_updates:
        conn.execute(text("UPDATE report_statuses SET status_name = :name WHERE status_id = :id"), {"name": sname, "id": sid})
        print(f"Updated status {sid} to '{sname}'")
    
    conn.commit()
    print("Database labels updated.")
