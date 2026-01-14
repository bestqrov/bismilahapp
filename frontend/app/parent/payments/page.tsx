'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import { DollarSign, CreditCard, Calendar, Download, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface Payment {
    childId: number;
    childName: string;
    id: number;
    amount: number;
    method: string;
    note?: string;
    date: string;
}

export default function ParentPayments() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState<number | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchPayments();
        }
    }, [user]);

    const fetchPayments = async () => {
        try {
            const response = await fetch(`/api/parents/${user!.id}/payments`);
            const data = await response.json();
            if (data.success) {
                setPayments(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD'
        }).format(amount);
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case 'cash':
            case 'espèces':
                return <DollarSign className="h-4 w-4" />;
            case 'card':
            case 'carte':
                return <CreditCard className="h-4 w-4" />;
            default:
                return <DollarSign className="h-4 w-4" />;
        }
    };

    const getPaymentMethodColor = (method: string) => {
        switch (method.toLowerCase()) {
            case 'cash':
            case 'espèces':
                return 'text-green-600 bg-green-50';
            case 'card':
            case 'carte':
                return 'text-blue-600 bg-blue-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getUniqueChildren = () => {
        const children = payments.reduce((acc, payment) => {
            if (!acc.find(c => c.id === payment.childId)) {
                acc.push({ id: payment.childId, name: payment.childName });
            }
            return acc;
        }, [] as Array<{ id: number; name: string }>);
        return children;
    };

    const getFilteredPayments = () => {
        return payments.filter(payment => {
            return selectedChild === null || payment.childId === selectedChild;
        });
    };

    const getTotalPaid = (childPayments: Payment[]) => {
        return childPayments.reduce((sum, payment) => sum + payment.amount, 0);
    };

    const getPendingPayments = (childId: number) => {
        // This would typically come from an API call to get pending invoices
        // For now, we'll return a mock value
        return 0;
    };

    const uniqueChildren = getUniqueChildren();
    const filteredPayments = getFilteredPayments();

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
                        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
                        <p className="text-gray-600">Suivez l'historique des paiements pour vos enfants</p>
                    </div>

                    {/* Filter */}
                    {uniqueChildren.length > 1 && (
                        <Card className="mb-6 p-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Filtrer par enfant:</label>
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
                        </Card>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {uniqueChildren
                            .filter(child => selectedChild === null || child.id === selectedChild)
                            .map(child => {
                                const childPayments = payments.filter(p => p.childId === child.id);
                                const totalPaid = getTotalPaid(childPayments);
                                const pendingAmount = getPendingPayments(child.id);

                                return (
                                    <Card key={child.id} className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                                            <DollarSign className="h-6 w-6 text-green-500" />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Total payé:</span>
                                                <span className="font-semibold text-green-600">{formatAmount(totalPaid)}</span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Paiements:</span>
                                                <span className="font-medium">{childPayments.length}</span>
                                            </div>

                                            {pendingAmount > 0 && (
                                                <div className="flex justify-between items-center pt-2 border-t">
                                                    <span className="text-sm text-red-600">En attente:</span>
                                                    <span className="font-semibold text-red-600">{formatAmount(pendingAmount)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                    </div>

                    {/* Payments History */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Historique des Paiements</h3>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                <Download className="h-4 w-4" />
                                Télécharger le reçu
                            </button>
                        </div>

                        {filteredPayments.length === 0 ? (
                            <div className="text-center py-8">
                                <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement</h3>
                                <p className="text-gray-600">
                                    {selectedChild
                                        ? 'Aucun paiement n\'a été enregistré pour cet enfant.'
                                        : 'Aucun paiement n\'a encore été enregistré.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Enfant
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Montant
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Méthode
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Note
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredPayments
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {payment.childName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                    {formatAmount(payment.amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(payment.method)}`}>
                                                        {getPaymentMethodIcon(payment.method)}
                                                        {payment.method}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(payment.date)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                    {payment.note || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button className="text-blue-600 hover:text-blue-900 font-medium">
                                                        Télécharger
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    {/* Payment Statistics */}
                    <Card className="mt-6 p-6">
                        <h3 className="text-lg font-semibold mb-4">Statistiques des Paiements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatAmount(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
                                </div>
                                <div className="text-sm text-green-600">Total payé</div>
                            </div>

                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {filteredPayments.length}
                                </div>
                                <div className="text-sm text-blue-600">Nombre de paiements</div>
                            </div>

                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {filteredPayments.length > 0
                                        ? formatAmount(filteredPayments.reduce((sum, p) => sum + p.amount, 0) / filteredPayments.length)
                                        : '0 DH'
                                    }
                                </div>
                                <div className="text-sm text-purple-600">Paiement moyen</div>
                            </div>

                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">
                                    {filteredPayments.filter(p => {
                                        const paymentDate = new Date(p.date);
                                        const now = new Date();
                                        return paymentDate.getMonth() === now.getMonth() &&
                                               paymentDate.getFullYear() === now.getFullYear();
                                    }).length}
                                </div>
                                <div className="text-sm text-orange-600">Ce mois</div>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}