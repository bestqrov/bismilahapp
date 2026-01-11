'use client';

import { useEffect, useState } from 'react';
import { Users, Calendar, BookOpen, Bell, Award, Clock, Star } from 'lucide-react';

// Simple Card components to avoid import issues
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
        {children}
    </h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 pt-0 ${className}`}>
        {children}
    </div>
);

interface DashboardData {
    groups: any[];
    courses: any[];
    sessions: any[];
    notifications: any[];
}

export default function TeacherDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { default: api } = await import('../../lib/api');
            const response = await api.get('/teacher/dashboard');
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl min-h-[200px]">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url(/tdb.png)' }}
                ></div>
                <div className="relative z-10 bg-gradient-to-r from-black/60 via-purple-900/60 to-blue-900/60 p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Tableau de Bord Professeur</h1>
                            <p className="text-blue-100 text-lg">Gérez vos cours et suivez vos élèves</p>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center space-x-2">
                                    <Award className="w-6 h-6 text-yellow-300" />
                                    <span className="text-sm font-medium">Excellent Professeur</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">Mes Groupes</p>
                                <p className="text-3xl font-bold text-blue-800">{data?.groups?.length || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 mb-1">Séances Aujourd'hui</p>
                                <p className="text-3xl font-bold text-green-800">{data?.sessions?.length || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 mb-1">Total Élèves</p>
                                <p className="text-3xl font-bold text-purple-800">156</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 mb-1">Notifications</p>
                                <p className="text-3xl font-bold text-orange-800">{data?.notifications?.length || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Sessions */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <span>Séances Récentes</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data?.sessions?.slice(0, 5).map((session, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{session.group?.name || 'Groupe'}</p>
                                                <p className="text-sm text-slate-600">{session.date} • {session.startTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                Confirmé
                                            </span>
                                        </div>
                                    </div>
                                )) || (
                                    <div className="text-center py-8 text-slate-500">
                                        Aucune séance récente
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Notifications */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Star className="w-5 h-5 text-purple-600" />
                                <span>Actions Rapides</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <button className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3">
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-medium">Nouvelle Séance</span>
                                </button>
                                <button className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-3">
                                    <Users className="w-5 h-5" />
                                    <span className="font-medium">Marquer Présence</span>
                                </button>
                                <button className="w-full p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3">
                                    <Bell className="w-5 h-5" />
                                    <span className="font-medium">Envoyer Notification</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Bell className="w-5 h-5 text-orange-600" />
                                <span>Notifications Récentes</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data?.notifications?.slice(0, 3).map((notification, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Bell className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800">{notification.title}</p>
                                            <p className="text-xs text-slate-600 truncate">{notification.message}</p>
                                        </div>
                                    </div>
                                )) || (
                                    <div className="text-center py-4 text-slate-500 text-sm">
                                        Aucune notification
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}