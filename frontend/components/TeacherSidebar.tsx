'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckCircle,
  Bell,
  BookOpen,
  GraduationCap,
  Clock,
  User,
  LogOut,
  Menu,
  X,
  Star,
  Award,
  Target
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

interface TeacherSidebarProps {
  menuItems?: Array<{
    name: string;
    href: string;
    icon: string;
    description?: string;
    color?: string;
    bgColor?: string;
    iconColor?: string;
    section?: string;
  }>;
}

const teacherMenuItems = [
  // Dashboard
  {
    name: 'Tableau de Bord',
    href: '/teacher',
    icon: 'LayoutDashboard',
    description: 'Vue d\'ensemble',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    section: 'dashboard'
  },
  // Teaching Management
  {
    name: 'Mes Groupes',
    href: '/teacher/groups',
    icon: 'Users',
    description: 'Gérer mes classes',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    section: 'teaching'
  },
  {
    name: 'Mes Séances',
    href: '/teacher/sessions',
    icon: 'Calendar',
    description: 'Planning des cours',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    section: 'teaching'
  },
  {
    name: 'Mes Cours',
    href: '/teacher/courses',
    icon: 'BookOpen',
    description: 'Gérer mes cours',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    section: 'teaching'
  },
  // Attendance & Tracking
  {
    name: 'Présence',
    href: '/teacher/attendance',
    icon: 'CheckCircle',
    description: 'Marquer présence',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    section: 'tracking'
  }
];

const iconMap = {
  LayoutDashboard,
  Users,
  Calendar,
  CheckCircle,
  Bell,
  BookOpen,
  GraduationCap,
  Clock,
  User,
  LogOut,
  Menu,
  X,
  Star,
  Award,
  Target
};

export default function TeacherSidebar({ menuItems = teacherMenuItems }: TeacherSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const user = useAuthStore(state => state.user);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl w-80">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Espace Prof</h2>
              <p className="text-xs text-slate-400">Arwa Education</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {/* Teaching Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
            Enseignement
          </h3>
          {menuItems.filter(item => item.section === 'teaching').map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const active = isActive(item.href);

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full p-4 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25'
                    : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : item.bgColor} transition-colors`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : item.iconColor}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${active ? 'text-white' : 'text-slate-200'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                  {active && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tracking Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
            Suivi & Présence
          </h3>
          {menuItems.filter(item => item.section === 'tracking').map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const active = isActive(item.href);

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full p-4 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25'
                    : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : item.bgColor} transition-colors`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : item.iconColor}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${active ? 'text-white' : 'text-slate-200'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                  {active && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="w-full p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center space-x-3 font-medium shadow-lg"
        >
          <div className="p-2 rounded-lg bg-white/20">
            <LogOut className="w-5 h-5" />
          </div>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg text-white shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}