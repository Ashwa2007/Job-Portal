import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Briefcase,
    CheckCircle,
    Clock,
    TrendingUp,
    ArrowUpRight,
    PlusSquare,
    ClipboardList,
    TrendingDown,
    Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const isRecruiter = user?.role === 'recruiter';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats
                const statsResponse = await fetch('http://127.0.0.1:5001/api/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const statsData = await statsResponse.json();
                if (statsResponse.ok) {
                    setStats(statsData);
                }

                // Fetch notifications
                const notifResponse = await fetch('http://127.0.0.1:5001/api/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const notifData = await notifResponse.json();
                if (notifResponse.ok) {
                    setNotifications(notifData.slice(0, 5)); // Show latest 5
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token]);

    const seekerStats = [
        { label: 'Applied Jobs', value: stats?.applied_jobs || 0, icon: <Briefcase />, color: 'blue' },
        { label: 'Interviews', value: stats?.interviews || 0, icon: <Users />, color: 'purple' },
        { label: 'Offers', value: stats?.offers || 0, icon: <CheckCircle />, color: 'green' },
        { label: 'Saved Jobs', value: stats?.saved_jobs || 0, icon: <Clock />, color: 'orange' },
    ];

    const recruiterStats = [
        { label: 'Jobs Posted', value: stats?.jobs_posted || 0, icon: <PlusSquare />, color: 'blue' },
        { label: 'Total Applications', value: stats?.active_applications || 0, icon: <Users />, color: 'purple' },
        { label: 'Hired Today', value: stats?.hired_today || 0, icon: <CheckCircle />, color: 'green' },
        { label: 'Closing Soon', value: stats?.closing_soon || 0, icon: <TrendingDown />, color: 'orange' },
    ];

    const displayStats = isRecruiter ? recruiterStats : seekerStats;

    if (loading) return (
        <div className="flex h-[70vh] items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Welcome back, {user?.full_name.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {isRecruiter
                            ? "Manage your company's talent pipeline and open positions."
                            : "Here's what's happening with your job search today."}
                    </p>
                </div>
                {isRecruiter ? (
                    <Link to="/post-job" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 w-fit">
                        <PlusSquare size={18} />
                        Post a Job
                    </Link>
                ) : (
                    <Link to="/jobs" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 w-fit">
                        <TrendingUp size={18} />
                        Find Jobs
                    </Link>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayStats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 
                          ${stat.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : ''}
                          ${stat.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : ''}
                          ${stat.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : ''}
                          ${stat.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : ''}
                        `}>
                            {stat.icon}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions / Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <div className="lg:col-span-2 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary-500/20">
                    <ClipboardList className="absolute -right-8 -bottom-8 w-64 h-64 opacity-10" />
                    <div className="relative z-10 max-w-lg">
                        <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight">Level up with Verified Status</h2>
                        <p className="text-primary-100 text-lg mb-8 font-medium">
                            {isRecruiter
                                ? "Verified recruiters see high-quality applicants and get a badge on their jobs."
                                : "Verified seekers are 2x more likely to catch recruiters' eyes in the search feed."}
                        </p>
                        <button className="px-8 py-3.5 bg-white text-primary-600 rounded-2xl font-black shadow-xl hover:shadow-2xl hover:bg-slate-50 transition-all active:scale-95">
                            Apply for Verification
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                    <Link to="/notifications" className="text-xl font-black mb-8 dark:text-white flex items-center justify-between group cursor-pointer hover:text-primary-600 transition-colors">
                        Pulse Activity
                        <ArrowUpRight className="text-slate-400 group-hover:text-primary-600 transition-colors" size={20} />
                    </Link>
                    <div className="space-y-8">
                        {notifications.length > 0 ? (
                            notifications.map((notif, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${!notif.is_read ? 'bg-primary-500 shadow-lg shadow-primary-500/50' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                    <div>
                                        <p className="text-sm font-bold dark:text-white leading-tight">{notif.title}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold opacity-60 tracking-wider uppercase">
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Clock className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 font-bold">No recent activity</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Your notifications will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
