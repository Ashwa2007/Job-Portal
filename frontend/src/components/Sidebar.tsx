import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Settings,
    LogOut,
    Bell,
    Search,
    PlusSquare,
    ClipboardList,
    Bookmark,
    Rss
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();

    const seekerLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/jobs', icon: <Search size={20} />, label: 'Find Jobs' },
        { to: '/applications', icon: <ClipboardList size={20} />, label: 'My Applications' },
        { to: '/saved-jobs', icon: <Bookmark size={20} />, label: 'Saved Jobs' },
        { to: '/feed', icon: <Rss size={20} />, label: 'Company Feed' },
        { to: '/notifications', icon: <Bell size={20} />, label: 'Activity' },
    ];

    const recruiterLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/feed', icon: <PlusSquare size={20} />, label: 'Post Update' },
        { to: '/post-job', icon: <PlusSquare size={20} />, label: 'Post a Job' },
        { to: '/manage-jobs', icon: <Briefcase size={20} />, label: 'Manage Jobs' },
        { to: '/applicants', icon: <Users size={20} />, label: 'Applicants' },
    ];

    const adminLinks = [
        { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Admin Panel' },
        { to: '/user-management', icon: <Users size={20} />, label: 'Users' },
        { to: '/moderation', icon: <Briefcase size={20} />, label: 'Jobs Moderation' },
    ];

    const links = user?.role === 'admin' ? adminLinks :
        user?.role === 'recruiter' ? recruiterLinks :
            seekerLinks;

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40">
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <Briefcase className="w-8 h-8 text-primary-600" />
                    <span className="text-xl font-bold dark:text-white tracking-tight">JobPortal</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 py-4">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }`
                        }
                    >
                        {link.icon}
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-2">
                    <Avatar className="w-10 h-10 border border-white dark:border-slate-700 shadow-sm">
                        <AvatarImage src={user?.profile_picture} className="object-cover" />
                        <AvatarFallback className="text-sm font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                            {user?.full_name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate">{user?.role.replace('_', ' ')}</p>
                    </div>
                </div>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`
                    }
                >
                    <Settings size={20} />
                    Account Settings
                </NavLink>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-medium"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
