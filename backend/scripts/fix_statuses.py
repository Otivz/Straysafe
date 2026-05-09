import sys
import os
from sqlalchemy import text

# Add the backend directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import engine

def update_database():
    try:
        with engine.begin() as connection:
            print("Updating report_status...")
            # Using the correct table name from the models: report_status
            report_statuses = [
                (7, 'Picked Up'),
                (8, 'Under Observation'),
                (9, 'Impounded'),
                (10, 'Released')
            ]
            
            for sid, sname in report_statuses:
                connection.execute(
                    text("INSERT INTO report_status (status_id, status_name) VALUES (:id, :name) "
                         "ON DUPLICATE KEY UPDATE status_name = VALUES(status_name)"),
                    {"id": sid, "name": sname}
                )
            
            print("Updating rescue_status...")
            # Using the correct table name from the models: rescue_status
            rescue_statuses = [
                (4, 'Team Dispatched'),
                (5, 'In Progress'),
                (6, 'Resolved')
            ]
            for sid, sname in rescue_statuses:
                connection.execute(
                    text("INSERT INTO rescue_status (status_id, status_name) VALUES (:id, :name) "
                         "ON DUPLICATE KEY UPDATE status_name = VALUES(status_name)"),
                    {"id": sid, "name": sname}
                )

            print("Database update successful!")

    except Exception as e:
        print(f"Error updating database: {e}")

if __name__ == "__main__":
    update_database()
