import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-8 h-8 text-primary-600" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                                JobPortal
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Features</a>
                            <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">About</a>
                            <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors font-medium">Log in</Link>
                            <Link to="/signup" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-all shadow-lg shadow-primary-500/20 font-medium">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold tracking-wide uppercase">
                            The Future of Hiring is Here
                        </span>
                        <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Find the perfect job <br />
                            <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent italic">
                                in real-time
                            </span>
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                            Our AI-powered platform connects recruiters and job seekers instantly.
                            Build your career or find top talent with our premium, secure ecosystem.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup?role=job_seeker" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-lg font-semibold transition-all shadow-xl shadow-primary-500/25 flex items-center justify-center gap-2">
                                I'm a Job Seeker <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/signup?role=recruiter" className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                I'm a Recruiter
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-white dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Live Jobs', value: '12k+' },
                            { label: 'Companies', value: '800+' },
                            { label: 'Hired Monthly', value: '4k+' },
                            { label: 'Active Users', value: '100k+' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-3xl md:text-4xl font-bold text-primary-600">{stat.value}</div>
                                <div className="mt-2 text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Why Choose JobPortal?</h2>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">Everything you need to succeed in the job market.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Building2 className="w-6 h-6" />,
                                title: "For Companies",
                                desc: "Streamlined recruitment process, AI applicant tracking, and real-time collaboration tools."
                            },
                            {
                                icon: <Users className="w-6 h-6" />,
                                title: "For Talent",
                                desc: "Personalized job alerts, direct chat with recruiters, and one-click applications."
                            },
                            {
                                icon: <ShieldCheck className="w-6 h-6" />,
                                title: "Secure & Verified",
                                desc: "Rigorous verification process for recruiters and seekers to ensure trust and safety."
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-primary-600" />
                        <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">JobPortal</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-500 text-sm">
                        © 2026 JobPortal Inc. All rights reserved. Built with React & Flask.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors">Privacy</a>
                        <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors">Terms</a>
                        <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
