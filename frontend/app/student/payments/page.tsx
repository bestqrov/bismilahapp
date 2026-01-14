'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import {
    DollarSign,
    CreditCard,
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    TrendingUp,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Payment {
    id: string;
    amount: number;
    description: string;
    status: 'paid' | 'pending' | 'overdue';
    dueDate: string;
    paidDate?: string;
    method?: string;
    reference: string;
}

interface PaymentStats {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    nextPayment?: {
        amount: number;
        dueDate: string;
        description: string;
    };
}

export default function StudentPayments() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

    useEffect(() => {
        if (user?.id) {
            fetchPayments();
            fetchStats();
        }
    }, [user]);

    const fetchPayments = async () => {
        try {
            const response = await fetch(`/api/students/${user!.id}/payments`);
            const data = await response.json();
            if (data.success) {
                setPayments(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/students/${user!.id}/payments/stats`);
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch payment stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReceipt = async (paymentId: string) => {
        try {
            const response = await fetch(`/api/students/${user!.id}/payments/${paymentId}/receipt`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipt-${paymentId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Failed to download receipt:', error);
        }
    };

    const getFilteredPayments = () => {
        if (filter === 'all') return payments;
        return payments.filter(payment => payment.status === filter);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-green-600 bg-green-50 border-green-200';
            case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="h-4 w-4" />;
            case 'overdue': return <AlertCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            default: return <DollarSign className="h-4 w-4" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD'
        }).format(amount);
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
                            <p className="text-gray-600">Chargement des paiements...</p>
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
                            Mes Paiements 💳
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Gérez vos paiements et consultez votre historique
                        </p>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                                <div className="flex items-center">
                                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Payé</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {formatCurrency(stats.totalPaid)}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                                <div className="flex items-center">
                                    <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">En attente</p>
                                        <p className="text-2xl font-bold text-yellow-900">
                                            {formatCurrency(stats.totalPending)}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                                <div className="flex items-center">
                                    <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-red-800">En retard</p>
                                        <p className="text-2xl font-bold text-red-900">
                                            {formatCurrency(stats.totalOverdue)}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {stats.nextPayment && (
                                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                    <div className="flex items-center">
                                        <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-800">Prochain paiement</p>
                                            <p className="text-lg font-bold text-blue-900">
                                                {formatCurrency(stats.nextPayment.amount)}
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                {new Date(stats.nextPayment.dueDate).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Filter Buttons */}
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'paid', label: 'Payés' },
                                { key: 'pending', label: 'En attente' },
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

                    {/* Payments List */}
                    <div className="space-y-4">
                        {getFilteredPayments().length === 0 ? (
                            <Card className="p-12 text-center">
                                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                    {filter === 'all'
                                        ? 'Aucun paiement trouvé'
                                        : `Aucun paiement ${filter === 'paid' ? 'payé' : filter === 'pending' ? 'en attente' : 'en retard'}`
                                    }
                                </p>
                            </Card>
                        ) : (
                            getFilteredPayments().map((payment) => (
                                <Card key={payment.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900 mr-3">
                                                    {payment.description}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                                                    {getStatusIcon(payment.status)}
                                                    <span className="ml-2">
                                                        {payment.status === 'paid' ? 'Payé' :
                                                         payment.status === 'overdue' ? 'En retard' : 'En attente'}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-2" />
                                                    <span className="font-semibold text-lg text-gray-900">
                                                        {formatCurrency(payment.amount)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Échéance: {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                                                </div>
                                                {payment.paidDate && (
                                                    <div className="flex items-center">
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Payé le: {new Date(payment.paidDate).toLocaleDateString('fr-FR')}
                                                    </div>
                                                )}
                                                {payment.method && (
                                                    <div className="flex items-center">
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                        {payment.method}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-2 text-sm text-gray-500">
                                                Référence: {payment.reference}
                                            </div>
                                        </div>

                                        {payment.status === 'paid' && (
                                            <Button
                                                onClick={() => downloadReceipt(payment.id)}
                                                className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Reçu
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