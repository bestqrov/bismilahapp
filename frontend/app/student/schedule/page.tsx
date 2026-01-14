'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    BookOpen,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ScheduleItem {
    id: string;
    subject: string;
    teacher: string;
    room: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
    groupName: string;
}

export default function StudentSchedule() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());

    useEffect(() => {
        if (user?.id) {
            fetchSchedule();
        }
    }, [user]);

    const fetchSchedule = async () => {
        try {
            const response = await fetch(`/api/students/${user!.id}/schedule`);
            const data = await response.json();
            if (data.success) {
                setSchedule(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const daysOfWeek = [
        'Dimanche', 'Lundi', 'Mardi', 'Mercredi',
        'Jeudi', 'Vendredi', 'Samedi'
    ];

    const getDaySchedule = (day: number) => {
        return schedule.filter(item => item.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5); // HH:MM format
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
                            <p className="text-gray-600">Chargement de l'emploi du temps...</p>
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
                            Emploi du Temps 📅
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Consultez votre planning de cours hebdomadaire
                        </p>
                    </div>

                    {/* Day Selector */}
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map((day, index) => (
                                <Button
                                    key={index}
                                    onClick={() => setSelectedDay(index)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        selectedDay === index
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                >
                                    {day}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Schedule for Selected Day */}
                    <Card className="p-6">
                        <div className="flex items-center mb-6">
                            <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                {daysOfWeek[selectedDay]}
                            </h2>
                        </div>

                        {getDaySchedule(selectedDay).length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                    Aucun cours prévu pour {daysOfWeek[selectedDay].toLowerCase()}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {getDaySchedule(selectedDay).map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {item.subject}
                                                    </h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 mr-2" />
                                                        {item.teacher}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPin className="h-4 w-4 mr-2" />
                                                        Salle {item.room}
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm text-blue-600 font-medium">
                                                    Groupe: {item.groupName}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </main>
            </div>
        </div>
    );
}