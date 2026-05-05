import os
import pymysql
from pymysql.constants import CLIENT
from dotenv import load_dotenv
from urllib.parse import urlparse

# Load credentials from .env
load_dotenv()
database_url = os.getenv("DATABASE_URL")

# Parse connection string: mysql+pymysql://root:password@localhost/straysafe_db
parsed = urlparse(database_url.replace("mysql+pymysql", "mysql"))
db_user = parsed.username
db_password = parsed.password
db_host = parsed.hostname

with open('../database_query.txt', 'r') as f:
    sql = f.read()

conn = pymysql.connect(
    host=db_host, 
    user=db_user, 
    password=db_password, 
    client_flag=CLIENT.MULTI_STATEMENTS
)
cursor = conn.cursor()
try:
    cursor.execute(sql)
    conn.commit()
    print("Database reset successfully from database_query.txt")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
