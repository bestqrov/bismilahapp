'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import { Users, Calendar, BookOpen, DollarSign, Phone, Mail, MapPin, GraduationCap } from 'lucide-react';

interface Child {
    id: number;
    name: string;
    surname: string;
    phone?: string;
    email?: string;
    address?: string;
    birthDate?: string;
    schoolLevel?: string;
    currentSchool?: string;
    active: boolean;
    groups: Array<{
        id: number;
        name: string;
        type: string;
        course?: {
            name: string;
        };
    }>;
    payments: Array<{
        id: number;
        amount: number;
        date: string;
        method: string;
    }>;
    attendances: Array<{
        id: number;
        status: string;
        session: {
            date: string;
            group: {
                name: string;
            };
        };
    }>;
}

export default function ParentChildren() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchChildren();
        }
    }, [user]);

    const fetchChildren = async () => {
        try {
            const response = await fetch(`/api/parents/${user!.id}/children`);
            const data = await response.json();
            if (data.success) {
                setChildren(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch children:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getAttendanceStats = (child: Child) => {
        const total = child.attendances.length;
        const present = child.attendances.filter(a => a.status === 'present').length;
        const absent = child.attendances.filter(a => a.status === 'absent').length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;
        return { total, present, absent, rate };
    };

    const getTotalPayments = (child: Child) => {
        return child.payments.reduce((sum, payment) => sum + payment.amount, 0);
    };

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
                        <h1 className="text-2xl font-bold text-gray-900">Mes Enfants</h1>
                        <p className="text-gray-600">Gérez les informations de vos enfants</p>
                    </div>

                    {children.length === 0 ? (
                        <Card className="p-8 text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enfant enregistré</h3>
                            <p className="text-gray-600">Vous n'avez pas encore d'enfants enregistrés dans le système.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {children.map((child) => {
                                const attendanceStats = getAttendanceStats(child);
                                const totalPayments = getTotalPayments(child);

                                return (
                                    <Card key={child.id} className="p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {child.name} {child.surname}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {child.schoolLevel} - {child.currentSchool}
                                                </p>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                child.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {child.active ? 'Actif' : 'Inactif'}
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div className="space-y-2 mb-4">
                                            {child.phone && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    {child.phone}
                                                </div>
                                            )}
                                            {child.email && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    {child.email}
                                                </div>
                                            )}
                                            {child.address && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4 mr-2" />
                                                    {child.address}
                                                </div>
                                            )}
                                            {child.birthDate && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Né le {formatDate(child.birthDate)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Groups */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                Groupes ({child.groups.length})
                                            </h4>
                                            <div className="space-y-1">
                                                {child.groups.slice(0, 2).map((group) => (
                                                    <div key={group.id} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                        {group.name} {group.course && `(${group.course.name})`}
                                                    </div>
                                                ))}
                                                {child.groups.length > 2 && (
                                                    <div className="text-sm text-gray-500">
                                                        +{child.groups.length - 2} autres groupes
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="text-lg font-semibold text-blue-600">
                                                    {attendanceStats.rate}%
                                                </div>
                                                <div className="text-xs text-blue-600">Présence</div>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <div className="text-lg font-semibold text-green-600">
                                                    {totalPayments.toLocaleString()} DH
                                                </div>
                                                <div className="text-xs text-green-600">Paiements</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedChild(child)}
                                                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                                            >
                                                Voir Détails
                                            </button>
                                            <button className="px-3 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
                                                Modifier
                                            </button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Child Details Modal */}
                    {selectedChild && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold">
                                            Détails de {selectedChild.name} {selectedChild.surname}
                                        </h2>
                                        <button
                                            onClick={() => setSelectedChild(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Personal Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4">Informations Personnelles</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedChild.name} {selectedChild.surname}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {selectedChild.birthDate ? formatDate(selectedChild.birthDate) : 'Non spécifiée'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedChild.phone || 'Non spécifié'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedChild.email || 'Non spécifié'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Niveau scolaire</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedChild.schoolLevel || 'Non spécifié'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">École actuelle</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedChild.currentSchool || 'Non spécifiée'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Groups */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4">Groupes et Cours</h3>
                                        <div className="space-y-3">
                                            {selectedChild.groups.map((group) => (
                                                <div key={group.id} className="p-4 border rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-medium">{group.name}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                Type: {group.type} {group.course && `• Cours: ${group.course.name}`}
                                                            </p>
                                                        </div>
                                                        <GraduationCap className="h-5 w-5 text-blue-500" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Payments */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4">Paiements Récents</h3>
                                        <div className="space-y-2">
                                            {selectedChild.payments.slice(0, 5).map((payment) => (
                                                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                    <div>
                                                        <p className="font-medium">{payment.amount.toLocaleString()} DH</p>
                                                        <p className="text-sm text-gray-600">{formatDate(payment.date)}</p>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{payment.method}</span>
                                                </div>
                                            ))}
                                            {selectedChild.payments.length === 0 && (
                                                <p className="text-gray-500 text-center py-4">Aucun paiement enregistré</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t bg-gray-50">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setSelectedChild(null)}
                                            className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
                                        >
                                            Fermer
                                        </button>
                                        <button className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600">
                                            Modifier les Informations
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}