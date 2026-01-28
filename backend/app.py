from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from models import db, User, Job, UserRole, JobType, Application, ApplicationStatus, Notification, SavedJob, Follow, CompanyUpdate, UpdateLike, UpdateComment
import bcrypt
import os
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

CORS(app)
db.init_app(app)
jwt = JWTManager(app)

# Create tables
with app.app_context():
    db.create_all()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Job Portal API is running"}), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    print(f"Registration attempt: {data.get('email')} as {data.get('role')}")
    
    if User.query.filter_by(email=data.get('email')).first():
        print(f"Error: User {data.get('email')} already exists")
        return jsonify({"message": "An account with this email already exists. Try logging in instead."}), 400
    
    try:
        hashed_password = bcrypt.hashpw(data.get('password').encode('utf-8'), bcrypt.gensalt())
        
        # Explicitly map role index if needed, but UserRole(value) should work
        role_val = data.get('role', 'job_seeker')
        new_user = User(
            email=data.get('email'),
            password_hash=hashed_password.decode('utf-8'),
            full_name=data.get('full_name'),
            role=UserRole(role_val)
        )
        
        db.session.add(new_user)
        db.session.commit()
        print(f"User created successfully: {new_user.email} with role {new_user.role.value}")
        return jsonify({"message": "Account created successfully! Please log in."}), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"message": "An error occurred during registration"}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and bcrypt.checkpw(data.get('password').encode('utf-8'), user.password_hash.encode('utf-8')):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value,
                "is_verified": user.is_verified,
                "profile_picture": f"http://127.0.0.1:5001/uploads/{user.profile_picture}" if user.profile_picture else None
            }
        }), 200
    
    return jsonify({"message": "Invalid email or password. Please check your credentials."}), 401


# --- Job Endpoints ---


@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    search_query = request.args.get('q', '').strip()
    job_types = request.args.getlist('type')
    
    query = Job.query.filter_by(is_active=True)
    
    if search_query:
        query = query.filter(
            (Job.title.ilike(f'%{search_query}%')) | 
            (Job.company_name.ilike(f'%{search_query}%')) |
            (Job.description.ilike(f'%{search_query}%')) |
            (Job.location.ilike(f'%{search_query}%'))
        )
        
    if job_types:
        query = query.filter(Job.job_type.in_([JobType(t) for t in job_types]))
        
    jobs = query.all()
    
    return jsonify([{
        "id": j.id,
        "title": j.title,
        "description": j.description,
        "company_name": j.company_name,
        "location": j.location,
        "salary_range": j.salary_range,
        "job_type": j.job_type.value,
        "created_at": j.created_at.isoformat()
    } for j in jobs]), 200

@app.route('/api/jobs', methods=['POST'])
@jwt_required()
def post_job():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    print(f"Post job attempt by user: {user.email} with role: {user.role}")
    
    if user.role != UserRole.RECRUITER and user.role != UserRole.ADMIN:
        print(f"Permission denied for role: {user.role}")
        return jsonify({"message": "Only recruiters can post jobs"}), 403
        
    data = request.get_json()
    print(f"Job data received: {data}")
    
    try:
        new_job = Job(
            title=data.get('title'),
            description=data.get('description'),
            company_name=data.get('company_name'),
            location=data.get('location'),
            salary_range=data.get('salary_range'),
            job_type=JobType(data.get('job_type', 'full_time')),
            recruiter_id=user_id
        )
        
        db.session.add(new_job)
        db.session.commit()
        print(f"Job posted successfully! ID: {new_job.id}")
        return jsonify({"message": "Job posted successfully", "id": new_job.id}), 201
    except Exception as e:
        print(f"Error posting job: {str(e)}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    job = Job.query.get_or_404(job_id)
    return jsonify({
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "company_name": job.company_name,
        "location": job.location,
        "salary_range": job.salary_range,
        "job_type": job.job_type.value,
        "created_at": job.created_at.isoformat(),
        "is_active": job.is_active,
        "recruiter_id": job.recruiter_id
    }), 200

@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    user_id = int(get_jwt_identity())
    job = Job.query.get_or_404(job_id)
    
    if job.recruiter_id != user_id:
        return jsonify({"message": "Permission denied"}), 403
        
    data = request.get_json()
    job.title = data.get('title', job.title)
    job.description = data.get('description', job.description)
    job.company_name = data.get('company_name', job.company_name)
    job.location = data.get('location', job.location)
    job.salary_range = data.get('salary_range', job.salary_range)
    if 'job_type' in data:
        job.job_type = JobType(data.get('job_type'))
    if 'is_active' in data:
        job.is_active = data.get('is_active')
        
    db.session.commit()
    return jsonify({"message": "Job updated successfully"}), 200

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    user_id = int(get_jwt_identity())
    job = Job.query.get_or_404(job_id)
    
    if job.recruiter_id != user_id:
        return jsonify({"message": "Permission denied"}), 403
        
    try:
        # Delete associated applications first to prevent Foreign Key errors
        Application.query.filter_by(job_id=job_id).delete()
        
        db.session.delete(job)
        db.session.commit()
        return jsonify({"message": "Job deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Delete Error: {str(e)}")
        return jsonify({"message": f"Error deleting job: {str(e)}"}), 500

@app.route('/api/recruiter/jobs', methods=['GET'])
@jwt_required()
def get_recruiter_jobs():
    user_id = get_jwt_identity()
    jobs = Job.query.filter_by(recruiter_id=user_id).all()
    return jsonify([{
        "id": j.id,
        "title": j.title,
        "applications_count": len(j.applications),
        "created_at": j.created_at.isoformat(),
        "is_active": j.is_active
    } for j in jobs]), 200

# --- Application Endpoints ---

@app.route('/api/jobs/<int:job_id>/apply', methods=['POST'])
@jwt_required()
def apply_job(job_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != UserRole.JOB_SEEKER:
        return jsonify({"message": "Only job seekers can apply"}), 403
        
    # Check if already applied
    existing = Application.query.filter_by(job_id=job_id, user_id=user_id).first()
    if existing:
        return jsonify({"message": "Already applied for this job"}), 400
        
    data = request.get_json()
    new_app = Application(
        job_id=job_id,
        user_id=user_id,
        cover_letter=data.get('cover_letter'),
        resume_url=data.get('resume_url') # Placeholder for real upload
    )
    
    db.session.add(new_app)
    db.session.commit()
    return jsonify({"message": "Application submitted"}), 201

@app.route('/api/recruiter/applications', methods=['GET'])
@jwt_required()
def get_applications_for_recruiter():
    user_id = int(get_jwt_identity())
    # Get all jobs posted by this recruiter
    jobs = Job.query.filter_by(recruiter_id=user_id).all()
    job_ids = [j.id for j in jobs]
    
    apps = Application.query.filter(Application.job_id.in_(job_ids)).all()
    return jsonify([{
        "id": a.id,
        "job_title": a.job.title,
        "applicant_name": a.applicant.full_name,
        "applicant_email": a.applicant.email,
        "status": a.status.value,
        "created_at": a.created_at.isoformat()
    } for a in apps]), 200

@app.route('/api/applications/<int:app_id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(app_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    application = Application.query.get_or_404(app_id)
    
    if user.role != UserRole.ADMIN and application.job.recruiter_id != user_id:
        return jsonify({"message": "Permission denied"}), 403
        
    data = request.get_json()
    new_status = data.get('status')
    if new_status not in [s.value for s in ApplicationStatus]:
        return jsonify({"message": "Invalid status"}), 400
        
    application.status = ApplicationStatus(new_status)
    
    # Create notification
    notif = Notification(
        user_id=application.user_id,
        title=f"Application Update: {application.job.title}",
        message=f"Your application for '{application.job.title}' at '{application.job.company_name}' has been {new_status}."
    )
    db.session.add(notif)
    
    db.session.commit()
    return jsonify({"message": f"Application {new_status} successfully"}), 200

# --- Notification Endpoints ---

@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return jsonify([{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat()
    } for n in notifications]), 200

@app.route('/api/notifications/<int:notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notif_id):
    user_id = int(get_jwt_identity())
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != user_id:
        return jsonify({"message": "Permission denied"}), 403
    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read"}), 200

@app.route('/api/seeker/applications', methods=['GET'])
@jwt_required()
def get_seeker_applications():
    user_id = int(get_jwt_identity())
    apps = Application.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": a.id,
        "job_title": a.job.title,
        "company_name": a.job.company_name,
        "status": a.status.value,
        "applied_date": a.created_at.isoformat()
    } for a in apps]), 200

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role == UserRole.RECRUITER:
        # Jobs posted by the recruiter
        jobs_count = Job.query.filter_by(recruiter_id=user_id).count()
        
        # Total applications for all jobs posted by the recruiter
        recruiter_jobs = Job.query.filter_by(recruiter_id=user_id).all()
        job_ids = [j.id for j in recruiter_jobs]
        apps_count = Application.query.filter(Application.job_id.in_(job_ids)).count()
        
        # Hired (Accepted) today
        today = datetime.utcnow().date()
        hired_today = Application.query.filter(
            Application.job_id.in_(job_ids),
            Application.status == ApplicationStatus.ACCEPTED,
            db.func.date(Application.created_at) == today # Using created_at for simplicity if we don't have updated_at
        ).count()
        
        return jsonify({
            "jobs_posted": jobs_count,
            "active_applications": apps_count,
            "hired_today": hired_today,
            "closing_soon": Job.query.filter_by(recruiter_id=user_id, is_active=True).count()
        }), 200
    else:
        # Seeker stats
        apps_count = Application.query.filter_by(user_id=user_id).count()
        reviewing_count = Application.query.filter_by(user_id=user_id, status=ApplicationStatus.REVIEWING).count()
        accepted_count = Application.query.filter_by(user_id=user_id, status=ApplicationStatus.ACCEPTED).count()
        saved_count = SavedJob.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            "applied_jobs": apps_count,
            "interviews": reviewing_count, # Mapping reviewing to interviews for now
            "offers": accepted_count,
            "saved_jobs": saved_count
        }), 200

# --- Saved Jobs Endpoints ---

@app.route('/api/jobs/<int:job_id>/save', methods=['POST'])
@jwt_required()
def toggle_save_job(job_id):
    user_id = int(get_jwt_identity())
    print(f"User {user_id} attempting to toggle save for Job {job_id}")
    try:
        existing = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
        
        if existing:
            db.session.delete(existing)
            db.session.commit()
            print(f"Job {job_id} removed from saved for User {user_id}")
            return jsonify({"message": "Job removed from saved", "is_saved": False}), 200
        
        saved = SavedJob(user_id=user_id, job_id=job_id)
        db.session.add(saved)
        db.session.commit()
        print(f"Job {job_id} saved for User {user_id}")
        return jsonify({"message": "Job saved successfully", "is_saved": True}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Save Job Error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/api/jobs/<int:job_id>/saved-status', methods=['GET'])
@jwt_required()
def get_saved_status(job_id):
    user_id = int(get_jwt_identity())
    saved = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
    return jsonify({"is_saved": saved is not None}), 200

@app.route('/api/seeker/saved-jobs', methods=['GET'])
@jwt_required()
def get_saved_jobs():
    user_id = int(get_jwt_identity())
    saved_entries = SavedJob.query.filter_by(user_id=user_id).all()
    jobs = [entry.job for entry in saved_entries]
    return jsonify([{
        "id": j.id,
        "title": j.title,
        "company_name": j.company_name,
        "location": j.location,
        "salary_range": j.salary_range,
        "job_type": j.job_type.value,
        "created_at": j.created_at.isoformat()
    } for j in jobs]), 200

# --- Follow & Company Updates Endpoints ---

@app.route('/api/follow/<int:user_id>', methods=['POST'])
@jwt_required()
def toggle_follow(user_id):
    follower_id = int(get_jwt_identity())
    if follower_id == user_id:
        return jsonify({"message": "You cannot follow yourself"}), 400
    
    existing = Follow.query.filter_by(follower_id=follower_id, followed_id=user_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"message": "Unfollowed successfully", "is_following": False}), 200
    
    new_follow = Follow(follower_id=follower_id, followed_id=user_id)
    db.session.add(new_follow)
    db.session.commit()
    return jsonify({"message": "Followed successfully", "is_following": True}), 201

@app.route('/api/follow/status/<int:user_id>', methods=['GET'])
@jwt_required()
def get_follow_status(user_id):
    follower_id = int(get_jwt_identity())
    follow = Follow.query.filter_by(follower_id=follower_id, followed_id=user_id).first()
    return jsonify({"is_following": follow is not None}), 200

@app.route('/api/upload-update-image', methods=['POST'])
@jwt_required()
def upload_update_image():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    if file:
        user_id = get_jwt_identity()
        filename = f"update_{user_id}_{int(datetime.now().timestamp())}.jpg"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify({"url": f"http://127.0.0.1:5001/uploads/{filename}"}), 200

@app.route('/api/updates', methods=['POST'])
@jwt_required()
def post_update():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        # Resilient role check for PostgreSQL Enums
        user_role_str = str(user.role.value) if hasattr(user.role, 'value') else str(user.role)
        if not user or (user_role_str != 'recruiter' and user_role_str != 'admin'):
            return jsonify({"message": f"Only recruiters can post updates. Current role: {user_role_str}"}), 403
        
        data = request.get_json()
        title = data.get('title')
        content = data.get('content')
        
        if not title or not content:
            return jsonify({"message": "Title and content are required"}), 400
            
        new_update = CompanyUpdate(
            recruiter_id=user_id,
            title=title,
            content=content,
            image_url=data.get('image_url')
        )
        db.session.add(new_update)
        db.session.commit()
        return jsonify({"message": "Update posted successfully", "id": new_update.id}), 201
    except Exception as e:
        print(f"POST UPDATE ERROR: {str(e)}")
        db.session.rollback()
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route('/api/updates/feed', methods=['GET'])
@jwt_required()
def get_feed():
    try:
        user_identity = get_jwt_identity()
        if not user_identity:
            return jsonify({"message": "Invalid token identity"}), 401
            
        user_id = int(user_identity)
        # Get IDs of people this user follows
        followed_ids = [f.followed_id for f in Follow.query.filter_by(follower_id=user_id).all()]
        
        if not followed_ids:
            # Return latest public updates
            updates = CompanyUpdate.query.order_by(CompanyUpdate.created_at.desc()).limit(20).all()
        else:
            # Show updates from followed people + some latest public ones potentially
            updates = CompanyUpdate.query.filter(CompanyUpdate.recruiter_id.in_(followed_ids)).order_by(CompanyUpdate.created_at.desc()).all()
        
        result = []
        for u in updates:
            # Essential safety check: if recruiter no longer exists, skip or handle
            if not u.recruiter:
                continue
                
            result.append({
                "id": u.id,
                "title": u.title,
                "content": u.content,
                "image_url": u.image_url,
                "created_at": u.created_at.isoformat(),
                "author_name": u.recruiter.full_name,
                "author_email": u.recruiter.email,
                "author_avatar": f"http://127.0.0.1:5001/uploads/{u.recruiter.profile_picture}" if u.recruiter.profile_picture else None,
                "recruiter_id": u.recruiter_id,
                "likes_count": u.likes.count() if hasattr(u, 'likes') else 0,
                "is_liked": UpdateLike.query.filter_by(user_id=user_id, update_id=u.id).first() is not None,
                "comments": [{
                    "id": c.id,
                    "content": c.content,
                    "author_name": c.user.full_name if c.user else "Anonymous",
                    "user_id": c.user_id,
                    "created_at": c.created_at.isoformat()
                } for c in u.comments] if hasattr(u, 'comments') else []
            })
            
        return jsonify(result), 200
        
    except Exception as e:
        print(f"FEED ERROR: {str(e)}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route('/api/updates/<int:update_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(update_id):
    user_id = int(get_jwt_identity())
    existing = UpdateLike.query.filter_by(user_id=user_id, update_id=update_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"message": "Unliked", "is_liked": False}), 200
    
    new_like = UpdateLike(user_id=user_id, update_id=update_id)
    db.session.add(new_like)
    db.session.commit()
    return jsonify({"message": "Liked", "is_liked": True}), 201

@app.route('/api/updates/<int:update_id>/comment', methods=['POST'])
@jwt_required()
def add_comment(update_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data.get('content'):
        return jsonify({"message": "Content is required"}), 400
    
    new_comment = UpdateComment(
        user_id=user_id,
        update_id=update_id,
        content=data.get('content')
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify({
        "message": "Comment added",
        "comment": {
            "id": new_comment.id,
            "content": new_comment.content,
            "author_name": User.query.get(user_id).full_name,
            "created_at": new_comment.created_at.isoformat()
        }
    }), 201

@app.route('/api/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def edit_comment(comment_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    comment = UpdateComment.query.get_or_404(comment_id)
    
    if comment.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403
    
    if not data.get('content'):
        return jsonify({"message": "Content is required"}), 400
    
    comment.content = data.get('content')
    db.session.commit()
    return jsonify({"message": "Comment updated", "content": comment.content}), 200

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    comment = UpdateComment.query.get_or_404(comment_id)
    
    if comment.user_id != user_id and user.role != UserRole.ADMIN:
        return jsonify({"message": "Unauthorized"}), 403
    
    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "Comment deleted"}), 200

@app.route('/api/updates/<int:update_id>', methods=['DELETE'])
@jwt_required()
def delete_update(update_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    update = CompanyUpdate.query.get_or_404(update_id)
    
    if update.recruiter_id != user_id and user.role != UserRole.ADMIN:
        return jsonify({"message": "Unauthorized"}), 403
    
    db.session.delete(update)
    db.session.commit()
    return jsonify({"message": "Update deleted successfully"}), 200

# --- Company Profile (Mock/Basic) ---

@app.route('/api/companies/<string:company_name>', methods=['GET'])
def get_company_profile(company_name):
    # In a real app, this would be a separate model
    company_jobs = Job.query.filter_by(company_name=company_name, is_active=True).all()
    
    return jsonify({
        "name": company_name,
        "description": f"{company_name} is a leading industry player dedicated to innovation and excellence.",
        "location": company_jobs[0].location if company_jobs else "Global",
        "verified": True,
        "jobs": [{
            "id": j.id,
            "title": j.title,
            "salary": j.salary_range,
            "type": j.job_type.value
        } for j in company_jobs]
    }), 200

# --- User Settings Endpoints ---

@app.route('/api/user/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not bcrypt.checkpw(current_password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({"message": "Current password is incorrect"}), 400
        
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    user.password_hash = hashed_password.decode('utf-8')
    db.session.commit()
    
    return jsonify({"message": "Password changed successfully"}), 200

@app.route('/api/user/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()
    
    if 'full_name' in data:
        user.full_name = data['full_name']
        
    # In a real app, you might have a Settings table, 
    # but for now we'll just acknowledge the update
    db.session.commit()
    return jsonify({
        "message": "Settings updated successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value
        }
    }), 200

@app.route('/api/user/deactivate', methods=['DELETE'])
@jwt_required()
def deactivate_account():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Check if there are active jobs or applications (optional safety)
    # For now, just delete the user (this will cascade delete based on DB setup)
    # Note: Flask-SQLAlchemy needs cascade defined in models if you want it automatic
    
    try:
        # Manually clear associations if cascade isn't perfect
        Application.query.filter_by(user_id=user_id).delete()
        SavedJob.query.filter_by(user_id=user_id).delete()
        Notification.query.filter_by(user_id=user_id).delete()
        
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Account deactivated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deactivating account: {str(e)}"}), 500

@app.route('/api/user/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    
    if file:
        filename = f"avatar_{user_id}_{int(datetime.now().timestamp())}.jpg"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        user.profile_picture = filename
        db.session.commit()
        
        return jsonify({
            "message": "Avatar updated",
            "url": f"http://127.0.0.1:5001/uploads/{filename}"
        }), 200

if __name__ == '__main__':

    app.run(port=int(os.getenv('PORT', 5001)), debug=True)
