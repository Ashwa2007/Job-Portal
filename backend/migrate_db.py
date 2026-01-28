from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255)"))
            conn.commit()
        print("Successfully added 'profile_picture' column to 'users' table.")
    except Exception as e:
        print(f"Error adding column: {e}")
