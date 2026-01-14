'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import { GraduationCap, User, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GradeItem {
    childId: number;
    childName: string;
    id: number;
    subject: string;
    grade: number;
    teacher: string;
    date: string;
}

export default function ParentGrades() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [grades, setGrades] = useState<GradeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState<number | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string>('');

    useEffect(() => {
        if (user?.id) {
            fetchGrades();
        }
    }, [user]);

    const fetchGrades = async () => {
        try {
            const response = await fetch(`/api/parents/${user!.id}/children/grades`);
            const data = await response.json();
            if (data.success) {
                setGrades(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch grades:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 16) return 'text-green-600 bg-green-50';
        if (grade >= 12) return 'text-blue-600 bg-blue-50';
        if (grade >= 10) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getGradeStatus = (grade: number) => {
        if (grade >= 16) return 'Excellent';
        if (grade >= 12) return 'Très bien';
        if (grade >= 10) return 'Bien';
        if (grade >= 8) return 'Assez bien';
        return 'Insuffisant';
    };

    const getUniqueChildren = () => {
        const children = grades.reduce((acc, grade) => {
            if (!acc.find(c => c.id === grade.childId)) {
                acc.push({ id: grade.childId, name: grade.childName });
            }
            return acc;
        }, [] as Array<{ id: number; name: string }>);
        return children;
    };

    const getUniqueSubjects = () => {
        const subjects = grades.map(g => g.subject);
        return Array.from(new Set(subjects)).sort();
    };

    const getFilteredGrades = () => {
        return grades.filter(grade => {
            const matchesChild = selectedChild === null || grade.childId === selectedChild;
            const matchesSubject = selectedSubject === '' || grade.subject === selectedSubject;
            return matchesChild && matchesSubject;
        });
    };

    const getAverageGrade = (childGrades: GradeItem[]) => {
        if (childGrades.length === 0) return 0;
        const sum = childGrades.reduce((acc, grade) => acc + grade.grade, 0);
        return Math.round((sum / childGrades.length) * 100) / 100;
    };

    const getGradeTrend = (childId: number, subject: string) => {
        const subjectGrades = grades
            .filter(g => g.childId === childId && g.subject === subject)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (subjectGrades.length < 2) return null;

        const latest = subjectGrades[subjectGrades.length - 1].grade;
        const previous = subjectGrades[subjectGrades.length - 2].grade;

        if (latest > previous) return 'up';
        if (latest < previous) return 'down';
        return 'stable';
    };

    const uniqueChildren = getUniqueChildren();
    const uniqueSubjects = getUniqueSubjects();
    const filteredGrades = getFilteredGrades();

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
                        <h1 className="text-2xl font-bold text-gray-900">Notes & Performances</h1>
                        <p className="text-gray-600">Suivez les résultats scolaires de vos enfants</p>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6 p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {uniqueChildren.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Enfant:</label>
                                    <select
                                        value={selectedChild || ''}
                                        onChange={(e) => setSelectedChild(e.target.value ? parseInt(e.target.value) : null)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Tous les enfants</option>
                                        {uniqueChildren.map((child) => (
                                            <option key={child.id} value={child.id}>
                                                {child.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Matière:</label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Toutes les matières</option>
                                    {uniqueSubjects.map((subject) => (
                                        <option key={subject} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Grades List */}
                    {filteredGrades.length === 0 ? (
                        <Card className="p-8 text-center">
                            <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune note disponible</h3>
                            <p className="text-gray-600">
                                {selectedChild || selectedSubject
                                    ? 'Aucune note ne correspond aux filtres sélectionnés.'
                                    : 'Aucune note n\'a encore été enregistrée pour vos enfants.'
                                }
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            {uniqueChildren
                                .filter(child => selectedChild === null || child.id === selectedChild)
                                .map(child => {
                                    const childGrades = grades.filter(g => g.childId === child.id);
                                    const average = getAverageGrade(childGrades);

                                    return (
                                        <Card key={child.id} className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-blue-600">{average}/20</div>
                                                    <div className="text-sm text-gray-600">Moyenne générale</div>
                                                </div>
                                            </div>

                                            {/* Subject-wise breakdown */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {uniqueSubjects.map(subject => {
                                                    const subjectGrades = childGrades.filter(g => g.subject === subject);
                                                    if (subjectGrades.length === 0) return null;

                                                    const subjectAverage = getAverageGrade(subjectGrades);
                                                    const trend = getGradeTrend(child.id, subject);

                                                    return (
                                                        <div key={subject} className="p-4 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-medium text-gray-900">{subject}</h4>
                                                                <div className="flex items-center gap-1">
                                                                    {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                                                    {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                                                                    {trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                                                                </div>
                                                            </div>
                                                            <div className="text-2xl font-bold text-blue-600">{subjectAverage}/20</div>
                                                            <div className="text-sm text-gray-600">{subjectGrades.length} note(s)</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Card>
                                    );
                                })}

                            {/* Detailed Grades Table */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Détail des Notes</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Enfant
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Matière
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Note
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Statut
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Enseignant
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredGrades
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((grade) => (
                                                <tr key={grade.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {grade.childName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {grade.subject}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                                                            {grade.grade}/20
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {getGradeStatus(grade.grade)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {grade.teacher}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(grade.date)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}