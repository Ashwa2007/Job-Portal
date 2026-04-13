
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()
db_url = os.getenv('DATABASE_URL')
print(f"Original URL: {db_url}")

project_id = "dwxkzhecxtesldblpwli"
password = "Ashwa@220307"
direct_url = f"postgresql://postgres:{password}@db.{project_id}.supabase.co:5432/postgres?sslmode=require"
print(f"Trying Direct URL: {direct_url}")

try:
    conn = psycopg2.connect(direct_url)
    print("Success with Direct URL!")
    conn.close()
except Exception as e:
    print(f"Error with Direct URL: {e}")

try:
    conn = psycopg2.connect(db_url)
    print("Success with original URL!")
    conn.close()
except Exception as e:
    print(f"Error with original URL: {e}")
