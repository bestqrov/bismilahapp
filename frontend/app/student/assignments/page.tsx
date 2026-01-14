'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import {
    FileText,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    BookOpen,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Assignment {
    id: string;
    title: string;
    description: string;
    subject: string;
    teacher: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
}

export default function StudentAssignments() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

    useEffect(() => {
        if (user?.id) {
            fetchAssignments();
        }
    }, [user]);

    const fetchAssignments = async () => {
        try {
            const response = await fetch(`/api/students/${user!.id}/assignments`);
            const data = await response.json();
            if (data.success) {
                setAssignments(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsCompleted = async (assignmentId: string) => {
        try {
            const response = await fetch(`/api/students/${user!.id}/assignments/${assignmentId}/complete`, {
                method: 'PUT'
            });
            const data = await response.json();
            if (data.success) {
                setAssignments(prev =>
                    prev.map(assignment =>
                        assignment.id === assignmentId
                            ? { ...assignment, status: 'completed' as const }
                            : assignment
                    )
                );
            }
        } catch (error) {
            console.error('Failed to mark assignment as completed:', error);
        }
    };

    const getFilteredAssignments = () => {
        if (filter === 'all') return assignments;
        return assignments.filter(assignment => assignment.status === filter);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50 border-green-200';
            case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'overdue': return <AlertCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <Sidebar currentPath={pathname} />
                <div className="flex-1 flex flex-col">
                    <TopBar />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement des devoirs...</p>
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Mes Devoirs 📝
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Gérez vos devoirs et travaux à rendre
                        </p>
                    </div>

                    {/* Filter Buttons */}
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'pending', label: 'En cours' },
                                { key: 'completed', label: 'Terminés' },
                                { key: 'overdue', label: 'En retard' }
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

                    {/* Assignments List */}
                    <div className="space-y-4">
                        {getFilteredAssignments().length === 0 ? (
                            <Card className="p-12 text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                    {filter === 'all'
                                        ? 'Aucun devoir pour le moment'
                                        : `Aucun devoir ${filter === 'pending' ? 'en cours' : filter === 'completed' ? 'terminé' : 'en retard'}`
                                    }
                                </p>
                            </Card>
                        ) : (
                            getFilteredAssignments().map((assignment) => (
                                <Card key={assignment.id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900 mr-3">
                                                    {assignment.title}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                                    {getStatusIcon(assignment.status)}
                                                    <span className="ml-1">
                                                        {assignment.status === 'completed' ? 'Terminé' :
                                                         assignment.status === 'overdue' ? 'En retard' : 'En cours'}
                                                    </span>
                                                </span>
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                                                    {assignment.priority === 'high' ? 'Haute' :
                                                     assignment.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 mb-4">
                                                {assignment.description}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <BookOpen className="h-4 w-4 mr-2" />
                                                    {assignment.subject}
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-2" />
                                                    {assignment.teacher}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Échéance: {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>
                                        </div>

                                        {assignment.status === 'pending' && (
                                            <Button
                                                onClick={() => markAsCompleted(assignment.id)}
                                                className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Marquer comme terminé
                                            </Button>
                                        )}
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