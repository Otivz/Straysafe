import pymysql
import os
from dotenv import load_dotenv

# Find .env in parent of backend
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=env_path)

conn = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", "password"),
    database=os.getenv("DB_NAME", "straysafe_db"),
    cursorclass=pymysql.cursors.DictCursor
)

try:
    with conn.cursor() as cur:
        cur.execute("SELECT file_url, media_type FROM report_media ORDER BY uploaded_at DESC LIMIT 5")
        for row in cur.fetchall():
            print(f"{row['media_type']}: {row['file_url']}")
finally:
    conn.close()
