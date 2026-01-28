import React, { useState, useEffect } from 'react';
import {
    Search,
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    ChevronRight,
    TrendingUp,
    Bookmark
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Job {
    id: number;
    title: string;
    company_name: string;
    location: string;
    salary_range: string;
    job_type: string;
    created_at: string;
    description: string;
}

const JobsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get search from URL if present
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    const { user, token } = useAuth();
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const handleSave = async (jobId: number) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const response = await fetch(`http://127.0.0.1:5001/api/jobs/${jobId}/save`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
            } else {
                alert(data.message || 'Error saving job');
            }
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Build query params
                const params = new URLSearchParams();
                if (searchQuery) params.append('q', searchQuery);
                selectedTypes.forEach(t => params.append('type', t.toLowerCase().replace('-', '_')));

                const response = await fetch(`http://127.0.0.1:5001/api/jobs?${params.toString()}`);
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

        const timeoutId = setTimeout(() => {
            fetchJobs();
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedTypes]);

    const handleTypeChange = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const filteredJobs = jobs; // Filtered by API now

    return (
        <div className="space-y-8 pb-20">
            {/* Header & Search */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Find your dream job</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Browse through thousands of job opportunities.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Job title, keywords, or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="hidden lg:block space-y-8">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Job Type</h3>
                        <div className="space-y-3">
                            {['Full-time', 'Part-time', 'Contract', 'Remote'].map((type) => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes.includes(type)}
                                        onChange={() => handleTypeChange(type)}
                                        className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                    />
                                    <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-medium">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-primary-600 rounded-3xl text-white relative overflow-hidden">
                        <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
                        <h4 className="text-lg font-bold mb-2">Join Premium</h4>
                        <p className="text-primary-100 text-sm mb-4">Get 2x more visibility to recruiters and personalized job matches.</p>
                        <button className="w-full py-2.5 bg-white text-primary-600 rounded-xl font-bold text-sm shadow-lg border-none cursor-pointer">Upgrade Now</button>
                    </div>
                </div>

                {/* Job List */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Showing <span className="text-slate-900 dark:text-white font-bold">{filteredJobs.length}</span> jobs</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                            <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold dark:text-white">No jobs found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all cursor-pointer shadow-sm group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-400 shrink-0">
                                            {job.company_name[0]}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight">{job.title}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                <p className="text-slate-600 dark:text-slate-300 font-semibold">{job.company_name}</p>
                                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                                                    <MapPin size={16} />
                                                    {job.location}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSave(job.id);
                                            }}
                                            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary-600 rounded-xl transition-all border-none cursor-pointer"
                                        >
                                            <Bookmark size={20} />
                                        </button>
                                        <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-md group-hover:shadow-primary-500/25 flex items-center gap-2 border-none cursor-pointer">
                                            Details <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                    {job.description}
                                </p>

                                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                                            {job.job_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                                            <DollarSign size={18} className="text-green-500" />
                                            {job.salary_range}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                                            <Clock size={16} />
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobsPage;
