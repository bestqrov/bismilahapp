'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Cloud, Bell, Search, Menu, Timer, Sparkles, User } from 'lucide-react';
import axios from 'axios';
import { useSchoolProfile } from '@/hooks/useSchoolProfile';
import useAuthStore from '@/store/useAuthStore';

export default function TopBar() {
    const { profile } = useSchoolProfile();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [prayerTimes, setPrayerTimes] = useState<any>(null);
    const [nextPrayer, setNextPrayer] = useState<any>(null);
    const [adminName, setAdminName] = useState('');
    const [adminRole, setAdminRole] = useState('Administrateur');

    const pathname = usePathname();

    const user = useAuthStore(state => state.user);

    // Load theme and user info
    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark';
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        }

        if (user) {
            const name = `${user.name} ${user.surname || ''}`.trim();
            setAdminName(name);
            setAdminRole(user.role === 'ADMIN' ? 'Administrateur' : 'Secrétaire');
        }

        // Fetch Athan Times
        const fetchAthan = async (lat: number, lon: number) => {
            try {
                const date = new Date();
                const res = await axios.get(`https://api.aladhan.com/v1/timings/${Math.floor(date.getTime() / 1000)}?latitude=${lat}&longitude=${lon}&method=3`);
                const timings = res.data.data.timings;
                setPrayerTimes(timings);

                // Identify next prayer
                const now = date.getHours() * 60 + date.getMinutes();
                const prayers = [
                    { name: 'Fajr', time: timings.Fajr },
                    { name: 'Dhuhr', time: timings.Dhuhr },
                    { name: 'Asr', time: timings.Asr },
                    { name: 'Maghrib', time: timings.Maghrib },
                    { name: 'Isha', time: timings.Isha }
                ];

                const upcoming = prayers.find(p => {
                    const [h, m] = p.time.split(':').map(Number);
                    return (h * 60 + m) > now;
                }) || prayers[0];

                setNextPrayer(upcoming);
            } catch (error) {
                console.error('Failed to fetch Athan times:', error);
            }
        };

        const getFallbackLocation = async () => {
            try {
                const res = await axios.get('https://ipapi.co/json/');
                if (res.data.latitude && res.data.longitude) {
                    fetchAthan(res.data.latitude, res.data.longitude);
                }
            } catch (e) {
                fetchAthan(33.5731, -7.5898); // Casablanca
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => fetchAthan(position.coords.latitude, position.coords.longitude),
                () => getFallbackLocation(),
                { timeout: 5000 }
            );
        } else {
            getFallbackLocation();
        }
    }, [pathname, user]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('app-theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    return (
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left Section - Welcome Message */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-slate-800">
                                    Bonjour, {adminName} 👋
                                </h1>
                                <p className="text-sm text-slate-600">
                                    {adminRole}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Center Section - Search */}
                    <div className="hidden md:flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center space-x-3">
                        {/* Search Mobile */}
                        <button className="md:hidden p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5" />
                            ) : (
                                <Sun className="w-5 h-5" />
                            )}
                        </button>

                        {/* Notifications */}
                        <button className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                            </span>
                        </button>
                    </div>
                </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5 cursor-pointer">
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-0.5 flex items-center justify-center overflow-hidden">
                            {profile.logo ? (
                                <img
                                    src={profile.logo}
                                    alt="School Logo"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName || 'User')}&background=random`}
                                    alt={adminName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
