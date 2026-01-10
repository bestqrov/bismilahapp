'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import { CheckCircle, XCircle, Clock, Users, Calendar, MapPin, ArrowLeft, Save } from 'lucide-react';

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
        students: {
            id: number;
            name: string;
            surname: string;
        }[];
    };
    room: {
        name: string;
    };
    attendances: {
        studentId: number;
        status: string;
    }[];
}

export default function TeacherAttendance() {
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [attendance, setAttendance] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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

    const handleAttendanceChange = (studentId: number, status: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status,
        }));
    };

    const submitAttendance = async () => {
        if (!selectedSession) return;

        setSubmitting(true);
        const attendances = selectedSession.group.students.map(student => ({
            studentId: student.id,
            status: attendance[student.id] || 'present',
        }));

        try {
            const response = await fetch('/api/teacher/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: selectedSession.id,
                    attendances,
                }),
            });

            if (response.ok) {
                alert('Présence marquée avec succès !');
                setSelectedSession(null);
                setAttendance({});
                fetchSessions();
            } else {
                alert('Erreur lors de la sauvegarde des présences');
            }
        } catch (error) {
            console.error('Failed to submit attendance:', error);
            alert('Erreur de connexion');
        } finally {
            setSubmitting(false);
        }
    };

    const getAttendanceStats = (session: Session) => {
        const present = session.attendances.filter(a => a.status === 'present').length;
        const absent = session.attendances.filter(a => a.status === 'absent').length;
        return { present, absent, total: session.group.students.length };
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
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Gestion des Présences</h1>
                        <p className="text-blue-100 text-lg">Marquez et suivez les présences de vos élèves</p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/teacher/suivi-presences')}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-6 h-6 text-green-300" />
                                <span className="text-sm font-medium">Suivi Présences</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {!selectedSession ? (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 mb-1">Séances Totales</p>
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
                                        <p className="text-sm font-medium text-green-600 mb-1">Présences Marquées</p>
                                        <p className="text-3xl font-bold text-green-800">
                                            {sessions.reduce((acc, s) => acc + s.attendances.length, 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
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
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sessions List */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Séances Disponibles</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sessions.map((session) => {
                                const stats = getAttendanceStats(session);
                                const isCompleted = session.attendances.length > 0;

                                return (
                                    <Card key={session.id} className={`hover:shadow-lg transition-all duration-200 ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30'}`}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-3 text-lg">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-green-100' : 'bg-orange-100'}`}>
                                                    <Clock className={`h-5 w-5 ${isCompleted ? 'text-green-600' : 'text-orange-600'}`} />
                                                </div>
                                                <div>
                                                    <div>{session.group.name}</div>
                                                    <div className="text-sm font-normal text-gray-500">
                                                        {new Date(session.date).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{session.startTime} - {session.endTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{session.room.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    <span>{stats.total} élèves</span>
                                                </div>
                                            </div>

                                            {isCompleted ? (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-green-700 font-medium">Présence marquée</span>
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div className="mt-2 flex justify-between text-xs text-green-600">
                                                        <span>Présents: {stats.present}</span>
                                                        <span>Absents: {stats.absent}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => setSelectedSession(session)}
                                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                                >
                                                    Marquer les Présences
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {sessions.length === 0 && (
                            <div className="text-center py-12">
                                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune séance</h3>
                                <p className="mt-1 text-sm text-gray-500">Les séances apparaîtront ici une fois créées.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Attendance Marking Interface */
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSession(null)}
                                    className="p-2 hover:bg-gray-100"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                Marquer Présence - {selectedSession.group.name}
                            </CardTitle>
                            <div className="text-sm text-gray-500">
                                {new Date(selectedSession.date).toLocaleDateString('fr-FR')} • {selectedSession.startTime} - {selectedSession.endTime}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <Users className="h-5 w-5" />
                                    <span className="font-medium">Liste des élèves ({selectedSession.group.students.length})</span>
                                </div>
                                <p className="text-sm text-blue-600 mt-1">
                                    Cliquez sur "Présent" ou "Absent" pour chaque élève
                                </p>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {selectedSession.group.students.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-700">
                                                    {student.name.charAt(0)}{student.surname.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {student.name} {student.surname}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={attendance[student.id] === 'present' ? 'primary' : 'outline'}
                                                size="sm"
                                                onClick={() => handleAttendanceChange(student.id, 'present')}
                                                className="min-w-[100px]"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Présent
                                            </Button>
                                            <Button
                                                variant={attendance[student.id] === 'absent' ? 'danger' : 'outline'}
                                                size="sm"
                                                onClick={() => handleAttendanceChange(student.id, 'absent')}
                                                className="min-w-[100px]"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Absent
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-6 border-t">
                                <Button
                                    onClick={submitAttendance}
                                    disabled={submitting}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex-1"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Sauvegarde...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Sauvegarder les Présences
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedSession(null)}
                                    disabled={submitting}
                                >
                                    Annuler
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}