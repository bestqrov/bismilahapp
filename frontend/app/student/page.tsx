'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import QRCode from 'react-qr-code';
import {
    QrCode,
    CreditCard,
    Calendar,
    BookOpen,
    DollarSign,
    Bell,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DashboardData {
    student: {
        id: string;
        name: string;
        schoolLevel?: string;
        groups: any[];
    };
    assignments: any[];
    notifications: any[];
    payments: any[];
}

export default function StudentDashboard() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchDashboard();
        }
    }, [user]);

    const fetchDashboard = async () => {
        try {
            const response = await fetch(`/api/students/${user!.id}/dashboard`);
            const data = await response.json();
            if (data.success) {
                setDashboardData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Chargement...</div>;

    const qrValue = `STUDENT:${user?.id}`;

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Sidebar currentPath={pathname} />
            <div className="flex-1 flex flex-col">
                <TopBar />
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Bonjour, {user?.name} ! 👋
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Bienvenue sur votre tableau de bord étudiant
                                </p>
                            </div>
                            <div className="hidden md:flex items-center space-x-4">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/20">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {new Date().toLocaleDateString('fr-FR', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Devoirs en attente</p>
                                        <p className="text-3xl font-bold">{dashboardData?.assignments.length || 0}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Notifications</p>
                                        <p className="text-3xl font-bold">{dashboardData?.notifications.length || 0}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Bell className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium">Paiements</p>
                                        <p className="text-3xl font-bold">{dashboardData?.payments.length || 0}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm font-medium">Groupes</p>
                                        <p className="text-3xl font-bold">{dashboardData?.student.groups?.length || 0}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <User className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Actions Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                        {/* QR Code Card - Enhanced */}
                        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-1">
                                <div className="bg-white rounded-t-lg">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                                <QrCode className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Mon QR Code</h3>
                                                <p className="text-sm text-gray-600">Carte d'identité numérique</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center mb-6">
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl border-2 border-gray-200 shadow-inner">
                                                <QRCode
                                                    value={qrValue}
                                                    size={140}
                                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Button
                                                onClick={() => window.print()}
                                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                            >
                                                <CreditCard className="h-4 w-4 mr-2" />
                                                Imprimer ma carte
                                            </Button>
                                            <Button
                                                onClick={() => window.open('/student/card', '_blank')}
                                                variant="secondary"
                                                className="w-full border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300"
                                            >
                                                Voir la carte complète
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Schedule Card - Enhanced */}
                        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1">
                                <div className="bg-white rounded-t-lg">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Emploi du Temps</h3>
                                                <p className="text-sm text-gray-600">Consultez votre planning</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-gray-700">Aujourd'hui</span>
                                                </div>
                                                <span className="text-sm text-blue-600 font-medium">2 séances</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-700">Cette semaine</span>
                                                </div>
                                                <span className="text-sm text-gray-600 font-medium">8 séances</span>
                                            </div>
                                        </div>

                                        <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                            Voir l'emploi du temps
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Assignments Card - Enhanced */}
                        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1">
                                <div className="bg-white rounded-t-lg">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                                <BookOpen className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Devoirs & Exercices</h3>
                                                <p className="text-sm text-gray-600">Suivez vos progrès</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">En attente</span>
                                                <span className="text-lg font-bold text-orange-600">{dashboardData?.assignments.filter(a => a.status === 'pending').length || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Terminés</span>
                                                <span className="text-lg font-bold text-green-600">{dashboardData?.assignments.filter(a => a.status === 'completed').length || 0}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '65%'}}></div>
                                            </div>
                                        </div>

                                        <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                            Voir mes devoirs
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Payments Card - Enhanced */}
                        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                                <div className="bg-white rounded-t-lg">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <DollarSign className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Paiements</h3>
                                                <p className="text-sm text-gray-600">Suivez vos paiements</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                <span className="text-sm text-green-700 font-medium">Payé</span>
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                                <span className="text-sm text-orange-700 font-medium">En attente</span>
                                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                            </div>
                                        </div>

                                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                            Voir mes paiements
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-600" />
                                    Actions Rapides
                                </h3>
                                <div className="space-y-3">
                                    <Button variant="secondary" className="w-full justify-start border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
                                        <Bell className="h-4 w-4 mr-2" />
                                        Voir les notifications
                                    </Button>
                                    <Button variant="secondary" className="w-full justify-start border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Mes résultats
                                    </Button>
                                    <Button variant="secondary" className="w-full justify-start border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300">
                                        <User className="h-4 w-4 mr-2" />
                                        Mon profil
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Recent Activity Card */}
                        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-indigo-600" />
                                    Activité Récente
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Présence marquée</p>
                                            <p className="text-xs text-gray-600">Mathématiques - Aujourd'hui 14:00</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Devoir soumis</p>
                                            <p className="text-xs text-gray-600">Français - Hier 18:30</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Paiement effectué</p>
                                            <p className="text-xs text-gray-600">Mensualité Septembre - 15 Sep</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Notifications Section - Enhanced */}
                    <Card className="bg-white border-0 shadow-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <Bell className="h-6 w-6 text-indigo-600" />
                                    Notifications Récentes
                                </h2>
                                <Button variant="secondary" size="sm">
                                    Voir tout
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {dashboardData?.notifications.slice(0, 3).map((notif: any) => (
                                    <div key={notif.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Bell className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-1">{notif.title}</h4>
                                            <p className="text-sm text-gray-600 line-clamp-2">{notif.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2"></div>
                                        )}
                                    </div>
                                ))}

                                {(!dashboardData?.notifications || dashboardData.notifications.length === 0) && (
                                    <div className="text-center py-8">
                                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Aucune notification pour le moment</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}