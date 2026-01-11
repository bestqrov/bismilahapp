'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';

interface DashboardData {
    parent: {
        id: string;
        name: string;
    };
    children: any[];
    notifications: any[];
}

export default function ParentDashboard() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchDashboard();
        }
    }, [user]);

    const fetchDashboard = async () => {
        try {
            const response = await fetch(`/api/parents/${user!.id}/dashboard`);
            const data = await response.json();
            if (data.success) {
                setDashboardData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar currentPath={pathname} />
            <div className="flex-1 flex flex-col">
                <TopBar />
                <main className="flex-1 p-6">
                    <h1 className="text-2xl font-bold mb-6">Tableau de Bord Parent</h1>

                    {/* Children Overview */}
                    <Card className="mb-6 p-6">
                        <h2 className="text-lg font-semibold mb-4">Mes Enfants</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dashboardData?.children.map((child: any) => (
                                <div key={child.id} className="p-4 bg-gray-50 rounded">
                                    <h3 className="font-medium">{child.name}</h3>
                                    <p className="text-sm text-gray-600">Classe: {child.class}</p>
                                    <p className="text-sm text-gray-600">Niveau: {child.level}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Children Schedules Card */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Emploi du Temps des Enfants</h2>
                            <p className="text-gray-600">Voir les emplois du temps de tous les enfants</p>
                            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                                Voir les Emplois du Temps
                            </button>
                        </Card>

                        {/* Grades Card */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Notes & Performance</h2>
                            <p className="text-gray-600">Vérifier les performances académiques</p>
                            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
                                Voir les Notes
                            </button>
                        </Card>

                        {/* Payments Card */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Paiements</h2>
                            <p className="text-gray-600">Statut des paiements pour les enfants</p>
                            <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded">
                                Voir les Paiements
                            </button>
                        </Card>
                    </div>

                    {/* Notifications */}
                    <Card className="mt-6 p-6">
                        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
                        <div className="space-y-2">
                            {dashboardData?.notifications.map((notif: any) => (
                                <div key={notif.id} className="p-3 bg-gray-50 rounded">
                                    <h3 className="font-medium">{notif.title}</h3>
                                    <p className="text-sm text-gray-600">{notif.message}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}