'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import { Bell, AlertTriangle, Info, CheckCircle, Calendar, DollarSign, BookOpen, Clock, User } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    studentId?: number;
    student?: {
        name: string;
        surname: string;
    };
}

export default function ParentAlerts() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch(`/api/parents/${user!.id}/notifications`);
            const data = await response.json();
            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
        }
    }, [user, fetchNotifications]);

    const markAsRead = async (notificationId: number) => {
        try {
            const response = await fetch(`/api/parents/${user!.id}/notifications/${notificationId}/read`, {
                method: 'PUT',
            });
            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? { ...notif, isRead: true }
                            : notif
                    )
                );
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
            await Promise.all(unreadIds.map(id => markAsRead(id)));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'À l&apos;instant';
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `Il y a ${diffInDays}j`;

        return date.toLocaleDateString('fr-FR');
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'holiday':
                return <Calendar className="h-5 w-5 text-blue-500" />;
            case 'exam':
                return <BookOpen className="h-5 w-5 text-red-500" />;
            case 'payment':
                return <DollarSign className="h-5 w-5 text-green-500" />;
            case 'announcement':
                return <Info className="h-5 w-5 text-purple-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'holiday':
                return 'border-blue-200 bg-blue-50';
            case 'exam':
                return 'border-red-200 bg-red-50';
            case 'payment':
                return 'border-green-200 bg-green-50';
            case 'announcement':
                return 'border-purple-200 bg-purple-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100">
                <Sidebar currentPath={pathname} />
                <div className="flex-1 flex flex-col">
                    <TopBar />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar currentPath={pathname} />
            <div className="flex-1 flex flex-col">
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Alertes & Notifications</h1>
                                <p className="text-gray-600">Restez informé des activités de vos enfants</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                >
                                    Tout marquer comme lu ({unreadCount})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <Card className="mb-6 p-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === 'all'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Toutes ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === 'unread'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Non lues ({unreadCount})
                            </button>
                            <button
                                onClick={() => setFilter('read')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === 'read'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Lues ({notifications.filter(n => n.isRead).length})
                            </button>
                        </div>
                    </Card>

                    {/* Notifications List */}
                    {filteredNotifications.length === 0 ? (
                        <Card className="p-8 text-center">
                            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {filter === 'unread' ? 'Aucune alerte non lue' : 'Aucune alerte'}
                            </h3>
                            <p className="text-gray-600">
                                {filter === 'unread'
                                    ? 'Vous avez lu toutes vos notifications.'
                                    : 'Vous n&apos;avez reçu aucune notification pour le moment.'
                                }
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredNotifications.map((notification) => (
                                <Card
                                    key={notification.id}
                                    className={`p-4 border-l-4 transition-all hover:shadow-md ${
                                        notification.isRead ? 'opacity-75' : ''
                                    } ${getNotificationColor(notification.type)}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className={`text-sm font-medium ${
                                                    notification.isRead ? 'text-gray-900' : 'text-gray-900'
                                                }`}>
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(notification.createdAt)}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>

                                            <p className={`text-sm mb-2 ${
                                                notification.isRead ? 'text-gray-600' : 'text-gray-700'
                                            }`}>
                                                {notification.message}
                                            </p>

                                            {notification.student && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <User className="h-3 w-3" />
                                                    Concernant: {notification.student.name} {notification.student.surname}
                                                </div>
                                            )}
                                        </div>

                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="flex-shrink-0 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                            >
                                                Marquer comme lu
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Summary */}
                    <Card className="mt-6 p-6">
                        <h3 className="text-lg font-semibold mb-4">Résumé des notifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {notifications.length}
                                </div>
                                <div className="text-sm text-blue-600">Total</div>
                            </div>

                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {notifications.filter(n => n.isRead).length}
                                </div>
                                <div className="text-sm text-green-600">Lues</div>
                            </div>

                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                    {unreadCount}
                                </div>
                                <div className="text-sm text-red-600">Non lues</div>
                            </div>

                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {new Set(notifications.map(n => n.type)).size}
                                </div>
                                <div className="text-sm text-purple-600">Types différents</div>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}