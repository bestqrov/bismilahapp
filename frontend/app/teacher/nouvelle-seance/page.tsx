'use client';

import { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import { Calendar, Clock, MapPin, Users, Plus, Save, ArrowLeft } from 'lucide-react';

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

interface Group {
    id: number;
    name: string;
    students: any[];
}

interface Room {
    id: number;
    name: string;
}

export default function NouvelleSeance() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        groupId: '',
        roomId: '',
        date: '',
        startTime: '',
        endTime: '',
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (formData.date && formData.startTime && formData.endTime) {
            fetchAvailableRooms();
        } else {
            fetchAllRooms();
        }
    }, [formData.date, formData.startTime, formData.endTime]);

    const fetchGroups = async () => {
        setLoadingGroups(true);
        try {
            const response = await fetch('/api/teacher/groups');
            if (response.ok) {
                const groupsData = await response.json();
                setGroups(groupsData.data);
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setLoadingGroups(false);
        }
    };

    const fetchAllRooms = async () => {
        setLoadingRooms(true);
        try {
            const response = await fetch('/api/teacher/rooms');
            if (response.ok) {
                const roomsData = await response.json();
                setRooms(roomsData.data);
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setLoadingRooms(false);
        }
    };

    const fetchAvailableRooms = async () => {
        setLoadingRooms(true);
        try {
            const params = new URLSearchParams({
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
            });
            const response = await fetch(`/api/teacher/rooms?${params}`);
            if (response.ok) {
                const roomsData = await response.json();
                setRooms(roomsData.data);
            }
        } catch (error) {
            console.error('Failed to fetch available rooms:', error);
        } finally {
            setLoadingRooms(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchGroups(), fetchAllRooms()]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.groupId || !formData.roomId || !formData.date || !formData.startTime || !formData.endTime) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/teacher/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupId: parseInt(formData.groupId),
                    roomId: parseInt(formData.roomId),
                    date: formData.date,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                }),
            });

            if (response.ok) {
                alert('Séance créée avec succès !');
                // Reset form
                setFormData({
                    groupId: '',
                    roomId: '',
                    date: '',
                    startTime: '',
                    endTime: '',
                });
            } else {
                alert('Erreur lors de la création de la séance');
            }
        } catch (error) {
            console.error('Failed to create session:', error);
            alert('Erreur de connexion');
        } finally {
            setSubmitting(false);
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
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Nouvelle Séance</h1>
                        <p className="text-blue-100 text-lg">Planifiez une nouvelle séance de cours</p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center space-x-2">
                                <Plus className="w-6 h-6 text-green-300" />
                                <span className="text-sm font-medium">Créer Séance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        Détails de la Séance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Group Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Groupe *
                            </label>
                            <select
                                value={formData.groupId}
                                onChange={(e) => handleInputChange('groupId', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={loadingGroups}
                            >
                                <option value="">
                                    {loadingGroups ? 'Chargement...' : 'Sélectionner un groupe'}
                                </option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name} ({group.students.length} élèves)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Room Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Salle {formData.date && formData.startTime && formData.endTime ? '(Disponibles)' : ''} *
                            </label>
                            <select
                                value={formData.roomId}
                                onChange={(e) => handleInputChange('roomId', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={loadingRooms}
                            >
                                <option value="">
                                    {loadingRooms ? 'Chargement...' : 'Sélectionner une salle'}
                                </option>
                                {rooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.name}
                                    </option>
                                ))}
                            </select>
                            {formData.date && formData.startTime && formData.endTime && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Salles disponibles pour le {new Date(formData.date).toLocaleDateString('fr-FR')} de {formData.startTime} à {formData.endTime}
                                </p>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        {/* Time Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Heure de début *
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Heure de fin *
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        {formData.groupId && formData.roomId && formData.date && formData.startTime && formData.endTime && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">Aperçu de la séance</h4>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <p><strong>Groupe:</strong> {groups.find(g => g.id === parseInt(formData.groupId))?.name}</p>
                                    <p><strong>Salle:</strong> {rooms.find(r => r.id === parseInt(formData.roomId))?.name}</p>
                                    <p><strong>Date:</strong> {new Date(formData.date).toLocaleDateString('fr-FR')}</p>
                                    <p><strong>Horaire:</strong> {formData.startTime} - {formData.endTime}</p>
                                </div>
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6 border-t">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex-1"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Création...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Créer la Séance
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Annuler
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}