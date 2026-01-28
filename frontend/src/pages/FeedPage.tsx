import React, { useState, useEffect, useRef } from 'react';
import {
    Rss,
    Clock,
    Image as ImageIcon,
    Loader2,
    Send,
    MessageSquare,
    Heart,
    Share2,
    X,
    Trash2,
    BadgeCheck,
    Plus,
    Minus,
    Edit2,
    Check,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface Comment {
    id: number;
    content: string;
    author_name: string;
    user_id: number;
    created_at: string;
}

interface Update {
    id: number;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
    author_name: string;
    author_email: string;
    author_avatar: string;
    recruiter_id: number;
    likes_count: number;
    is_liked: boolean;
    comments: Comment[];
}

const FeedPage: React.FC = () => {
    const { user, token, logout } = useAuth();
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [posting, setPosting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Comment states
    const [activeCommentBox, setActiveCommentBox] = useState<number | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

    useEffect(() => {
        if (token) {
            fetchFeed();
        }
    }, [token]);

    const fetchFeed = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/updates/feed', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUpdates(Array.isArray(data) ? data : []);
            } else {
                if (response.status === 401) {
                    logout();
                    return;
                }
                setError(data.message || data.msg || 'Failed to fetch feed');
            }
        } catch (error) {
            console.error('Error fetching feed:', error);
            setError('Could not connect to the server');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePostUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUpdate.title || !newUpdate.content) return;

        setPosting(true);
        let uploadedImageUrl = '';
        try {
            if (selectedImage) {
                const formData = new FormData();
                formData.append('file', selectedImage);
                const uploadRes = await fetch('http://127.0.0.1:5001/api/upload-update-image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) uploadedImageUrl = uploadData.url;
            }

            const response = await fetch('http://127.0.0.1:5001/api/updates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...newUpdate, image_url: uploadedImageUrl })
            });

            if (response.ok) {
                setNewUpdate({ title: '', content: '' });
                removeSelectedImage();
                setShowForm(false);
                setToast({ type: 'success', message: 'Broadcast posted successfully!' });
                fetchFeed();
            } else {
                const errorData = await response.json();
                setToast({ type: 'error', message: errorData.message || 'Failed to post update' });
            }
        } catch (error) {
            console.error('Error:', error);
            setToast({ type: 'error', message: 'An unexpected error occurred while posting.' });
        } finally {
            setPosting(false);
        }
    };

    const handleToggleLike = async (updateId: number) => {
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/updates/${updateId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUpdates(prev => prev.map(u =>
                    u.id === updateId
                        ? { ...u, is_liked: data.is_liked, likes_count: u.likes_count + (data.is_liked ? 1 : -1) }
                        : u
                ));
            }
        } catch (error) { console.error('Like error:', error); }
    };

    const handleAddComment = async (updateId: number) => {
        if (!commentContent.trim()) return;
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/updates/${updateId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: commentContent })
            });
            if (response.ok) {
                const data = await response.json();
                const newComment: Comment = {
                    ...data.comment,
                    user_id: user?.id || 0
                };
                setUpdates(prev => prev.map(u =>
                    u.id === updateId
                        ? { ...u, comments: [newComment, ...u.comments] }
                        : u
                ));
                setCommentContent('');
            }
        } catch (error) { console.error('Comment error:', error); }
    };

    const handleEditComment = async (commentId: number, updateId: number) => {
        if (!editCommentContent.trim()) return;
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: editCommentContent })
            });
            if (response.ok) {
                setUpdates(prev => prev.map(u =>
                    u.id === updateId
                        ? { ...u, comments: u.comments.map(c => c.id === commentId ? { ...c, content: editCommentContent } : c) }
                        : u
                ));
                setEditingCommentId(null);
            }
        } catch (error) { console.error('Edit error:', error); }
    };

    const handleDeleteComment = async (commentId: number, updateId: number) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setUpdates(prev => prev.map(u =>
                    u.id === updateId
                        ? { ...u, comments: u.comments.filter(c => c.id !== commentId) }
                        : u
                ));
            }
        } catch (error) { console.error('Delete error:', error); }
    };

    const handleDeleteUpdate = async (updateId: number) => {
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/updates/${updateId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setUpdates(prev => prev.filter(u => u.id !== updateId));
                setToast({ type: 'success', message: 'Broadcast deleted.' });
            } else {
                const data = await response.json();
                setToast({ type: 'error', message: data.message || 'Delete failed' });
            }
        } catch (error) {
            console.error('Delete error:', error);
            setToast({ type: 'error', message: 'Connection error during deletion.' });
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleShare = (updateId: number) => {
        navigator.clipboard.writeText(`${window.location.origin}/feed#update-${updateId}`);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 relative">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 20 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-0 left-1/2 z-[100] min-w-[300px]"
                    >
                        <Alert
                            variant={toast.type}
                            isNotification
                            icon={toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                            action={
                                <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded">
                                    <X size={14} />
                                </button>
                            }
                        >
                            <AlertDescription className="font-bold">{toast.message}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete this broadcast? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteTarget && handleDeleteUpdate(deleteTarget)}>Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-600/10 text-primary-600 rounded-lg text-xs font-black uppercase tracking-tighter">
                        <Rss size={14} /> Global Stream
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        Company <span className="text-primary-600">Pulse</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
                        Stay ahead with real-time updates from market leaders.
                    </p>
                </div>

                {isRecruiter && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-8 py-4 ${showForm ? 'bg-slate-900' : 'bg-primary-600'} text-white rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl transition-all active:scale-95 border-none cursor-pointer shrink-0`}
                    >
                        {showForm ? <Minus size={22} /> : <Plus size={22} />}
                        {showForm ? 'Close Editor' : 'Broadcast Update'}
                    </button>
                )}
            </div>

            {/* Post Update Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-900 border-2 border-primary-600/20 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl mb-12"
                    >
                        <form onSubmit={handlePostUpdate} className="space-y-8">
                            <div className="space-y-6">
                                <input
                                    type="text"
                                    placeholder="Headline (e.g. Scaling Our Design Team)"
                                    value={newUpdate.title}
                                    onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary-500/20 transition-all dark:text-white font-black text-2xl placeholder:text-slate-300"
                                />
                                <textarea
                                    placeholder="What's the big news today?"
                                    value={newUpdate.content}
                                    onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-primary-500/20 transition-all dark:text-white resize-none font-bold text-lg leading-relaxed"
                                />

                                {imagePreview && (
                                    <div className="relative rounded-[2rem] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl group">
                                        <img src={imagePreview} alt="Preview" className="w-full h-80 object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeSelectedImage}
                                            className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-lg text-white rounded-full hover:bg-red-500 transition-all border-none cursor-pointer"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 font-black hover:bg-slate-200 transition-all border-none cursor-pointer"
                                >
                                    <ImageIcon size={20} className="text-primary-600" /> Image
                                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                </button>

                                <button
                                    type="submit"
                                    disabled={posting || !newUpdate.title || !newUpdate.content}
                                    className="px-12 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-black transition-all flex items-center gap-3 shadow-2xl shadow-primary-500/30 border-none cursor-pointer"
                                >
                                    {posting ? <Loader2 className="animate-spin" /> : <Send />}
                                    Post Now
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error State */}
            {error && (
                <Alert variant="error" icon={<AlertCircle className="shrink-0" />}>
                    <div className="flex flex-col">
                        <AlertTitle className="font-black">Could not load the feed</AlertTitle>
                        <AlertDescription className="text-sm opacity-80">{error}</AlertDescription>
                    </div>
                </Alert>
            )}

            {/* Feed Section */}
            {loading ? (
                <div className="flex flex-col items-center py-40 gap-4">
                    <Loader2 className="w-16 h-16 text-primary-600 animate-spin" strokeWidth={3} />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Synchronizing Stream...</p>
                </div>
            ) : updates.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3.5rem] p-24 text-center shadow-inner">
                    <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                        <Rss className="w-12 h-12 text-primary-200 dark:text-primary-800" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">Your pulse is silent</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-sm mx-auto font-medium text-lg leading-relaxed">
                        Start following your favorite companies to see their updates right here!
                    </p>
                    {isRecruiter && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-8 text-primary-600 font-black hover:underline underline-offset-8"
                        >
                            Be the first to share something!
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-16">
                    <AnimatePresence>
                        {updates.map((update) => (
                            <motion.article
                                key={update.id}
                                id={`update-${update.id}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-primary-500/5 transition-all duration-500 group"
                            >
                                <div className="p-12">
                                    <header className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-3xl font-black text-primary-600 border-4 border-white dark:border-slate-950 shadow-inner overflow-hidden">
                                                {update.author_avatar ? (
                                                    <img src={update.author_avatar} alt="" className="w-full h-full object-cover" />
                                                ) : update.author_name[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-black text-2xl text-slate-900 dark:text-white leading-tight">{update.author_name}</h3>
                                                    <BadgeCheck size={20} className="text-primary-500 fill-primary-500/10" />
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[10px] text-primary-600 font-black uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-full">Partner</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                    <time className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                        <Clock size={12} />
                                                        {new Date(update.created_at).toDateString()}
                                                    </time>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(user?.email === update.author_email || user?.role === 'admin') && (
                                                <button
                                                    onClick={() => setDeleteTarget(update.id)}
                                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all rounded-2xl border-none bg-transparent cursor-pointer"
                                                >
                                                    <Trash2 size={22} />
                                                </button>
                                            )}
                                        </div>
                                    </header>

                                    <div className="space-y-6 mb-12">
                                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-primary-600 transition-colors">
                                            {update.title}
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-bold text-xl opacity-90">
                                            {update.content}
                                        </p>
                                    </div>

                                    {update.image_url && (
                                        <div className="mb-12 rounded-[2.5rem] overflow-hidden border-8 border-slate-50 dark:border-slate-800 shadow-2xl bg-black">
                                            <img src={update.image_url} alt="" className="w-full object-cover max-h-[700px] group-hover:scale-[1.02] transition-transform duration-1000" />
                                        </div>
                                    )}

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-8 mt-12">
                                        <div className="flex items-center gap-10">
                                            <button
                                                onClick={() => handleToggleLike(update.id)}
                                                className={`flex items-center gap-3 font-black text-lg transition-all border-none bg-transparent cursor-pointer ${update.is_liked ? 'text-red-500 scale-110' : 'text-slate-400 hover:text-red-500'}`}
                                            >
                                                <Heart size={28} className={update.is_liked ? 'fill-current' : ''} />
                                                <span>{update.likes_count}</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveCommentBox(activeCommentBox === update.id ? null : update.id)}
                                                className="flex items-center gap-3 text-slate-400 hover:text-primary-600 font-black text-lg border-none bg-transparent cursor-pointer transition-all"
                                            >
                                                <MessageSquare size={28} />
                                                <span>{update.comments.length}</span>
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleShare(update.id)}
                                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                        >
                                            <Share2 size={28} />
                                        </button>
                                    </div>

                                    {/* Comments Section */}
                                    <AnimatePresence>
                                        {activeCommentBox === update.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-10 space-y-8 overflow-hidden"
                                            >
                                                <div className="flex gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Write a comment..."
                                                        value={commentContent}
                                                        onChange={(e) => setCommentContent(e.target.value)}
                                                        className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                                    />
                                                    <button
                                                        onClick={() => handleAddComment(update.id)}
                                                        className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all border-none cursor-pointer"
                                                    >
                                                        <Send size={20} />
                                                    </button>
                                                </div>

                                                <div className="space-y-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                                    {update.comments.map(comment => (
                                                        <div key={comment.id} className="group/comment bg-slate-50 dark:bg-black/20 p-5 rounded-2xl flex flex-col gap-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-black text-xs text-primary-600 capitalize">{comment.author_name}</span>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-[10px] text-slate-400 uppercase font-bold">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                                    {user?.id === comment.user_id && (
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingCommentId(comment.id);
                                                                                    setEditCommentContent(comment.content);
                                                                                }}
                                                                                className="text-slate-400 hover:text-primary-600 transition-colors border-none bg-transparent cursor-pointer"
                                                                            >
                                                                                <Edit2 size={14} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteComment(comment.id, update.id)}
                                                                                className="text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {editingCommentId === comment.id ? (
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={editCommentContent}
                                                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                                                        className="flex-1 bg-white dark:bg-slate-900 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                                                        autoFocus
                                                                    />
                                                                    <button
                                                                        onClick={() => handleEditComment(comment.id, update.id)}
                                                                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all border-none cursor-pointer"
                                                                    >
                                                                        <Check size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingCommentId(null)}
                                                                        className="p-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-all border-none cursor-pointer"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">{comment.content}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default FeedPage;
