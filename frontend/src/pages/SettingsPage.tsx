import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Bell,
    Shield,
    Moon,
    Sun,
    Save,
    Loader2,
    Trash2,
    Camera
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AvatarUploader } from '@/components/ui/avatar-uploader';

const SettingsPage: React.FC = () => {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Theme logic
    const [darkMode, setDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // Form States
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Toggles
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        jobs: true
    });
    const [privacy, setPrivacy] = useState({
        profilePublic: true,
        showEmail: false
    });
    const [avatarUrl, setAvatarUrl] = useState(user?.profile_picture || '');

    const handleAvatarUpload = async (file: File) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:5001/api/user/avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                setAvatarUrl(data.url);
                alert('Avatar updated successfully!');
                return { success: true };
            } else {
                alert(data.message || 'Error uploading avatar');
                return { success: false };
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            alert('Upload failed. Please try again.');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/user/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ full_name: fullName })
            });
            if (response.ok) {
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Password change error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete your account? This cannot be undone.')) {
            try {
                const response = await fetch('http://127.0.0.1:5001/api/user/deactivate', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    alert('Account deactivated. We are sorry to see you go.');
                    logout();
                }
            } catch (error) {
                console.error('Deactivate error:', error);
            }
        }
    };

    const tabs = [
        { id: 'profile', icon: <User size={18} />, label: 'Personal Information' },
        { id: 'privacy', icon: <Shield size={18} />, label: 'Privacy & Security' },
        { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
        { id: 'appearance', icon: <Moon size={18} />, label: 'Appearance' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your profile, preferences and security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation Sidebar */}
                <div className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                                ${activeTab === tab.id
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                            `}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">

                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                                    <AvatarUploader onUpload={handleAvatarUpload}>
                                        <div className="relative group cursor-pointer group">
                                            <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden">
                                                <AvatarImage src={avatarUrl} className="object-cover" />
                                                <AvatarFallback className="text-4xl font-black bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                                    {user?.full_name?.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera className="text-white w-8 h-8" />
                                            </div>
                                        </div>
                                    </AvatarUploader>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-2xl font-black dark:text-white">{user?.full_name}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Click the avatar to upload a new profile picture.</p>
                                    </div>
                                </div>

                                <h3 className="text-lg font-black dark:text-white">Profile Details</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-bold dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="email"
                                                defaultValue={user?.email}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 font-bold opacity-60"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="space-y-8">
                                <h3 className="text-lg font-black dark:text-white">Privacy & Security</h3>

                                <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
                                    <p className="text-xs font-black uppercase text-slate-400">Change Password</p>
                                    <input
                                        type="password"
                                        placeholder="Current Password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-bold dark:text-white"
                                    />
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-bold dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold"
                                    >
                                        Update Password
                                    </button>
                                </form>

                                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-black uppercase text-slate-400">Data Visibility</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold dark:text-white">Public Profile</span>
                                        <button
                                            onClick={() => setPrivacy({ ...privacy, profilePublic: !privacy.profilePublic })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${privacy.profilePublic ? 'bg-green-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacy.profilePublic ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-8">
                                <h3 className="text-lg font-black dark:text-white">Notification Preferences</h3>
                                <div className="space-y-6">
                                    {[
                                        { id: 'email', label: 'Email Notifications' },
                                        { id: 'push', label: 'Push Notifications' },
                                        { id: 'jobs', label: 'New Job Alerts' },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <span className="font-bold dark:text-white">{item.label}</span>
                                            <button
                                                onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.id as keyof typeof notifications] ? 'bg-primary-600' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[item.id as keyof typeof notifications] ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-8">
                                <h3 className="text-lg font-black dark:text-white">Appearance</h3>
                                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {darkMode ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-orange-500" />}
                                            <span className="font-bold dark:text-white">Dark Mode</span>
                                        </div>
                                        <button
                                            onClick={() => setDarkMode(!darkMode)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${darkMode ? 'bg-primary-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dangerous Zone */}
                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={handleDeactivate}
                                className="flex items-center gap-2 px-6 py-3 font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all w-full md:w-auto"
                            >
                                <Trash2 size={18} />
                                Deactivate Account
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
