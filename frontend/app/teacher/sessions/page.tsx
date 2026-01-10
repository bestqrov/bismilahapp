'use client';

import { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import NewSessionModal from '../../../components/NewSessionModal';
import { Calendar, MapPin, Clock, Plus, Users, CheckCircle, AlertCircle } from 'lucide-react';

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

interface Session {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    group: {
        name: string;
        students: any[];
    };
    room: {
        name: string;
    };
    attendances: any[];
}

export default function TeacherSessions() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch('/api/teacher/sessions');
            if (response.ok) {
                const result = await response.json();
                setSessions(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSessionCreated = () => {
        fetchSessions(); // Refresh the sessions list
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
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Mes Séances</h1>
                        <p className="text-blue-100 text-lg">Gérez vos cours et suivez les présences</p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-6 h-6 text-yellow-300" />
                                <span className="text-sm font-medium">Séances Actives</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">Total Séances</p>
                                <p className="text-3xl font-bold text-blue-800">{sessions.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 mb-1">Séances Aujourd'hui</p>
                                <p className="text-3xl font-bold text-green-800">
                                    {sessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 mb-1">Taux Présence Moyen</p>
                                <p className="text-3xl font-bold text-orange-800">
                                    {sessions.length > 0
                                        ? Math.round(sessions.reduce((acc, s) =>
                                            acc + (s.attendances.length / s.group.students.length * 100), 0) / sessions.length)
                                        : 0}%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sessions Grid */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Toutes les Séances</h2>
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle Séance
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session) => (
                        <Card key={session.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    {session.group.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Clock className="h-4 w-4 text-green-500" />
                                        <span>{session.startTime} - {session.endTime}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 text-purple-500" />
                                        <span>{session.room.name}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-500" />
                                            <span>Élèves: {session.group.students.length}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Présents: {session.attendances.length}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${session.group.students.length > 0
                                                    ? (session.attendances.length / session.group.students.length * 100)
                                                    : 0}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 hover:bg-blue-50 hover:border-blue-200"
                                        onClick={() => {/* Navigate to attendance */}}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Marquer Présence
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 hover:bg-gray-50 hover:border-gray-200"
                                        onClick={() => {/* View details */}}
                                    >
                                        Voir Détails
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {sessions.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune séance</h3>
                        <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première séance.</p>
                        <div className="mt-6">
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Créer une Séance
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <NewSessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSessionCreated}
            />
        </div>
    );
}