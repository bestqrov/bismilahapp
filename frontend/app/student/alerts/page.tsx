'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import {
    Bell,
    AlertTriangle,
    Info,
    CheckCircle,
    Clock,
    Calendar,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Alert {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    createdAt: string;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
}

export default function StudentAlerts() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    useEffect(() => {
        if (user?.id) {
            fetchAlerts();
        }
    }, [user]);

    const fetchAlerts = async () => {
        try {
            const response = await fetch(`/api/students/${user!.id}/alerts`);
            const data = await response.json();
            if (data.success) {
                setAlerts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (alertId: string) => {
        try {
            const response = await fetch(`/api/students/${user!.id}/alerts/${alertId}/read`, {
                method: 'PUT'
            });
            const data = await response.json();
            if (data.success) {
                setAlerts(prev =>
                    prev.map(alert =>
                        alert.id === alertId
                            ? { ...alert, read: true }
                            : alert
                    )
                );
            }
        } catch (error) {
            console.error('Failed to mark alert as read:', error);
        }
    };

    const deleteAlert = async (alertId: string) => {
        try {
            const response = await fetch(`/api/students/${user!.id}/alerts/${alertId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                setAlerts(prev => prev.filter(alert => alert.id !== alertId));
            }
        } catch (error) {
            console.error('Failed to delete alert:', error);
        }
    };

    const getFilteredAlerts = () => {
        if (filter === 'all') return alerts;
        if (filter === 'unread') return alerts.filter(alert => !alert.read);
        return alerts.filter(alert => alert.read);
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />;
            default: return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'warning': return 'border-yellow-200 bg-yellow-50';
            case 'success': return 'border-green-200 bg-green-50';
            case 'error': return 'border-red-200 bg-red-50';
            default: return 'border-blue-200 bg-blue-50';
        }
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        return colors[priority as keyof typeof colors] || colors.low;
    };

    const unreadCount = alerts.filter(alert => !alert.read).length;

    if (loading) {
        return (
            <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <Sidebar currentPath={pathname} />
                <div className="flex-1 flex flex-col">
                    <TopBar />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement des alertes...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Sidebar currentPath={pathname} />
            <div className="flex-1 flex flex-col">
                <TopBar />
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Mes Alertes 🔔
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Restez informé des dernières nouvelles et annonces
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: 'Toutes' },
                                { key: 'unread', label: 'Non lues' },
                                { key: 'read', label: 'Lues' }
                            ].map(({ key, label }) => (
                                <Button
                                    key={key}
                                    onClick={() => setFilter(key as any)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        filter === key
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Alerts List */}
                    <div className="space-y-4">
                        {getFilteredAlerts().length === 0 ? (
                            <Card className="p-12 text-center">
                                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                    {filter === 'all'
                                        ? 'Aucune alerte pour le moment'
                                        : filter === 'unread'
                                            ? 'Toutes les alertes ont été lues'
                                            : 'Aucune alerte lue'
                                    }
                                </p>
                            </Card>
                        ) : (
                            getFilteredAlerts().map((alert) => (
                                <Card key={alert.id} className={`p-6 border-2 ${getAlertColor(alert.type)}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="flex-shrink-0 mt-1">
                                                {getAlertIcon(alert.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 mr-3">
                                                        {alert.title}
                                                    </h3>
                                                    {!alert.read && (
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                            Nouveau
                                                        </span>
                                                    )}
                                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(alert.priority)}`}>
                                                        {alert.priority === 'high' ? 'Urgent' :
                                                         alert.priority === 'medium' ? 'Important' : 'Normal'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-3">
                                                    {alert.message}
                                                </p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            {!alert.read && (
                                                <Button
                                                    onClick={() => markAsRead(alert.id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                                >
                                                    Marquer comme lu
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => deleteAlert(alert.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}