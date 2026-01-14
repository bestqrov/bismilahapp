'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Users, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';

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

interface Course {
    id: number;
    name: string;
    teacherId: number;
    createdAt: string;
    updatedAt: string;
    groups?: any[];
    sessionsCount?: number;
}

export default function TeacherCoursesPage() {
    const router = useRouter();
    const { user, accessToken } = useAuthStore();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        // Check authentication
        if (!accessToken || !user || user.role !== 'TEACHER') {
            router.push('/login');
            return;
        }

        fetchCourses();
    }, [accessToken, user, router]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/teacher/courses');
            if (response.data.success) {
                setCourses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (courseData: { name: string }) => {
        try {
            await api.post('/teacher/courses', courseData);
            setShowCreateModal(false);
            fetchCourses(); // Refresh the list
        } catch (error) {
            console.error('Failed to create course:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mes Cours</h1>
                    <p className="text-gray-600 mt-2">Gérez vos cours et consultez les statistiques</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nouveau Cours</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Cours</p>
                                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Groupes Actifs</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {courses.reduce((total, course) => total + (course.groups?.length || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Séances Totales</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {courses.reduce((total, course) => total + (course.sessionsCount || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Courses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{course.name}</CardTitle>
                                <div className="relative">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                        <MoreVertical className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span>{course.groups?.length || 0} groupes</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{course.sessionsCount || 0} séances</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    Créé le {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Empty State */}
                {courses.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours</h3>
                        <p className="text-gray-500 text-center mb-6">
                            Vous n'avez pas encore créé de cours. Commencez par créer votre premier cours.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Créer un cours</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Create Course Modal */}
            {showCreateModal && (
                <CreateCourseModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateCourse}
                />
            )}
        </div>
    );
}

// Create Course Modal Component
function CreateCourseModal({ isOpen, onClose, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: { name: string }) => void;
}) {
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

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
                        <span className="sr-only">Fermer</span>
                        ×
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom du Cours
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Mathématiques"
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
                            disabled={submitting || !formData.name.trim()}
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