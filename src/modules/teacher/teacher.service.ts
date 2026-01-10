import prisma from '../../config/database';

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
    type: string;
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

export const getAvailableRooms = async () => {
    return await prisma.room.findMany();
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