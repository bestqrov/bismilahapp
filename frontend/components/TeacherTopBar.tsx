'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, User, Calendar, Clock, Sun, Moon } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

export default function TeacherTopBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Load theme
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }

    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                  Bonjour, {user?.name} 👋
                </h1>
                <p className="text-sm text-slate-600">
                  {formatDate(currentTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Center Section - Current Time */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-50 rounded-lg px-4 py-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              {formatTime(currentTime)}
            </span>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
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

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-800">12</div>
                <div className="text-xs text-slate-600">Séances</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-800">98%</div>
                <div className="text-xs text-slate-600">Présence</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}