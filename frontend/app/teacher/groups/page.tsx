'use client';

import { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import { Users, Calendar, MapPin, BookOpen, Clock, TrendingUp, Award, Target, Eye, UserCheck } from 'lucide-react';

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

interface Group {
    id: number;
    name: string;
    level: string;
    subject: string;
    students: any[];
    sessions: any[];
}

export default function TeacherGroups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await fetch('/api/teacher/groups');
            if (response.ok) {
                const result = await response.json();
                setGroups(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalStudents = groups.reduce((acc, group) => acc + group.students.length, 0);
    const totalSessions = groups.reduce((acc, group) => acc + group.sessions.length, 0);
    const averageStudentsPerGroup = groups.length > 0 ? Math.round(totalStudents / groups.length) : 0;

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
                        <h1 className="text-3xl font-bold mb-2">Mes Groupes</h1>
                        <p className="text-blue-100 text-lg">Gérez vos classes et suivez les performances</p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center space-x-2">
                                <Users className="w-6 h-6 text-green-300" />
                                <span className="text-sm font-medium">{groups.length} Groupes</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center space-x-2">
                                <UserCheck className="w-6 h-6 text-blue-300" />
                                <span className="text-sm font-medium">{totalStudents} Élèves</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">Total Groupes</p>
                                <p className="text-3xl font-bold text-blue-800">{groups.length}</p>
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
                                <p className="text-sm font-medium text-green-600 mb-1">Total Élèves</p>
                                <p className="text-3xl font-bold text-green-800">{totalStudents}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 mb-1">Séances Totales</p>
                                <p className="text-3xl font-bold text-purple-800">{totalSessions}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 mb-1">Moyenne par Groupe</p>
                                <p className="text-3xl font-bold text-orange-800">{averageStudentsPerGroup}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Groups Grid */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Tous les Groupes</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <Card key={group.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{group.name}</div>
                                        <div className="text-sm text-gray-500">{group.subject}</div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Group Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-gray-900">{group.students.length}</div>
                                        <div className="text-xs text-gray-500">Élèves</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-blue-900">{group.sessions.length}</div>
                                        <div className="text-xs text-blue-500">Séances</div>
                                    </div>
                                </div>

                                {/* Level and Subject */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">{group.level}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-green-500" />
                                        <span className="text-green-600 font-medium">{group.subject}</span>
                                    </div>
                                </div>

                                {/* Recent Sessions */}
                                {group.sessions.length > 0 && (
                                    <div className="border-t pt-3">
                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Dernières Séances
                                        </h4>
                                        <div className="space-y-2">
                                            {group.sessions.slice(0, 2).map((session: any) => (
                                                <div key={session.id} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 text-blue-500" />
                                                        <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-gray-400" />
                                                        <span className="text-gray-500">{session.room?.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 hover:bg-blue-50 hover:border-blue-200"
                                        onClick={() => setSelectedGroup(group)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Détails
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 hover:bg-green-50 hover:border-green-200"
                                    >
                                        <Award className="h-4 w-4 mr-1" />
                                        Évaluations
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {groups.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun groupe</h3>
                        <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore de groupes assignés.</p>
                    </div>
                )}
            </div>

            {/* Group Details Modal */}
            {selectedGroup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">{selectedGroup.name}</h3>
                                <button
                                    onClick={() => setSelectedGroup(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-900">{selectedGroup.students.length}</div>
                                    <div className="text-sm text-blue-600">Élèves inscrits</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-900">{selectedGroup.sessions.length}</div>
                                    <div className="text-sm text-green-600">Séances planifiées</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3">Informations du Groupe</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Niveau:</span>
                                        <span className="font-medium">{selectedGroup.level}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Matière:</span>
                                        <span className="font-medium">{selectedGroup.subject}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3">Liste des Élèves</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {selectedGroup.students.map((student: any) => (
                                        <div key={student.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                                            <span className="text-sm">{student.name} {student.surname}</span>
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}