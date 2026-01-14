'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, BookOpen, Bell, Award, Clock, Star, TrendingUp, CheckCircle, AlertCircle, X } from 'lucide-react';
import NewSessionModal from '@/components/NewSessionModal';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

// Simple Card components to avoid import issues
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-xl font-semibold leading-none tracking-tight text-gray-800 ${className}`}>
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
    stats: {
        totalStudents: number;
        totalGroups: number;
        totalSessions: number;
        todaySessions: number;
        attendanceRate: number;
        totalNotifications: number;
    };
    attendanceStats: any;
    studentStats: any[];
    recentActivities: any[];
}

export default function TeacherDashboard() {
    const router = useRouter();
    const { user, accessToken } = useAuthStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNewSessionModal, setShowNewSessionModal] = useState(false);
    const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
    const [showSendAlertModal, setShowSendAlertModal] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/teacher/dashboard');
            console.log('Dashboard response:', response.data);
            if (response.data.success) {
                setData(response.data.data);
            } else {
                console.error('Failed to fetch dashboard data:', response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check authentication
        if (!accessToken || !user || user.role !== 'TEACHER') {
            router.push('/login');
            return;
        }

        fetchDashboardData();
    }, [accessToken, user, router]);

    const handleCreateCourse = async (courseData: any) => {
        try {
            await api.post('/teacher/courses', courseData);
            setShowCreateCourseModal(false);
            // Refresh dashboard data
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to create course:', error);
        }
    };

    const handleSendAlert = async (alertData: any) => {
        try {
            await api.post('/teacher/notifications', alertData);
            setShowSendAlertModal(false);
            // Refresh dashboard data
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to send alert:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section with Background */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'url(/assits/tdb.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }}></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Espace Professeur</h1>
                            <p className="text-blue-100 text-xl">Bienvenue dans votre tableau de bord pédagogique</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <Award className="w-6 h-6 text-yellow-800" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-100">Statut</p>
                                        <p className="text-lg font-bold">Professeur Certifié</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium mb-1">Mes Classes</p>
                                    <p className="text-3xl font-bold">{data?.stats?.totalGroups || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium mb-1">Séances Aujourd'hui</p>
                                    <p className="text-3xl font-bold">{data?.stats?.todaySessions || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium mb-1">Total Élèves</p>
                                    <p className="text-3xl font-bold">{data?.stats?.totalStudents || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium mb-1">Notifications</p>
                                    <p className="text-3xl font-bold">{data?.stats?.totalNotifications || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Bell className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Sessions & Schedule */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Today's Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <span>Emploi du Temps - Aujourd'hui</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data?.sessions?.slice(0, 4).map((session, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                                    <Calendar className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{session.group?.name || 'Classe'}</p>
                                                    <p className="text-sm text-gray-600">{session.startTime} - {session.endTime || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center space-x-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Confirmé</span>
                                                </span>
                                            </div>
                                        </div>
                                    )) || (
                                        <div className="text-center py-8">
                                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">Aucune séance programmée aujourd'hui</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <span>Activités Récentes</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data?.recentActivities?.slice(0, 3).map((activity, index) => {
                                        const IconComponent = activity.icon === 'CheckCircle' ? CheckCircle :
                                                             activity.icon === 'Bell' ? Bell :
                                                             activity.icon === 'BookOpen' ? BookOpen : CheckCircle;

                                        const bgColor = activity.color === 'green' ? 'bg-green-50' :
                                                       activity.color === 'blue' ? 'bg-blue-50' :
                                                       activity.color === 'purple' ? 'bg-purple-50' : 'bg-green-50';

                                        const iconBgColor = activity.color === 'green' ? 'bg-green-500' :
                                                           activity.color === 'blue' ? 'bg-blue-500' :
                                                           activity.color === 'purple' ? 'bg-purple-500' : 'bg-green-500';

                                        return (
                                            <div key={activity.id || index} className={`flex items-center space-x-4 p-4 ${bgColor} rounded-xl`}>
                                                <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
                                                    <IconComponent className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{activity.title}</p>
                                                    <p className="text-sm text-gray-600">{activity.description}</p>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </span>
                                            </div>
                                        );
                                    }) || (
                                        <div className="text-center py-8">
                                            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">Aucune activité récente</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Quick Actions & Info */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Star className="w-5 h-5 text-indigo-600" />
                                    <span>Actions Rapides</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setShowNewSessionModal(true)}
                                        className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3 font-medium shadow-sm"
                                    >
                                        <Calendar className="w-5 h-5" />
                                        <span>Planifier une Séance</span>
                                    </button>
                                    <button
                                        onClick={() => router.push('/teacher/attendance')}
                                        className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-3 font-medium shadow-sm"
                                    >
                                        <Users className="w-5 h-5" />
                                        <span>Gérer les Présences</span>
                                    </button>
                                    <button
                                        onClick={() => setShowCreateCourseModal(true)}
                                        className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 font-medium shadow-sm"
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        <span>Créer un Cours</span>
                                    </button>
                                    <button
                                        onClick={() => setShowSendAlertModal(true)}
                                        className="w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-3 font-medium shadow-sm"
                                    >
                                        <Bell className="w-5 h-5" />
                                        <span>Envoyer une Alerte</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    <span>Performance</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Taux de Présence</span>
                                        <span className="text-sm font-bold text-green-600">{data?.stats?.attendanceRate || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data?.stats?.attendanceRate || 0}%` }}></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Total Séances</span>
                                        <span className="text-sm font-bold text-blue-600">{data?.stats?.totalSessions || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Élèves Actifs</span>
                                        <span className="text-sm font-bold text-purple-600">{data?.stats?.totalStudents || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <NewSessionModal
                isOpen={showNewSessionModal}
                onClose={() => setShowNewSessionModal(false)}
                onSuccess={() => {
                    setShowNewSessionModal(false);
                    fetchDashboardData();
                }}
            />

            {/* Create Course Modal */}
            {showCreateCourseModal && (
                <CreateCourseModal
                    isOpen={showCreateCourseModal}
                    onClose={() => setShowCreateCourseModal(false)}
                    onSuccess={(courseData) => handleCreateCourse(courseData)}
                />
            )}

            {/* Send Alert Modal */}
            {showSendAlertModal && (
                <SendAlertModal
                    isOpen={showSendAlertModal}
                    onClose={() => setShowSendAlertModal(false)}
                    onSuccess={(alertData) => handleSendAlert(alertData)}
                />
            )}
        </div>
    );
}

// Modal Components
function CreateCourseModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: (data: any) => void }) {
    const [formData, setFormData] = useState({
        name: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSuccess(formData);
            setFormData({ name: '' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Créer un Nouveau Cours</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Cours</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Création...' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SendAlertModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: (data: any) => void }) {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        targetGroups: [] as number[],
    });
    const [groups, setGroups] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchGroups();
        }
    }, [isOpen]);

    const fetchGroups = async () => {
        try {
            const response = await fetch('/api/teacher/groups');
            const data = await response.json();
            if (data.success) {
                setGroups(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSuccess(formData);
            setFormData({ title: '', message: '', type: 'info', targetGroups: [] });
        } finally {
            setSubmitting(false);
        }
    };

    const toggleGroup = (groupId: number) => {
        setFormData(prev => ({
            ...prev,
            targetGroups: prev.targetGroups.includes(groupId)
                ? prev.targetGroups.filter(id => id !== groupId)
                : [...prev.targetGroups, groupId]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Envoyer une Alerte</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type d'Alerte</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="info">Information</option>
                            <option value="warning">Avertissement</option>
                            <option value="success">Succès</option>
                            <option value="error">Erreur</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Groupes Cibles</label>
                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                            {groups.map((group) => (
                                <label key={group.id} className="flex items-center space-x-2 py-1">
                                    <input
                                        type="checkbox"
                                        checked={formData.targetGroups.includes(group.id)}
                                        onChange={() => toggleGroup(group.id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{group.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Envoi...' : 'Envoyer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}