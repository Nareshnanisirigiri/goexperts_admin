import React, { useState } from 'react';
import logoFallback from '../assets/logo.png';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, Loader2, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface LoginPageProps {
    onLoginSuccess: (token: string, user: any) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const { settings } = useSiteSettings();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const logoUrl = settings.site_logo ? (settings.site_logo.startsWith('http') ? settings.site_logo : `${apiUrl}${settings.site_logo}`) : logoFallback;

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            if (response.data.success) {
                const user = response.data.user;
                if (user.roles?.includes('admin')) {
                    toast.success('Authentication Successful', {
                        description: `Identity verified. Welcome back, ${user.full_name}.`,
                        duration: 2000,
                    });

                    // Small delay to let the user see the success message
                    setTimeout(() => {
                        onLoginSuccess(response.data.token, user);
                    }, 1000);
                } else {
                    toast.error('Access Restricted', {
                        description: 'This area is reserved for administrators only. Your attempt has been logged.',
                        style: { background: '#1a1a1a', color: '#ff4b2b', border: '1px solid #331111' }
                    });
                }
            }
        } catch (error: any) {
            console.error('Login error:', error);

            let errorMessage = 'The authentication server could not be reached.';
            let description = '';

            if (error.response?.data) {
                const data = error.response.data;
                errorMessage = 'Authentication Failed';

                // Handle the specific array-style error message from validation
                if (Array.isArray(data.message)) {
                    description = data.message[0]?.message || 'Input validation failed.';
                } else if (typeof data.message === 'string') {
                    if (data.message.includes('No details found')) {
                        description = 'Account not discovered in the system. Please verify your email.';
                    } else if (data.message.includes('Invalid password')) {
                        description = 'The password provided is incorrect.';
                    } else {
                        description = data.message;
                    }
                }
            }

            toast.error(errorMessage, {
                description: description || 'Please check your credentials and try again.',
                style: { background: '#1a1a1a', color: '#ff4b2b', border: '1px solid #331111' }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error('Please enter your admin email first');
            setErrors({ email: 'Identity required for reset' });
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', { email });
            if (response.data.success) {
                toast.success('Security Link Sent', {
                    description: 'Check your inbox for the password reset instructions.',
                });
            }
        } catch (error: any) {
            toast.error('Reset Request Failed', {
                description: error.response?.data?.message || 'Could not initiate password reset.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-workspace min-h-screen">
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="login-story"
            >
                <div className="login-story-brand">
                    <div>
                        <img 
                            src={logoUrl} 
                            alt="Go Experts" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = logoFallback;
                            }}
                        />
                    </div>
                    <span>Go Experts</span>
                </div>
                <div className="login-story-copy">
                    <span>ADMINISTRATIVE WORKSPACE</span>
                    <h1>Run the platform with a clearer point of view.</h1>
                    <p>People, marketplace activity, content, trust, and revenue in one focused operating space.</p>
                </div>
                <div className="login-story-footer">
                    <ShieldCheck className="w-5 h-5" />
                    <div>
                        <strong>Protected access</strong>
                        <span>Administrator sessions are secured and monitored.</span>
                    </div>
                </div>
            </motion.section>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="login-panel"
            >
                <div className="login-card">
                    {/* Logo & Header */}
                    <div className="login-heading text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="bg-transparent flex items-center justify-center mx-auto mb-4"
                        >
                            <img src={logoUrl} alt="Go Experts" className="h-16 w-auto object-contain" />
                        </motion.div>
                        <span>WELCOME BACK</span>
                        <h1 className="text-2xl font-bold mb-2">Sign in to your workspace</h1>
                        <p className="text-sm">Use your administrator credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Admin Email</label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-500' : 'text-gray-500'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                    placeholder="admin@goexperts.in"
                                    className={`w-full bg-[#262626] border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-[#333333] focus:border-[#F24C20]'} text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 ${errors.email ? 'focus:ring-red-500/20' : 'focus:ring-[#F24C20]/20'} transition-all`}
                                />
                            </div>
                            {errors.email && (
                                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs ml-1">{errors.email}</motion.p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <div className="relative">
                                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-500' : 'text-gray-500'}`} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: undefined });
                                    }}
                                    placeholder="••••••••"
                                    className={`w-full bg-[#262626] border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-[#333333] focus:border-[#F24C20]'} text-white rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:ring-1 ${errors.password ? 'focus:ring-red-500/20' : 'focus:ring-[#F24C20]/20'} transition-all`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs ml-1">{errors.password}</motion.p>
                            )}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs text-gray-500 hover:text-[#F24C20] transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="login-submit w-full bg-[#F24C20] hover:bg-[#d43a12] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Enter Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer Info */}
                    <div className="login-help mt-8 pt-6 text-center">
                        <p className="text-gray-500 text-xs">
                            This is a restricted area. All activities are logged and monitored.
                        </p>
                    </div>
                </div>

                {/* Quick Help */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-6"
                >
                    <a href="http://localhost:5175" className="text-gray-400 hover:text-white text-sm transition-colors">
                        ← Back to Main Website
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
}
