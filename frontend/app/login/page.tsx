'use client';
import React, { useState, useEffect } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useSchoolProfile } from '@/hooks/useSchoolProfile';
import { GraduationCap, X } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const login = useAuthStore(state => state.login);
    const { profile, loading } = useSchoolProfile();

    useEffect(() => {
        const token = (typeof window !== 'undefined') ? localStorage.getItem('accessToken') : null;
        if (token) {
            // Already logged in logic
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res = await login(email.trim(), password);
        if (!res.success) return setError(res.message || 'Login failed');

        const user = useAuthStore.getState().user;
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') router.push('/admin');
        else if (user?.role === 'SECRETARY') router.push('/secretary');
        else if (user?.role === 'TEACHER') router.push('/teacher');
        else router.push('/');
    };

    return (
        <div className="h-screen flex flex-col lg:flex-row bg-white font-sans text-slate-900 overflow-hidden">
            {/* Left Column: Branded Visual Section (Fixed height/width) */}
            <div className="hidden lg:flex lg:w-1/2 h-full relative bg-slate-900 items-center justify-center p-12 overflow-hidden group shrink-0">
                {/* Background Banner with deep overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900/95 to-purple-900/90"></div>
                    {/* Animated background elements */}
                    <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-32 right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
                </div>

                {/* Animated Branding Elements */}
                <div className="relative z-10 text-center max-w-lg px-8 animate-in fade-in zoom-in duration-1000 ease-out">
                    <div className="mb-8">
                        <div className="text-center">
                            <h2 className="text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                                Arwa<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">educ</span>
                            </h2>
                            <div className="h-1.5 w-24 bg-indigo-500 rounded-full mx-auto mb-8 shadow-[0_0_20px_rgba(99,102,241,0.6)]"></div>
                        </div>
                    </div>
                    <p className="text-indigo-100/80 text-xl font-medium leading-relaxed max-w-sm">
                        Votre partenaire éducatif pour une gestion scolaire moderne et efficace.
                    </p>
                </div>

                {/* Decorative Bottom Credits */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center text-white/20 text-[10px] font-black tracking-[0.4em] uppercase font-mono">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-[1px] bg-white/20"></div>
                        <span>ArwaEduc Platform</span>
                        <div className="w-8 h-[1px] bg-white/20"></div>
                    </div>
                </div>
            </div>

            {/* Right Column: Login Form Container */}
            <div className="w-full lg:w-1/2 h-screen flex flex-col px-8 sm:px-16 lg:px-24 py-4 lg:py-8 bg-white relative z-10 border-l border-slate-50 shadow-[-50px_0_100px_-50px_rgba(0,0,0,0.05)] overflow-y-auto lg:overflow-hidden custom-scrollbar">
                <div className="max-w-md w-full mx-auto flex flex-col h-full">

                    {/* Middle Section: Header & Form (Grows to fill space) */}
                    <div className="flex-1 flex flex-col justify-center min-h-0">
                        {/* Welcome Header */}
                        <div className="mb-6 lg:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 text-center">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-3 text-slate-900 leading-tight">
                                Bienvenue sur <span className="text-indigo-600">ArwaEduc</span>
                            </h1>
                            <p className="text-slate-600 text-lg font-medium">
                                Connectez-vous à votre espace sécurisé
                            </p>
                        </div>

                        {/* Error Notification */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-3xl border-2 border-red-100 flex items-center gap-4 animate-shake shadow-sm">
                                <div className="p-2 bg-red-100 rounded-2xl">
                                    <X size={18} className="text-red-700" />
                                </div>
                                <span className="font-extrabold">{error}</span>
                            </div>
                        )}

                        {/* Credentials Input Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="off"
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all duration-300 placeholder:text-slate-400 font-bold text-lg shadow-sm"
                                placeholder="Adresse e-mail"
                            />

                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all duration-300 placeholder:text-slate-400 font-bold text-lg shadow-sm"
                                placeholder="Mot de passe"
                            />

                            <div className="pt-4 lg:pt-6">
                                <Button className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-[0_20px_45px_-10px_rgba(79,70,229,0.4)] transform active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-4 group">
                                    Accéder au portail
                                    <svg className="w-6 h-6 transform group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Button>
                            </div>

                            {/* Quick Login as Teacher */}
                            <div className="pt-4">
                                <Button
                                    type="button"
                                    onClick={async () => {
                                        setError(null);
                                        const res = await login('ahmed.teacher@enovazone.com', 'teacher123');
                                        if (!res.success) return setError(res.message || 'Login failed');

                                        const user = useAuthStore.getState().user;
                                        if (user?.role === 'TEACHER') router.push('/teacher');
                                        else setError('Not a teacher account');
                                    }}
                                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-[2rem] font-bold text-lg shadow-[0_20px_45px_-10px_rgba(34,197,94,0.4)] transform active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    Connexion Rapide Professeur
                                    <GraduationCap className="w-5 h-5" />
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Bottom Section: Footer/Hint (Stays at bottom) */}
                    <div className="shrink-0 mt-8 pt-6 border-t border-slate-50 flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-500 text-center">
                        <div className="flex flex-col gap-2 text-slate-400 font-medium text-xs mt-2">
                            <div className="flex items-center justify-center gap-2">
                                <span>📧 Email :</span>
                                <a href="mailto:contact@arwaEduc.com" className="text-indigo-600 hover:underline font-bold">contact@arwaEduc.com</a>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span>📱 Gsm / WhatsApp :</span>
                                <a href="https://wa.me/212608183886" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-bold">+212 608183886</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .drop-shadow-glow {
                    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-10px); }
                    40%, 80% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
