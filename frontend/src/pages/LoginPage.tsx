import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Ripple,
    AuthTabs,
    TechOrbitDisplay
} from '../components/ui/modern-animated-sign-in';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertCircle } from 'lucide-react';

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
        className: 'size-[4 0px] border-none bg-transparent',
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
    },
    {
        component: () => (
            <img
                width={50}
                height={50}
                src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg'
                alt='TypeScript'
            />
        ),
        className: 'size-[50px] border-none bg-transparent',
        radius: 220,
        duration: 30,
        delay: 15,
        path: false,
        reverse: true,
    }
];

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // AnimatedForm passes label as name
        const mappedName = name.toLowerCase();
        setFormData(prev => ({ ...prev, [mappedName]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://127.0.0.1:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'The email or password you entered is incorrect.');
                return;
            }

            const data = await response.json();
            login(data.user, data.access_token);
            navigate('/login-success');
        } catch (error) {
            console.error('Login error details:', error);
            setError(`Connection Error: Unable to reach login server (127.0.0.1:5001).`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage(data.message);
                setMode('reset');
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp, new_password: newPassword })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Password reset successfully! You can now login.');
                setMode('login');
                setOtp('');
                setNewPassword('');
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Google login failed.');
                return;
            }

            const data = await response.json();
            login(data.user, data.access_token);
            navigate('/login-success');
        } catch (error) {
            console.error('Google login error:', error);
            setError('Connection Error: Unable to reach auth server.');
        } finally {
            setIsLoading(false);
        }
    };

    const formFields = {
        header: 'Welcome Back',
        subHeader: 'Login to your premium career portal',
        fields: [
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
                placeholder: '••••••••',
                onChange: handleInputChange,
            },
        ],
        submitButton: isLoading ? 'Signing in...' : 'Sign In',
        textVariantButton: "Create a new account instead",
    };

    const forgotFields = {
        header: 'Reset Password',
        subHeader: 'Enter your email to receive an OTP',
        fields: [
            {
                label: 'Email',
                required: true,
                type: 'email',
                placeholder: 'john@example.com',
                onChange: handleInputChange,
            },
        ],
        submitButton: isLoading ? 'Sending...' : 'Send OTP',
    };

    const resetFields = {
        header: 'New Password',
        subHeader: `Verify the OTP sent to ${formData.email}`,
        fields: [
            {
                label: 'OTP',
                required: true,
                type: 'otp',
                placeholder: '6-digit code',
                onChange: (e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value),
            },
            {
                label: 'New Password',
                required: true,
                type: 'password',
                placeholder: 'Min 6 characters',
                onChange: (e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value),
            },
        ],
        submitButton: isLoading ? 'Resetting...' : 'Reset Password',
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <Ripple mainCircleSize={200} className="opacity-40" />
                <div className="absolute inset-0 pointer-events-none">
                    <TechOrbitDisplay iconsArray={iconsArray} text="Secure Auth" />
                </div>
            </div>

            {/* Centered Glassmorphism Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-lg p-1"
            >
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-slate-800/50 shadow-2xl p-8 md:p-12">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30 mb-6">
                            <ShieldCheck className="text-white w-10 h-10" />
                        </div>

                        <AnimatePresence mode='wait'>
                            {(error || successMessage) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`w-full mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${error
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400'
                                        : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400'
                                        }`}
                                >
                                    {error ? <AlertCircle size={18} /> : <ShieldCheck size={18} />}
                                    {error || successMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {mode === 'login' && (
                        <>
                            <AuthTabs
                                formFields={formFields}
                                goTo={() => navigate('/signup')}
                                handleSubmit={handleSubmit}
                                googleLogin="Login with Google"
                                onGoogleSuccess={handleGoogleSuccess}
                            />
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => setMode('forgot')}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </>
                    )}

                    {mode === 'forgot' && (
                        <AuthTabs
                            formFields={forgotFields}
                            goTo={() => setMode('login')}
                            handleSubmit={handleForgotPassword}
                        />
                    )}

                    {mode === 'reset' && (
                        <AuthTabs
                            formFields={resetFields}
                            goTo={() => setMode('forgot')}
                            handleSubmit={handleResetPassword}
                        />
                    )}

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                        <Link to="/" className="text-slate-400 hover:text-primary-600 transition-colors text-sm font-bold flex items-center gap-2">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Visual Decorative Bubbles */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};

export default LoginPage;
