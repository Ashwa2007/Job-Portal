import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Ripple,
    AuthTabs,
    TechOrbitDisplay
} from '../components/ui/modern-animated-sign-in';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Briefcase, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const iconsArray = [
    {
        component: () => (
            <img
                width={40}
                height={40}
                src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg'
                alt='Python'
            />
        ),
        className: 'size-[40px] border-none bg-transparent',
        duration: 25,
        delay: 10,
        radius: 120,
        path: false,
        reverse: false,
    },
    {
        component: () => (
            <img
                width={40}
                height={40}
                src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg'
                alt='Flask'
                className="dark:invert"
            />
        ),
        className: 'size-[40px] border-none bg-transparent',
        duration: 25,
        delay: 20,
        radius: 120,
        path: false,
        reverse: false,
    },
    {
        component: () => (
            <img
                width={50}
                height={50}
                src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg'
                alt='React'
            />
        ),
        className: 'size-[50px] border-none bg-transparent',
        radius: 220,
        duration: 30,
        path: false,
        reverse: true,
    }
];

const SignupPage: React.FC = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'job_seeker'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Map labels from AnimatedForm back to state keys
        const fieldMap: { [key: string]: string } = {
            'Full Name': 'full_name',
            'Email': 'email',
            'Password': 'password'
        };
        const mappedName = fieldMap[name] || name.toLowerCase();
        setFormData(prev => ({ ...prev, [mappedName]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://127.0.0.1:5001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.message || 'Registration failed. This account may already exist.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Connection failed. Please check if the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const formFields = {
        header: 'Elevate Your Career',
        subHeader: 'Create a premium account in seconds',
        fields: [
            {
                label: 'Full Name',
                required: true,
                type: 'text',
                placeholder: 'John Doe',
                onChange: handleInputChange,
            },
            {
                label: 'Email',
                required: true,
                type: 'email',
                placeholder: 'john@example.com',
                onChange: handleInputChange,
            },
            {
                label: 'Password',
                required: true,
                type: 'password',
                placeholder: 'Create a strong password',
                onChange: handleInputChange,
            },
        ],
        submitButton: isLoading ? 'Creating Account...' : 'Get Started Now',
        textVariantButton: "Already a member? Sign in here",
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 size={48} />
                </motion.div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tighter">Welcome Aboard!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mb-8">
                    Your premium account has been created successfully. Redirecting you to login...
                </p>
                <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity }} className="h-full bg-primary-600 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden py-20 px-4">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 opacity-50">
                <Ripple mainCircleSize={300} />
                <div className="absolute inset-0 pointer-events-none">
                    <TechOrbitDisplay iconsArray={iconsArray} text="Join Next-Gen" />
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-xl"
            >
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[3rem] border border-white dark:border-slate-800 shadow-2xl overflow-hidden shadow-primary-500/5">
                    {/* Role Selector Header */}
                    <div className="p-8 md:p-12 pb-0">
                        <div className="flex flex-col items-center mb-10">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 mb-6 bg-primary-50 dark:bg-primary-900/40 px-4 py-2 rounded-full">
                                Step 1: Choose Your Journey
                            </h3>
                            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                {[
                                    { id: 'job_seeker', label: 'Job Seeker', icon: <UserCircle size={22} />, desc: 'I want to find works' },
                                    { id: 'recruiter', label: 'Recruiter', icon: <Briefcase size={22} />, desc: 'I want to hire talent' }
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setFormData(p => ({ ...p, role: role.id }))}
                                        className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 group
                                            ${formData.role === role.id
                                                ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-500/30'
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-primary-200 dark:hover:border-primary-900/30'
                                            }
                                        `}
                                    >
                                        <div className={`p-2 rounded-xl transition-colors ${formData.role === role.id ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                                            {role.icon}
                                        </div>
                                        <div className="text-center">
                                            <p className={`font-bold text-sm ${formData.role === role.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{role.label}</p>
                                            <p className={`text-[10px] mt-0.5 opacity-60 font-semibold uppercase tracking-wider`}>{role.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold border border-red-100 dark:border-red-900/40"
                                >
                                    <AlertCircle size={18} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-8 md:p-12 pt-4">
                        <AuthTabs
                            formFields={formFields}
                            goTo={() => navigate('/login')}
                            handleSubmit={handleSubmit}
                        />

                        <div className="mt-8 flex justify-center">
                            <Link to="/" className="text-slate-400 hover:text-primary-600 transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2 group">
                                <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                                Return to Base
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
};

export default SignupPage;
