import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    Clock,
    Building2,
    ChevronRight,
    Search,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Application {
    id: number;
    job_title: string;
    company_name: string;
    status: string;
    applied_date: string;
}

const MyApplications: React.FC = () => {
    const { token } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5001/api/seeker/applications', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setApplications(data);
                }
            } catch (error) {
                console.error('Error fetching applications:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchApplications();
    }, [token]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Applications</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track the status of all your job applications.</p>
                </div>
                <Link to="/jobs" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2">
                    <Search size={18} />
                    Browse More Jobs
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center">
                    <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No applications yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 max-w-sm mx-auto">
                        You haven't applied to any jobs yet. Start your search today and find your dream role!
                    </p>
                    <Link to="/jobs" className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">
                        Search Jobs
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-all shadow-sm group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-500 shadow-inner">
                                        {app.company_name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{app.job_title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm flex items-center gap-1">
                                                <Building2 size={14} />
                                                {app.company_name}
                                            </p>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                                                <Clock size={14} />
                                                Applied on {new Date(app.applied_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                                        ${app.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                        {app.status === 'accepted' ? <CheckCircle2 size={14} /> : app.status === 'rejected' ? <XCircle size={14} /> : <Clock size={14} />}
                                        {app.status}
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;
