import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Users,
    Clock,
    MoreVertical,
    Plus,
    Search,
    CheckCircle2,
    XCircle,
    Edit,
    Trash2,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, Navigate } from 'react-router-dom';

interface RecruiterJob {
    id: number;
    title: string;
    applications_count: number;
    created_at: string;
    is_active: boolean;
}

const ManageJobs: React.FC = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    if (user?.role === 'job_seeker') return <Navigate to="/dashboard" replace />;

    const [jobs, setJobs] = useState<RecruiterJob[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecruiterJobs = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5001/api/recruiter/jobs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setJobs(data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchRecruiterJobs();
    }, [token]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this job listing?')) return;

        try {
            const response = await fetch(`http://127.0.0.1:5001/api/jobs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setJobs(jobs.filter(j => j.id !== id));
            } else {
                alert('Failed to delete job');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error connecting to server');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Your Jobs</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor and manage all your active job listings.</p>
                </div>
                <Link to="/post-job" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2">
                    <Plus size={18} />
                    Post New Job
                </Link>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search your jobs..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">All</button>
                    <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all">Active</button>
                    <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all">Draft</button>
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Job Title</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Applications</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">Date Posted</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {jobs.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500 dark:text-slate-400">
                                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="font-medium">No jobs posted yet.</p>
                                        <Link to="/post-job" className="text-primary-600 font-bold hover:underline mt-2 inline-block">Post your first job</Link>
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                                    <Briefcase size={20} />
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white">{job.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${job.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600'}`}>
                                                {job.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {job.is_active ? 'Active' : 'Closed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold">
                                                <Users size={16} />
                                                {job.applications_count}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                                <Clock size={16} />
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all" title="View Details"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/edit-job/${job.id}`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Edit Job"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete Job"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageJobs;
