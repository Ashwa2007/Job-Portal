import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Building2,
    MapPin,
    DollarSign,
    Clock,
    Briefcase,
    ArrowLeft,
    Share2,
    Bookmark,
    Calendar,
    ShieldCheck,
    Send,
    UserPlus,
    UserMinus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Job {
    id: number;
    title: string;
    company_name: string;
    location: string;
    salary_range: string;
    job_type: string;
    created_at: string;
    description: string;
    recruiter_id: number;
}

const JobDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followingLoading, setFollowingLoading] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    useEffect(() => {
        const fetchJob = async (): Promise<Job | null> => {
            try {
                const response = await fetch(`http://127.0.0.1:5001/api/jobs/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setJob(data);
                    return data;
                }
            } catch (error) {
                console.error('Error fetching job details:', error);
            }
            return null;
        };

        const checkSavedStatus = async () => {
            if (!token) return;
            try {
                const response = await fetch(`http://127.0.0.1:5001/api/jobs/${id}/saved-status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) setIsSaved(data.is_saved);
            } catch (err) { console.error(err); }
        };

        const checkFollowStatus = async (recruiterId: number) => {
            if (!token) return;
            try {
                const response = await fetch(`http://127.0.0.1:5001/api/follow/status/${recruiterId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) setIsFollowing(data.is_following);
            } catch (err) { console.error(err); }
        };

        const init = async () => {
            setLoading(true);
            const jobData = await fetchJob();
            if (jobData) {
                await checkSavedStatus();
                await checkFollowStatus(jobData.recruiter_id);
            }
            setLoading(false);
        };

        init();
    }, [id, token]);

    const handleSave = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSaving(true);
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/jobs/${id}/save`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setIsSaved(data.is_saved);
            } else {
                alert(data.message || 'Error saving job');
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleFollow = async () => {
        if (!user || !job) {
            navigate('/login');
            return;
        }
        setFollowingLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/follow/${job.recruiter_id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setIsFollowing(data.is_following);
            }
        } catch (error) {
            console.error('Follow error:', error);
        } finally {
            setFollowingLoading(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Job link copied to clipboard!');
    };

    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'job_seeker') {
            alert('Only job seekers can apply for jobs.');
            return;
        }

        setApplying(true);
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/jobs/${id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cover_letter: coverLetter, resume_url: 'placeholder_link' })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Application submitted successfully!');
                navigate('/dashboard');
            } else {
                alert(data.message || 'Failed to apply');
            }
        } catch (error) {
            console.error('Apply error:', error);
            alert('Connection failed');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!job) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold dark:text-white">Job not found</h2>
            <button onClick={() => navigate('/jobs')} className="mt-4 text-primary-600 font-bold hover:underline">Back to job listings</button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold transition-all border-none bg-transparent cursor-pointer"
            >
                <ArrowLeft size={20} /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                            <div className="flex gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-400">
                                    {job.company_name[0]}
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{job.title}</h1>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        <p className="text-lg font-bold text-primary-600">{job.company_name}</p>
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <MapPin size={18} />
                                            {job.location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`p-3 rounded-xl transition-all border-none cursor-pointer ${isSaved ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary-600'}`}
                                >
                                    <Bookmark size={22} className={isSaved ? 'fill-current' : ''} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary-600 rounded-xl transition-all border-none cursor-pointer"
                                >
                                    <Share2 size={22} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-100 dark:border-slate-800">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase">Salary Range</p>
                                <p className="font-bold dark:text-white">{job.salary_range}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase">Job Type</p>
                                <p className="font-bold dark:text-white uppercase text-xs">{job.job_type.replace('_', ' ')}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase">Experience</p>
                                <p className="font-bold dark:text-white">Mid Senior</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase">Posted Date</p>
                                <p className="font-bold dark:text-white">{new Date(job.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-6">
                            <h3 className="text-xl font-bold dark:text-white">About the Role</h3>
                            <div className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </div>
                    </div>

                    {/* Apply Section (Visible for Job Seekers) */}
                    {user?.role === 'job_seeker' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
                            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <Send className="text-primary-600" size={24} />
                                Apply for this position
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Cover Letter / Note</label>
                                    <textarea
                                        rows={5}
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        placeholder="Briefly explain why you are a good fit for this role..."
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white resize-none"
                                    ></textarea>
                                </div>
                                <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                                    <ShieldCheck className="w-10 h-10 mx-auto text-primary-600 mb-2 opacity-30" />
                                    <p className="text-sm font-bold text-slate-500">Your profile and resume will be sent to {job.company_name}</p>
                                </div>
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-3 border-none cursor-pointer"
                                >
                                    {applying ? <><Clock className="animate-spin" /> Submitting...</> : 'Send Application'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white">
                        <h4 className="font-bold text-lg mb-4">Job Overview</h4>
                        <div className="space-y-4">
                            {[
                                { icon: <Calendar size={18} />, label: 'Posted on', value: new Date(job.created_at).toDateString() },
                                { icon: <MapPin size={18} />, label: 'Location', value: job.location },
                                { icon: <Briefcase size={18} />, label: 'Job Type', value: job.job_type.replace('_', ' ') },
                                { icon: <DollarSign size={18} />, label: 'Salary', value: job.salary_range },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="text-primary-500">{item.icon}</div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">{item.label}</p>
                                        <p className="font-semibold text-sm">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-900 shadow-lg">
                            <Building2 className="text-slate-400" size={32} />
                        </div>
                        <h4 className="font-extrabold text-lg dark:text-white uppercase tracking-tight">{job.company_name}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Verified Company</p>

                        <div className="mt-8 space-y-3">
                            <button
                                onClick={handleToggleFollow}
                                disabled={followingLoading}
                                className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 border-none cursor-pointer ${isFollowing
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        : 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700'
                                    }`}
                            >
                                {isFollowing ? (
                                    <><UserMinus size={18} /> Following</>
                                ) : (
                                    <><UserPlus size={18} /> Follow</>
                                )}
                            </button>

                            <button
                                onClick={async () => {
                                    if (!job) return;
                                    try {
                                        const response = await fetch(`http://127.0.0.1:5001/api/companies/${job.company_name}`);
                                        const data = await response.json();
                                        alert(`🏢 ${data.name}\n\n${data.description}\n\nActive Jobs: ${data.jobs.length}`);
                                    } catch (err) { console.error(err); }
                                }}
                                className="w-full py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold text-sm transition-all dark:text-white bg-transparent cursor-pointer"
                            >
                                Company Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
