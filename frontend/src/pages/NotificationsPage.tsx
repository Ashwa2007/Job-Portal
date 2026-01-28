import React, { useState, useEffect } from 'react';
import {
    Bell,
    CheckCircle2,
    Clock,
    Loader2,
    MailOpen,
    Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

const NotificationsPage: React.FC = () => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5001/api/notifications', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setNotifications(data);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchNotifications();
    }, [token]);

    const markAsRead = async (id: number) => {
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllRead = async () => {
        // Simple sequential mark as read for now, or could add backend endpoint for all
        const unread = notifications.filter(n => !n.is_read);
        for (const n of unread) {
            await markAsRead(n.id);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Bell className="text-primary-600" />
                        Activity & Notifications
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Stay updated on your job applications and account activity.</p>
                </div>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={markAllRead}
                        className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <MailOpen size={18} />
                        Mark all as read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-20 text-center">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">All caught up!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto font-medium">
                        You don't have any notifications right now. Check back later for updates on your applications.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {notifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-6 rounded-3xl border transition-all duration-300 ${notif.is_read
                                    ? 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-75'
                                    : 'bg-white dark:bg-slate-900 border-primary-100 dark:border-primary-900/30 shadow-lg shadow-primary-500/5'
                                    }`}
                            >
                                <div className="flex gap-5">
                                    <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${notif.is_read
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                        }`}>
                                        {notif.is_read ? <MailOpen size={24} /> : <Mail size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className={`font-bold transition-colors ${notif.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                                    {notif.title}
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed font-medium">
                                                    {notif.message}
                                                </p>
                                            </div>
                                            {!notif.is_read && (
                                                <button
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="shrink-0 p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Clock size={12} />
                                            {new Date(notif.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
