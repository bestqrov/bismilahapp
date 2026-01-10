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
  // Main Dashboard
  {
    name: 'Dashboard',
    href: '/teacher',
    icon: 'LayoutDashboard',
    description: 'Vue d\'ensemble',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    section: 'main'
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
  },
  // Communication
  {
    name: 'Notifications',
    href: '/teacher/notifications',
    icon: 'Bell',
    description: 'Messages & alertes',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    section: 'communication'
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <div className={`h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl ${isCollapsed ? 'w-20' : 'w-80'}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Espace Prof</h2>
                <p className="text-xs text-slate-400">Arwa Education</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Teacher Info */}
      {!isCollapsed && (
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name} {user?.surname}
              </p>
              <p className="text-xs text-slate-400">Professeur</p>
              <div className="flex items-center mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-slate-400 ml-1">4.8/5.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {/* Main Section */}
        <div className="space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
              Principal
            </h3>
          )}
          {menuItems.filter(item => item.section === 'main').map((item) => {
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
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${active ? 'text-white' : 'text-slate-200'}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                  )}
                  {active && !isCollapsed && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Teaching Section */}
        <div className="space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
              Enseignement
            </h3>
          )}
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
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${active ? 'text-white' : 'text-slate-200'}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                  )}
                  {active && !isCollapsed && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tracking Section */}
        <div className="space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
              Suivi & Présence
            </h3>
          )}
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
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${active ? 'text-white' : 'text-slate-200'}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                  )}
                  {active && !isCollapsed && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Communication Section */}
        <div className="space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
              Communication
            </h3>
          )}
          {menuItems.filter(item => item.section === 'communication').map((item) => {
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
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${active ? 'text-white' : 'text-slate-200'}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                  )}
                  {active && !isCollapsed && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Stats Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-700/50">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg mb-3">
            Statistiques
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-3 text-center border border-blue-500/20">
              <div className="text-lg font-bold text-white">12</div>
              <div className="text-xs text-slate-400">Groupes</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg p-3 text-center border border-green-500/20">
              <div className="text-lg font-bold text-white">156</div>
              <div className="text-xs text-slate-400">Élèves</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg p-3 text-center border border-orange-500/20">
              <div className="text-lg font-bold text-white">98%</div>
              <div className="text-xs text-slate-400">Présence</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-3 text-center border border-purple-500/20">
              <div className="text-lg font-bold text-white">4.8</div>
              <div className="text-xs text-slate-400">Note</div>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="w-full p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center space-x-3 font-medium shadow-lg"
        >
          <div className="p-2 rounded-lg bg-white/20">
            <LogOut className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span>Déconnexion</span>
          )}
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