import React, { useState, useEffect } from 'react';
import {
    Bookmark,
    MapPin,
    Clock,
    IndianRupee,
    ChevronRight,
    Search,
    Loader2,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Job {
    id: number;
    title: string;
    company_name: string;
    location: string;
    salary_range: string;
    job_type: string;
    created_at: string;
}

const SavedJobs: React.FC = () => {
    const { token } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5001/api/seeker/saved-jobs', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setJobs(data);
                }
            } catch (error) {
                console.error('Error fetching saved jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchSavedJobs();
    }, [token]);

    const removeSavedJob = async (jobId: number) => {
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/jobs/${jobId}/save`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setJobs(jobs.filter(job => job.id !== jobId));
            }
        } catch (error) {
            console.error('Error removing saved job:', error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Bookmark className="text-primary-600" />
                        Saved Jobs
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Jobs you've marked to apply for later.</p>
                </div>
                <Link to="/jobs" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2">
                    <Search size={18} />
                    Find More Jobs
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
            ) : jobs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-16 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Bookmark className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">No saved jobs yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 max-w-sm mx-auto font-medium">
                        Found an interesting role but not ready to apply yet? Save it here to keep track!
                    </p>
                    <Link to="/jobs" className="px-8 py-3.5 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20">
                        Explore Jobs
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 transition-all shadow-sm hover:shadow-xl group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6">
                                <button
                                    onClick={() => removeSavedJob(job.id)}
                                    className="p-2 text-primary-600 bg-primary-50 dark:bg-primary-900/30 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
                                    title="Unsave Job"
                                >
                                    <Bookmark size={20} fill="currentColor" />
                                </button>
                            </div>

                            <div className="flex flex-col h-full">
                                <div className="mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-primary-600 mb-4 shadow-inner">
                                        {job.company_name[0]}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{job.title}</h3>
                                    <p className="text-slate-500 dark:text-primary-400 font-bold text-sm mt-1">{job.company_name}</p>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                        <MapPin size={16} className="text-slate-400" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                        <Briefcase size={16} className="text-slate-400" />
                                        {job.job_type.replace('_', ' ')}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                        <Clock size={16} className="text-slate-400" />
                                        Saved on {new Date(job.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-1.5 text-primary-600 font-black text-lg">
                                        <IndianRupee size={18} />
                                        {job.salary_range}
                                    </div>
                                    <Link
                                        to={`/jobs/${job.id}`}
                                        className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white hover:text-primary-600 transition-colors group/link"
                                    >
                                        View Details
                                        <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
