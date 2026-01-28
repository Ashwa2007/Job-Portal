import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Users,
    Mail,
    Calendar,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    Download,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Application {
    id: number;
    job_title: string;
    applicant_name: string;
    applicant_email: string;
    status: string;
    created_at: string;
}

const ApplicantsPage: React.FC = () => {
    const { user, token } = useAuth();
    if (user?.role === 'job_seeker') return <Navigate to="/dashboard" replace />;

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5001/api/recruiter/applications', {
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

    const handleStatusUpdate = async (appId: number, newStatus: string) => {
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/applications/${appId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setApplications(applications.map(app =>
                    app.id === appId ? { ...app, status: newStatus } : app
                ));
            } else {
                const data = await response.json();
                alert(data.message || 'Error updating status');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to backend.');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Job Applicants</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage candidates applying for your job listings.</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Applicants', value: applications.length, icon: <Users />, color: 'blue' },
                    { label: 'Shortlisted', value: applications.filter(a => a.status === 'accepted').length, icon: <CheckCircle />, color: 'green' },
                    { label: 'Pending Review', value: applications.filter(a => a.status === 'pending').length, icon: <Clock />, color: 'orange' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : stat.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* List & Filtering */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by candidate name or job..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm dark:text-white"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all">
                            <Filter size={16} /> Filters
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Position</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {applications.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                                        <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No applications received yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{app.applicant_name}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    <Mail size={12} />
                                                    {app.applicant_email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{app.job_title}</p>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                ${app.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {app.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'accepted')}
                                                            className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-200 transition-all flex items-center gap-1"
                                                        >
                                                            <CheckCircle size={14} /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                                            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-200 transition-all flex items-center gap-1"
                                                        >
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-bold opacity-50 cursor-not-allowed">
                                                        Processed
                                                    </button>
                                                )}
                                                <button className="p-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg hover:bg-primary-100 transition-all">
                                                    <ExternalLink size={16} />
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

export default ApplicantsPage;
