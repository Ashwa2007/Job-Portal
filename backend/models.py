from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum

db = SQLAlchemy()

class UserRole(enum.Enum):
    ADMIN = 'admin'
    RECRUITER = 'recruiter'
    JOB_SEEKER = 'job_seeker'

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.JOB_SEEKER)
    is_verified = db.Column(db.Boolean, default=False)
    otp = db.Column(db.String(6), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships with cascades
    jobs = db.relationship('Job', backref='recruiter', lazy=True, cascade='all, delete-orphan')
    applications = db.relationship('Application', backref='applicant', lazy=True, cascade='all, delete-orphan')

class JobType(enum.Enum):
    FULL_TIME = 'full_time'
    PART_TIME = 'part_time'
    CONTRACT = 'contract'
    REMOTE = 'remote'

class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    company_name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    salary_range = db.Column(db.String(100))
    job_type = db.Column(db.Enum(JobType), default=JobType.FULL_TIME)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    applications = db.relationship('Application', backref='job', lazy=True, cascade='all, delete-orphan')

class ApplicationStatus(enum.Enum):
    PENDING = 'pending'
    REVIEWING = 'reviewing'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'

class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    resume_url = db.Column(db.String(500))
    cover_letter = db.Column(db.Text)
    status = db.Column(db.Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('notifications', lazy=True, cascade='all, delete-orphan'))

class SavedJob(db.Model):
    __tablename__ = 'saved_jobs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('saved_jobs', lazy=True, cascade='all, delete-orphan'))
    job = db.relationship('Job', backref=db.backref('saved_by', lazy=True, cascade='all, delete-orphan'))

class Follow(db.Model):
    __tablename__ = 'follows'
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # The job seeker
    followed_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # The recruiter/company
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    follower = db.relationship('User', foreign_keys=[follower_id], backref=db.backref('following', lazy=True, cascade='all, delete-orphan'))
    followed = db.relationship('User', foreign_keys=[followed_id], backref=db.backref('followers', lazy=True, cascade='all, delete-orphan'))

class CompanyUpdate(db.Model):
    __tablename__ = 'company_updates'
    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    recruiter = db.relationship('User', backref=db.backref('updates', lazy=True, cascade='all, delete-orphan'))

class UpdateLike(db.Model):
    __tablename__ = 'update_likes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    update_id = db.Column(db.Integer, db.ForeignKey('company_updates.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('update_likes', lazy=True, cascade='all, delete-orphan'))
    update = db.relationship('CompanyUpdate', backref=db.backref('likes', lazy='dynamic', cascade='all, delete-orphan'))

class UpdateComment(db.Model):
    __tablename__ = 'update_comments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    update_id = db.Column(db.Integer, db.ForeignKey('company_updates.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('update_comments', lazy=True, cascade='all, delete-orphan'))
    update = db.relationship('CompanyUpdate', backref=db.backref('comments', lazy=True, cascade='all, delete-orphan', order_by='UpdateComment.created_at.desc()'))
