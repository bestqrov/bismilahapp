'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    BookOpen,
    ShoppingCart,
    Check,
    Save,
    Smartphone,
    GraduationCap
} from 'lucide-react';
import Button from '@/components/Button';
import { formationsService, Formation } from '@/lib/services/formations';
import { createStudent, getStudents } from '@/lib/services/students';
import { createInscription } from '@/lib/services/inscriptions';
import { Student } from '@/types';

// Helper component for modern inputs with icons
const ModernInput = ({ icon: Icon, label, required, highlight, ...props }: any) => (
    <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className={`h-5 w-5 transition-colors ${highlight ? 'text-red-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
            </div>
            <input
                {...props}
                id={props.name}
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-4 transition-all bg-gray-50/50 focus:bg-white hover:bg-white text-gray-800 placeholder-gray-400 ${
                    highlight
                        ? 'border-red-300 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:ring-blue-500/10 focus:border-blue-500'
                }`}
            />
        </div>
    </div>
);

interface FormationInscriptionFormProps {
    onSuccessRedirect?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function FormationInscriptionForm({ onSuccessRedirect, onSuccess, onCancel }: FormationInscriptionFormProps) {
    const router = useRouter();
    const [formations, setFormations] = useState<Formation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [duplicateStudent, setDuplicateStudent] = useState<Student | null>(null);
    const [duplicateField, setDuplicateField] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        gsm: '',
        cin: '',
        address: '',
        formation: [] as number[],
    });

    useEffect(() => {
        const fetchFormations = async () => {
            try {
                const data = await formationsService.getAll();
                setFormations(data);
            } catch (error) {
                console.error('Error fetching formations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFormations();
    }, []);

    // Helper to get color/bg based on index
    const getStyle = (index: number) => {
        const styles = [
            { color: 'text-pink-500', bg: 'bg-pink-50' },
            { color: 'text-blue-500', bg: 'bg-blue-50' },
            { color: 'text-purple-500', bg: 'bg-purple-50' },
            { color: 'text-green-500', bg: 'bg-green-50' },
            { color: 'text-orange-500', bg: 'bg-orange-50' },
        ];
        return styles[index % styles.length];
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        // Clear duplicate field highlighting when user starts editing
        if (duplicateField && (name === 'name' || name === 'cin' || name === 'gsm')) {
            setDuplicateField('');
        }

        if (name === 'formation' && type === 'checkbox') {
            setFormData(prev => {
                const current = prev.formation as number[];
                const numValue = parseInt(value);
                const newSelection = checked
                    ? [...current, numValue]
                    : current.filter(id => id !== numValue);
                return { ...prev, formation: newSelection };
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const createStudentAndInscriptions = async (existingStudentId?: number) => {
        let studentId = existingStudentId;

        if (!studentId) {
            // Create new student
            const studentData = await createStudent({
                name: formData.name.split(' ')[0],
                surname: formData.name.split(' ').slice(1).join(' ') || '.',
                email: formData.email || undefined,
                phone: formData.gsm,
                cin: formData.cin,
                address: formData.address,
            } as any);
            studentId = studentData.id;
        }

        // Create inscriptions for each selected formation
        await Promise.all(formData.formation.map(async (formationId) => {
            const formation = formations.find(f => f.id === formationId);
            if (!formation) return;

            await createInscription({
                studentId: studentId,
                type: 'FORMATION',
                category: formation.name,
                amount: formation.price,
            } as any);
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.formation.length === 0) {
            alert('Veuillez sélectionner au moins une formation');
            return;
        }

        if (!formData.name || !formData.cin || !formData.address || !formData.gsm) {
            alert('Veuillez remplir tous les champs obligatoires (Nom, CIN, Adresse, GSM)');
            return;
        }

        try {
            setLoading(true);

            // Check for duplicate student
            const allStudents = await getStudents();
            let existingStudent = null;
            let duplicateFieldName = '';

            // Check by CIN first (most reliable)
            if (formData.cin) {
                existingStudent = allStudents.find(student => student.cin === formData.cin);
                if (existingStudent) {
                    duplicateFieldName = 'cin';
                }
            }

            // If no CIN match, check by name and phone
            if (!existingStudent && formData.name && formData.gsm) {
                const fullName = `${formData.name.split(' ')[0]} ${formData.name.split(' ').slice(1).join(' ') || '.'}`.trim();
                existingStudent = allStudents.find(student => 
                    student.name === formData.name.split(' ')[0] && 
                    student.surname === (formData.name.split(' ').slice(1).join(' ') || '.') &&
                    student.phone === formData.gsm
                );
                if (existingStudent) {
                    duplicateFieldName = 'name';
                }
            }

            if (existingStudent) {
                setDuplicateStudent(existingStudent);
                setDuplicateField(duplicateFieldName);
                setShowDuplicateDialog(true);
                setLoading(false);
                return;
            }

            // No duplicate found, proceed with creation
            await createStudentAndInscriptions();
        } catch (error: any) {
            console.error('Submission failed:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Une erreur est survenue';
            alert(`Erreur: ${errorMessage}`);
        } finally {
            setLoading(false);
        }

        alert('Inscription créée avec succès!');
        
        if (onSuccess) {
            onSuccess();
        } else if (onSuccessRedirect) {
            router.push(onSuccessRedirect as string);
        }
    };

    const handleDuplicateConfirm = async () => {
        setShowDuplicateDialog(false);
        try {
            setLoading(true);
            await createStudentAndInscriptions(duplicateStudent!.id);
        } catch (error: any) {
            console.error('Submission failed:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Une erreur est survenue';
            alert(`Erreur: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicateCancel = () => {
        setShowDuplicateDialog(false);
        // Determine which field caused the duplicate and highlight it
        if (duplicateStudent) {
            if (duplicateStudent.cin === formData.cin) {
                setDuplicateField('cin');
            } else if (duplicateStudent.phone === formData.gsm) {
                setDuplicateField('gsm');
            } else if (duplicateStudent.name === formData.name.split(' ')[0] && duplicateStudent.surname === (formData.name.split(' ').slice(1).join(' ') || '.')) {
                setDuplicateField('name');
            }
        }
        setDuplicateStudent(null);
        // Focus on the duplicate field after a short delay to allow state update
        setTimeout(() => {
            const fieldElement = document.getElementById(duplicateField);
            if (fieldElement) {
                fieldElement.focus();
                fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Duplicate Confirmation Dialog */}
            {showDuplicateDialog && duplicateStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Étudiant déjà existant</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Un étudiant avec les mêmes informations existe déjà:<br/>
                                <strong>{duplicateStudent.name} {duplicateStudent.surname}</strong><br/>
                                {duplicateStudent.cin && `CIN: ${duplicateStudent.cin}`}
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Voulez-vous créer une nouvelle inscription pour cet étudiant ?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDuplicateCancel}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDuplicateConfirm}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Continuer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            return (
            <div className="max-w-6xl mx-auto p-6">

                {/* Main Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                    <GraduationCap size={32} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Inscription</h1>
                                    <p className="text-blue-100 mt-1">Remplissez le formulaire pour vous inscrire</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Personal Info Group */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                    <User className="text-blue-500" size={20} />
                                    Informations Personnelles
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ModernInput
                                        icon={User}
                                        label="Nom Complet"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: Mohammed Alami"
                                        highlight={duplicateField === 'name'}
                                    />
                                    <ModernInput
                                        icon={CreditCard}
                                        label="CIN"
                                        name="cin"
                                        value={formData.cin}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ex: AB123456"
                                        highlight={duplicateField === 'cin'}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ModernInput
                                        icon={Mail}
                                        label="Email (optionnel)"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="exemple@email.com"
                                    />
                                    <ModernInput
                                        icon={MapPin}
                                        label="Adresse"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        placeholder="Adresse complète"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ModernInput
                                        icon={Smartphone}
                                        label="WhatsApp"
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                        required
                                        placeholder="06..."
                                    />
                                    <ModernInput
                                        icon={Phone}
                                        label="GSM"
                                        name="gsm"
                                        value={formData.gsm}
                                        onChange={handleChange}
                                        required
                                        placeholder="06..."
                                        highlight={duplicateField === 'phone'}
                                    />
                                </div>
                            </div>

                            {/* Formations Selection */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                    <BookOpen className="text-blue-500" size={20} />
                                    Choix des Formations
                                </h3>

                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">Chargement des formations...</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {formations.map((opt, index) => {
                                            const isSelected = formData.formation.includes(opt.id);
                                            const style = getStyle(index);
                                            return (
                                                <label
                                                    key={opt.id}
                                                    className={`relative flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer group ${isSelected
                                                        ? 'border-blue-500 bg-blue-50/30'
                                                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="formation"
                                                        value={opt.id}
                                                        checked={isSelected}
                                                        onChange={handleChange}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-colors ${isSelected
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'border-gray-300 group-hover:border-blue-400 bg-white'
                                                        }`}>
                                                        {isSelected && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className={`font-bold text-lg ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                                            {opt.name}
                                                        </span>
                                                        <div className="text-sm text-gray-500">{opt.duration}</div>
                                                        <div className={`text-lg font-bold mt-1 ${isSelected ? 'text-blue-600' : 'text-green-600'}`}>
                                                            {opt.price} DH
                                                        </div>
                                                    </div>
                                                    <div className={`p-2 rounded-xl ${style.bg}`}>
                                                        <BookOpen size={20} className={style.color} />
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Actions with Cancel Button */}
                            <div className="pt-4 flex gap-4">
                                {onCancel && (
                                    <Button
                                        type="button"
                                        onClick={onCancel}
                                        className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-4 rounded-xl text-lg font-bold transition-all"
                                    >
                                        Annuler
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className={`bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${onCancel ? 'flex-[2]' : 'w-full'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Save className="mr-2" size={20} />
                                    {loading ? 'Inscription en cours...' : 'Confirmer l\'Inscription'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Cart Summary Side Panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-2xl overflow-hidden relative">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-800">
                                    <div className="p-3 bg-blue-500/20 rounded-xl">
                                        <ShoppingCart className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Votre facture</h3>
                                        <p className="text-gray-400 text-sm">{formData.formation.length} formation(s)</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 min-h-[200px]">
                                    {formData.formation.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <ShoppingCart size={48} className="mx-auto mb-3 opacity-20" />
                                            <p>Aucune formation sélectionnée</p>
                                        </div>
                                    ) : (
                                        formData.formation.map(id => {
                                            const opt = formations.find(o => o.id === id);
                                            return (
                                                <div key={id} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                                                    <span className="font-medium text-gray-200">{opt?.name}</span>
                                                    <span className="font-bold text-blue-400">{opt?.price} DH</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-400 font-medium">Total à payer</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-white block">
                                                {formData.formation.reduce((sum, formationId) => {
                                                    const formation = formations.find(f => f.id === formationId);
                                                    return sum + (formation?.price || 0);
                                                }, 0)}
                                            </span>
                                            <span className="text-sm text-gray-400 font-medium">Dirhams (DH)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
