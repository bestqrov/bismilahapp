'use client';

import { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import { Bell, Send, AlertTriangle, Info, CheckCircle } from 'lucide-react';

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

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    createdAt: string;
}

const getIcon = (type: string) => {
    switch (type) {
        case 'ALERT':
            return <AlertTriangle className="h-5 w-5 text-red-500" />;
        case 'ANNOUNCEMENT':
            return <Info className="h-5 w-5 text-blue-500" />;
        case 'REPORT':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        default:
            return <Bell className="h-5 w-5 text-gray-500" />;
    }
};

export default function TeacherNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSendForm, setShowSendForm] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/teacher/notifications');
            if (response.ok) {
                const result = await response.json();
                setNotifications(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <Button onClick={() => setShowSendForm(!showSendForm)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                </Button>
            </div>

            {showSendForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Send Notification to Administration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Notification title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    rows={4}
                                    placeholder="Notification message"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Send</Button>
                                <Button variant="outline" onClick={() => setShowSendForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {notifications.map((notification) => (
                    <Card key={notification.id}>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                {getIcon(notification.type)}
                                <div className="flex-1">
                                    <h3 className="font-medium">{notification.title}</h3>
                                    <p className="text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}