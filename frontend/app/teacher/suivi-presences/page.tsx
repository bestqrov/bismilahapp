'use client';

import { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import { Calendar, Users, CheckCircle, XCircle, TrendingUp, BarChart3, Clock, User } from 'lucide-react';

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

interface AttendanceStats {
    totalSessions: number;
    totalStudents: number;
    averageAttendance: number;
    totalPresent: number;
    totalAbsent: number;
}

interface StudentAttendance {
    id: number;
    name: string;
    surname: string;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
}

interface SessionAttendance {
    id: number;
    date: string;
    groupName: string;
    presentCount: number;
    absentCount: number;
    totalStudents: number;
    attendanceRate: number;
}

export default function SuiviPresences() {
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [studentStats, setStudentStats] = useState<StudentAttendance[]>([]);
    const [sessionStats, setSessionStats] = useState<SessionAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'sessions'>('overview');

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const fetchAttendanceData = async () => {
        try {
            const [statsRes, studentsRes, sessionsRes] = await Promise.all([
                fetch('/api/teacher/attendance/stats'),
                fetch('/api/teacher/attendance/students'),
                fetch('/api/teacher/attendance/sessions')
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.data);
            }

            if (studentsRes.ok) {
                const studentsData = await studentsRes.json();
                setStudentStats(studentsData.data);
            }

            if (sessionsRes.ok) {
                const sessionsData = await sessionsRes.json();
                setSessionStats(sessionsData.data);
            }
        } catch (error) {
            console.error('Failed to fetch attendance data:', error);
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
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Suivi des Présences</h1>
                        <p className="text-blue-100 text-lg">Analysez et suivez les présences de vos élèves</p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="w-6 h-6 text-yellow-300" />
                                <span className="text-sm font-medium">Statistiques</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'overview'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Vue d'ensemble
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'students'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Par Élève
                </button>
                <button
                    onClick={() => setActiveTab('sessions')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'sessions'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Par Séance
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 mb-1">Séances Totales</p>
                                        <p className="text-3xl font-bold text-blue-800">{stats.totalSessions}</p>
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
                                        <p className="text-sm font-medium text-green-600 mb-1">Présences Totales</p>
                                        <p className="text-3xl font-bold text-green-800">{stats.totalPresent}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-600 mb-1">Absences Totales</p>
                                        <p className="text-3xl font-bold text-red-800">{stats.totalAbsent}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                                        <XCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 mb-1">Taux Moyen</p>
                                        <p className="text-3xl font-bold text-purple-800">{stats.averageAttendance}%</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Attendance Rate Chart Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Taux de Présence Global
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Graphique de tendance à venir</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Taux de présence actuel: {stats.averageAttendance}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Présence par Élève
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {studentStats.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-700">
                                                    {student.name.charAt(0)}{student.surname.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {student.name} {student.surname}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {student.presentCount} présents / {student.totalSessions} séances
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">
                                                {student.attendanceRate}%
                                            </div>
                                            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                        student.attendanceRate >= 80 ? 'bg-green-500' :
                                                        student.attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${student.attendanceRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Présence par Séance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sessionStats.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Calendar className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {session.groupName}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(session.date).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">
                                                {session.attendanceRate}%
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {session.presentCount}/{session.totalStudents} présents
                                            </p>
                                            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                                <div
                                                    className="h-2 rounded-full bg-green-500 transition-all duration-300"
                                                    style={{ width: `${session.attendanceRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}