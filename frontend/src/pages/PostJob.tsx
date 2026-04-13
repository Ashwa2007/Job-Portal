import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    MapPin,
    IndianRupee,
    Briefcase,
    FileText,
    Plus,
    X,
    Loader2,
    CheckCircle,
    Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, Navigate, useParams } from 'react-router-dom';

const PostJob: React.FC = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Check for edit mode

    if (user?.role === 'job_seeker') return <Navigate to="/dashboard" replace />;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        company_name: '',
        location: '',
        salary_range: '',
        job_type: 'full_time',
        description: ''
    });

    // Fetch existing job if in edit mode
    React.useEffect(() => {
        if (id && token) {
            const fetchJob = async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:5001/api/jobs/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        setFormData({
                            title: data.title,
                            company_name: data.company_name,
                            location: data.location,
                            salary_range: data.salary_range,
                            job_type: data.job_type,
                            description: data.description
                        });
                        // Assume backend doesn't return skills yet, but ideally it should
                    }
                } catch (error) {
                    console.error("Failed to load job", error);
                }
            };
            fetchJob();
        }
    }, [id, token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!skills.includes(skillInput.trim())) {
                setSkills([...skills, skillInput.trim()]);
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const url = id
            ? `http://127.0.0.1:5001/api/jobs/${id}`
            : 'http://127.0.0.1:5001/api/jobs';

        const method = id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    skills: skills
                })
            });
            if (response.ok) {
                setSuccess(true);
            } else {
                const data = await response.json();
                alert(data.message || 'Error saving job');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to backend.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle size={40} />
                </motion.div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {id ? 'Job Updated Successfully!' : 'Job Posted Successfully!'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                    Your job listing is now live and visible to thousands of job seekers.
                </p>
                <div className="flex gap-4">
                    {!id && (
                        <button onClick={() => setSuccess(false)} className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            Post Another
                        </button>
                    )}
                    <button onClick={() => navigate('/manage-jobs')} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all">
                        Go to Applications
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {id ? 'Edit Job' : 'Post a New Job'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {id ? 'Update your job listing details.' : 'Fill in the details to reach top talent.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job Title</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Senior Frontend Developer"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Google"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="e.g. San Francisco or Remote"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Salary Range</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="salary_range"
                                value={formData.salary_range}
                                onChange={handleChange}
                                placeholder="e.g. ₹5L - ₹8L"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job Type</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <select
                                name="job_type"
                                value={formData.job_type}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white appearance-none"
                            >
                                <option value="full_time">Full-time</option>
                                <option value="part_time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="remote">Remote</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job Description</label>
                    <div className="relative">
                        <FileText className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={6}
                            placeholder="Describe the role, responsibilities, and requirements..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white resize-none"
                        ></textarea>
                    </div>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Required Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {skills.map((skill) => (
                            <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-bold rounded-lg border border-primary-100 dark:border-primary-900/30">
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="relative">
                        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleAddSkill}
                            placeholder="Type a skill and press Enter..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white rounded-2xl font-bold shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Posting Job...
                            </>
                        ) : (
                            'Publish Job Listing'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostJob;
