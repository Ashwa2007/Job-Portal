import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginSuccess: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/dashboard');
        }, 3000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070"
                    alt="Success Background"
                    className="w-full h-full object-cover opacity-20 dark:opacity-10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-50 dark:from-slate-950 dark:to-slate-950" />
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 text-center space-y-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-12 rounded-[3rem] border border-white/20 dark:border-slate-800/50 shadow-2xl"
            >
                <div className="flex justify-center">
                    <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/40"
                    >
                        <CheckCircle2 size={56} />
                    </motion.div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Authenticating Success
                    </h1>
                    <TextShimmer
                        duration={2}
                        className="text-xl font-bold [--base-color:theme(colors.primary.600)] [--base-gradient-color:theme(colors.primary.100)] dark:[--base-color:theme(colors.primary.400)] dark:[--base-gradient-color:theme(colors.white)]"
                    >
                        Preparing your professional journey...
                    </TextShimmer>
                </div>

                <div className="pt-4 flex justify-center">
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.2, 1, 0.2]
                                }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    delay: i * 0.25
                                }}
                                className="w-3 h-3 bg-primary-600 rounded-full shadow-lg shadow-primary-500/50"
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginSuccess;
