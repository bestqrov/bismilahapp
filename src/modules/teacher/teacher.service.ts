import prisma from '../../config/database';
import { NotificationType } from '@prisma/client';

export const getTeacherGroups = async (teacherId: number) => {
    return await prisma.group.findMany({
        where: { teacherId },
        include: {
            students: {
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    phone: true,
                    email: true,
                },
            },
            course: true,
            sessions: {
                include: {
                    room: true,
                    attendances: true,
                },
            },
        },
    });
};

export const createCourse = async (data: {
    name: string;
    teacherId: number;
}) => {
    return await prisma.course.create({
        data: {
            name: data.name,
            teacherId: data.teacherId,
        },
    });
};

export const getTeacherCourses = async (teacherId: number) => {
    return await prisma.course.findMany({
        where: { teacherId },
        include: {
            groups: {
                include: {
                    students: true,
                },
            },
        },
    });
};

export const getTeacherSessions = async (teacherId: number) => {
    return await prisma.session.findMany({
        where: { teacherId },
        include: {
            group: {
                include: {
                    students: true,
                },
            },
            room: true,
            attendances: true,
        },
        orderBy: { date: 'asc' },
    });
};

export const createSession = async (data: {
    date: Date;
    startTime: string;
    endTime: string;
    groupId: number;
    teacherId: number;
    roomId: number;
}) => {
    // Check for room conflict
    const conflictingSession = await prisma.session.findFirst({
        where: {
            roomId: data.roomId,
            date: data.date,
            OR: [
                {
                    AND: [
                        { startTime: { lte: data.startTime } },
                        { endTime: { gt: data.startTime } },
                    ],
                },
                {
                    AND: [
                        { startTime: { lt: data.endTime } },
                        { endTime: { gte: data.endTime } },
                    ],
                },
            ],
        },
    });

    if (conflictingSession) {
        throw new Error('Room is already booked for this time slot');
    }

    return await prisma.session.create({
        data,
        include: {
            group: true,
            room: true,
        },
    });
};

export const markAttendance = async (sessionId: number, attendances: { studentId: number; status: string }[]) => {
    // Check if session belongs to teacher - but since scoped, assume ok
    const attendanceData = attendances.map(att => ({
        sessionId,
        studentId: att.studentId,
        status: att.status,
    }));

    return await prisma.attendance.createMany({
        data: attendanceData,
        skipDuplicates: true,
    });
};

export const getNotifications = async (teacherId: number) => {
    return await prisma.notification.findMany({
        where: {
            OR: [
                { receiverId: teacherId, receiverType: 'teacher' },
                { receiverType: null }, // Broadcast
            ],
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const sendNotification = async (data: {
    title: string;
    message: string;
    type: NotificationType;
    senderId: number;
    receiverType?: string;
    receiverId?: number;
}) => {
    return await prisma.notification.create({
        data: {
            ...data,
            senderType: 'teacher',
        },
    });
};

export const getAvailableRooms = async (date?: string, startTime?: string, endTime?: string) => {
    if (!date || !startTime || !endTime) {
        // If no date/time provided, return all rooms
        return await prisma.room.findMany();
    }

    // Get all rooms
    const allRooms = await prisma.room.findMany();

    // Find rooms that are not booked for the specified time slot
    const availableRooms = [];

    for (const room of allRooms) {
        const conflictingSession = await prisma.session.findFirst({
            where: {
                roomId: room.id,
                date: new Date(date),
                OR: [
                    {
                        AND: [
                            { startTime: { lte: startTime } },
                            { endTime: { gt: startTime } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { lt: endTime } },
                            { endTime: { gte: endTime } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { gte: startTime } },
                            { endTime: { lte: endTime } },
                        ],
                    },
                ],
            },
        });

        if (!conflictingSession) {
            availableRooms.push(room);
        }
    }

    return availableRooms;
};

export const getAttendanceStats = async (teacherId: number) => {
    // Get all sessions for this teacher
    const sessions = await prisma.session.findMany({
        where: { teacherId },
        include: {
            attendances: true,
            group: {
                include: {
                    students: true,
                },
            },
        },
    });

    const totalSessions = sessions.length;
    const totalStudents = new Set(
        sessions.flatMap(s => s.group.students.map(st => st.id))
    ).size;

    const totalPresent = sessions.reduce((acc, s) =>
        acc + s.attendances.filter(a => a.status === 'present').length, 0
    );

    const totalAbsent = sessions.reduce((acc, s) =>
        acc + s.attendances.filter(a => a.status === 'absent').length, 0
    );

    const averageAttendance = totalSessions > 0
        ? Math.round((totalPresent / (totalPresent + totalAbsent || 1)) * 100)
        : 0;

    return {
        totalSessions,
        totalStudents,
        totalPresent,
        totalAbsent,
        averageAttendance,
    };
};

export const getStudentAttendanceStats = async (teacherId: number) => {
    // Get all students from teacher's groups
    const groups = await prisma.group.findMany({
        where: { teacherId },
        include: {
            students: true,
            sessions: {
                include: {
                    attendances: true,
                },
            },
        },
    });

    const studentStats = [];

    for (const group of groups) {
        for (const student of group.students) {
            const studentAttendances = group.sessions.flatMap(session =>
                session.attendances.filter(att => att.studentId === student.id)
            );

            const totalSessions = group.sessions.length;
            const presentCount = studentAttendances.filter(att => att.status === 'present').length;
            const absentCount = studentAttendances.filter(att => att.status === 'absent').length;
            const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

            studentStats.push({
                id: student.id,
                name: student.name,
                surname: student.surname,
                totalSessions,
                presentCount,
                absentCount,
                attendanceRate,
            });
        }
    }

    // Remove duplicates (student might be in multiple groups)
    const uniqueStudents = studentStats.reduce((acc, curr) => {
        const existing = acc.find(s => s.id === curr.id);
        if (existing) {
            existing.totalSessions += curr.totalSessions;
            existing.presentCount += curr.presentCount;
            existing.absentCount += curr.absentCount;
            existing.attendanceRate = existing.totalSessions > 0
                ? Math.round((existing.presentCount / existing.totalSessions) * 100)
                : 0;
        } else {
            acc.push(curr);
        }
        return acc;
    }, [] as typeof studentStats);

    return uniqueStudents;
};

export const getSessionAttendanceStats = async (teacherId: number) => {
    const sessions = await prisma.session.findMany({
        where: { teacherId },
        include: {
            attendances: true,
            group: {
                include: {
                    students: true,
                },
            },
        },
        orderBy: { date: 'desc' },
    });

    return sessions.map(session => {
        const presentCount = session.attendances.filter(a => a.status === 'present').length;
        const absentCount = session.attendances.filter(a => a.status === 'absent').length;
        const totalStudents = session.group.students.length;
        const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

        return {
            id: session.id,
            date: session.date.toISOString().split('T')[0],
            groupName: session.group.name,
            presentCount,
            absentCount,
            totalStudents,
            attendanceRate,
        };
    });
};

export const getRecentActivities = async (teacherId: number) => {
    // Get recent sessions with attendance
    const recentSessions = await prisma.session.findMany({
        where: { teacherId },
        include: {
            group: {
                include: {
                    students: true,
                },
            },
            attendances: true,
        },
        orderBy: { date: 'desc' },
        take: 5,
    });

    const activities = [];

    for (const session of recentSessions) {
        const presentCount = session.attendances.filter(a => a.status === 'present').length;
        const totalStudents = session.group.students.length;

        activities.push({
            id: `session-${session.id}`,
            type: 'session',
            title: 'Séance terminée',
            description: `${session.group.name} - ${presentCount}/${totalStudents} présents`,
            timestamp: session.date,
            icon: 'CheckCircle',
            color: 'green',
        });
    }

    // Get recent notifications sent by teacher
    const recentNotifications = await prisma.notification.findMany({
        where: {
            senderId: teacherId,
            senderType: 'teacher',
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
    });

    for (const notification of recentNotifications) {
        activities.push({
            id: `notification-${notification.id}`,
            type: 'notification',
            title: 'Notification envoyée',
            description: notification.title,
            timestamp: notification.createdAt,
            icon: 'Bell',
            color: 'blue',
        });
    }

    // Sort by timestamp and take most recent 5
    return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
};