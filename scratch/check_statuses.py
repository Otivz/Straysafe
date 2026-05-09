from sqlalchemy import create_engine, text

DATABASE_URL = "mysql+pymysql://root:password@localhost/straysafe_db"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Checking report_statuses table...")
    res = conn.execute(text("SELECT * FROM report_statuses")).fetchall()
    for row in res:
        print(row)
    
    print("\nChecking request_statuses table...")
    res = conn.execute(text("SELECT * FROM request_statuses")).fetchall()
    for row in res:
        print(row)
