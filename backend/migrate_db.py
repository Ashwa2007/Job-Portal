from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        with db.engine.connect() as conn:
            # Check for otp column
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN otp VARCHAR(6)"))
                print("Successfully added 'otp' column.")
            except Exception:
                print("'otp' column might already exist.")
            
            # Check for otp_expiry column
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN otp_expiry TIMESTAMP"))
                print("Successfully added 'otp_expiry' column.")
            except Exception:
                print("'otp_expiry' column might already exist.")
                
            conn.commit()
    except Exception as e:
        print(f"Migration error: {e}")
