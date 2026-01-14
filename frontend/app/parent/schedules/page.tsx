'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import { Calendar, Clock, MapPin, User, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleItem {
    childId: number;
    childName: string;
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
    group: string;
    room: string;
}

export default function ParentSchedules() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedChild, setSelectedChild] = useState<number | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchSchedules();
        }
    }, [user, currentWeek]);

    const fetchSchedules = async () => {
        try {
            const response = await fetch(`/api/parents/${user!.id}/children/schedules`);
            const data = await response.json();
            if (data.success) {
                setSchedules(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeekDates = (date: Date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weekDates.push(day);
        }
        return weekDates;
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5); // HH:MM format
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const getDayName = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    };

    const getSchedulesForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
            return scheduleDate === dateStr &&
                   (selectedChild === null || schedule.childId === selectedChild);
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const getUniqueChildren = () => {
        const children = schedules.reduce((acc, schedule) => {
            if (!acc.find(c => c.id === schedule.childId)) {
                acc.push({ id: schedule.childId, name: schedule.childName });
            }
            return acc;
        }, [] as Array<{ id: number; name: string }>);
        return children;
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeek(newWeek);
    };

    const weekDates = getWeekDates(currentWeek);
    const uniqueChildren = getUniqueChildren();

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
                        <h1 className="text-2xl font-bold text-gray-900">Emplois du Temps</h1>
                        <p className="text-gray-600">Consultez les emplois du temps de vos enfants</p>
                    </div>

                    {/* Controls */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigateWeek('prev')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <div className="text-center">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Semaine du {formatDate(weekDates[0])}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    au {formatDate(weekDates[6])}
                                </p>
                            </div>

                            <button
                                onClick={() => navigateWeek('next')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        {uniqueChildren.length > 1 && (
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
                        )}
                    </div>

                    {/* Weekly Schedule Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                        {weekDates.map((date, index) => {
                            const daySchedules = getSchedulesForDay(date);
                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                                <Card key={index} className={`p-4 ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                                    <div className="text-center mb-4">
                                        <h3 className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                            {getDayName(date)}
                                        </h3>
                                        <p className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                            {date.getDate()}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {daySchedules.length === 0 ? (
                                            <div className="text-center text-gray-400 text-sm py-4">
                                                Aucun cours
                                            </div>
                                        ) : (
                                            daySchedules.map((schedule) => (
                                                <div
                                                    key={schedule.id}
                                                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="h-4 w-4 text-blue-600" />
                                                        <span className="text-sm font-medium text-blue-900">
                                                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="h-3 w-3 text-gray-500" />
                                                            <span className="text-xs text-gray-700">{schedule.subject}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <User className="h-3 w-3 text-gray-500" />
                                                            <span className="text-xs text-gray-700">{schedule.teacher}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3 w-3 text-gray-500" />
                                                            <span className="text-xs text-gray-700">{schedule.room}</span>
                                                        </div>

                                                        <div className="mt-2 pt-2 border-t border-blue-200">
                                                            <span className="text-xs text-blue-700 font-medium">
                                                                {schedule.group}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <Card className="mt-6 p-6">
                        <h3 className="text-lg font-semibold mb-4">Résumé de la semaine</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {schedules.filter(s => {
                                        const scheduleDate = new Date(s.date);
                                        const weekStart = weekDates[0];
                                        const weekEnd = weekDates[6];
                                        return scheduleDate >= weekStart && scheduleDate <= weekEnd &&
                                               (selectedChild === null || s.childId === selectedChild);
                                    }).length}
                                </div>
                                <div className="text-sm text-green-600">Cours cette semaine</div>
                            </div>

                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {uniqueChildren.length}
                                </div>
                                <div className="text-sm text-blue-600">Enfant(s)</div>
                            </div>

                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {new Set(schedules.map(s => s.subject)).size}
                                </div>
                                <div className="text-sm text-purple-600">Matières différentes</div>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}