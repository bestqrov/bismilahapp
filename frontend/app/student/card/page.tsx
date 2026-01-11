'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import StudentCard from '@/components/StudentCard';
import { Card } from '@/components/ui/Card';
import { Download, Printer, QrCode, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StudentData {
    id: number;
    name: string;
    surname: string;
    schoolLevel?: string;
    photo?: string;
    currentSchool?: string;
    phone?: string;
    email?: string;
    cin?: string;
    address?: string;
    birthDate?: string;
    birthPlace?: string;
    fatherName?: string;
    motherName?: string;
}

export default function StudentCardPage() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStudentData = useCallback(async () => {
        try {
            // Use the axios instance which has baseURL configured
            const { default: api } = await import('../../../lib/api');

            const response = await api.get('/students/profile');
            if (response.data.success) {
                setStudentData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch student data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchStudentData();
        }
    }, [user?.id, fetchStudentData]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // This would typically generate a PDF, but for now we'll just print
        window.print();
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;

    if (!studentData) {
        return (
            <div className="flex h-screen bg-gray-100">
                <Sidebar currentPath={pathname} />
                <div className="flex-1 flex flex-col">
                    <TopBar />
                    <main className="flex-1 p-6">
                        <div className="text-center">
                            <p>Impossible de charger les données de l'étudiant.</p>
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
                <main className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Printer className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Ma Carte d&apos;Étudiant</h1>
                                    <p className="text-gray-600 text-lg">Votre carte d&apos;identité numérique</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Student Card Display - Enhanced */}
                            <div className="lg:col-span-2">
                                <Card className="border-0 shadow-2xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1">
                                        <div className="bg-white rounded-lg">
                                            <StudentCard student={studentData} />
                                        </div>
                                    </div>
                                </Card>

                                {/* Action Buttons */}
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button
                                        onClick={handlePrint}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 py-4"
                                    >
                                        <Printer size={20} className="mr-2" />
                                        Imprimer la carte
                                    </Button>
                                    <Button
                                        onClick={handleDownload}
                                        variant="secondary"
                                        className="border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 py-4"
                                    >
                                        <Download size={20} className="mr-2" />
                                        Télécharger PDF
                                    </Button>
                                </div>
                            </div>

                            {/* Instructions and Info */}
                            <div className="space-y-6">
                                {/* How to Use */}
                                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <QrCode className="h-6 w-6 text-blue-600" />
                                            Comment utiliser
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-blue-600 font-bold text-sm">1</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-700 font-medium">Montrez votre carte</p>
                                                    <p className="text-xs text-gray-600">Présentez votre QR code à l&apos;enseignant</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-blue-600 font-bold text-sm">2</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-700 font-medium">Scan automatique</p>
                                                    <p className="text-xs text-gray-600">Le système reconnaît automatiquement votre identité</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-blue-600 font-bold text-sm">3</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-700 font-medium">Confirmation</p>
                                                    <p className="text-xs text-gray-600">Votre présence est marquée instantanément</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Security Info */}
                                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Award className="h-6 w-6 text-green-600" />
                                            Sécurité
                                        </h3>
                                        <div className="space-y-3 text-sm text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span>Code QR unique et personnel</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span>Chiffrement des données</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span>Validation en temps réel</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span>Accès sécurisé uniquement</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Tips */}
                                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <AlertCircle className="h-6 w-6 text-orange-600" />
                                            Conseils
                                        </h3>
                                        <div className="space-y-3 text-sm text-gray-700">
                                            <p>• Gardez votre carte en sécurité</p>
                                            <p>• Ne partagez jamais votre QR code</p>
                                            <p>• En cas de perte, contactez l&apos;administration</p>
                                            <p>• Vérifiez régulièrement vos informations</p>
                                            <p>• Le QR code est valide pour toutes vos séances</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}