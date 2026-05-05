import pymysql
import os
from dotenv import load_dotenv

# Load environment variables from .env if it exists
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def update_database():
    # Parse DATABASE_URL manually or use hardcoded if env fails
    # URL: mysql+pymysql://root:password@localhost/straysafe_db
    
    try:
        connection = pymysql.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "password"),
            database=os.getenv("DB_NAME", "straysafe_db")
        )

        with connection.cursor() as cursor:
            print("Updating report_statuses...")
            statuses = [
                (7, 'Picked Up'),
                (8, 'Under Observation'),
                (9, 'Impounded'),
                (10, 'Released')
            ]
            
            for sid, sname in statuses:
                cursor.execute(
                    "INSERT INTO report_statuses (status_id, status_name) VALUES (%s, %s) "
                    "ON DUPLICATE KEY UPDATE status_name = VALUES(status_name)", 
                    (sid, sname)
                )
            
            print("Updating request_statuses...")
            # Optional: syncing request_statuses as well for consistency
            req_statuses = [
                (4, 'Team Dispatched'),
                (5, 'In Progress'),
                (6, 'Resolved')
            ]
            for sid, sname in req_statuses:
                cursor.execute(
                    "INSERT INTO request_statuses (status_id, status_name) VALUES (%s, %s) "
                    "ON DUPLICATE KEY UPDATE status_name = VALUES(status_name)", 
                    (sid, sname)
                )

            connection.commit()
            print("Database update successful!")

    except Exception as e:
        print(f"Error updating database: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    update_database()
