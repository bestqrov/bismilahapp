import prisma from '../../config/database';

interface CreateAttendanceData {
    studentId: number;
    sessionId: number;
    status: string;
}

interface MarkAttendanceByQRData {
    qrData: string;
    sessionId: number;
}

export const createAttendance = async (data: CreateAttendanceData) => {
    const { studentId, sessionId, status } = data;

    // Validate status
    if (!['present', 'absent'].includes(status)) {
        throw new Error('Status must be either "present" or "absent"');
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
        where: { id: studentId },
    });

    if (!student) {
        throw new Error('Student not found');
    }

    const attendance = await prisma.attendance.create({
        data: {
            studentId,
            sessionId,
            status,
        },
        include: {
            student: true,
        },
    });

    return attendance;
};

export const getAttendanceByStudent = async (studentId: string) => {
    // Check if student exists
    const student = await prisma.student.findUnique({
        where: { id: parseInt(studentId) },
    });

    if (!student) {
        throw new Error('Student not found');
    }

    const attendances = await prisma.attendance.findMany({
        where: { studentId: parseInt(studentId) },
        include: {
            student: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return attendances;
};

export const markAttendanceByQR = async (data: MarkAttendanceByQRData) => {
    const { qrData, sessionId } = data;

    // Parse QR code data (format: STUDENT:{id})
    const match = qrData.match(/^STUDENT:(\d+)$/);
    if (!match) {
        throw new Error('Invalid QR code format. Expected: STUDENT:{id}');
    }

    const studentId = parseInt(match[1]);

    // Check if student exists
    const student = await prisma.student.findUnique({
        where: { id: studentId },
    });

    if (!student) {
        throw new Error('Student not found');
    }

    // Check if session exists and get session details
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
            group: {
                include: {
                    students: true,
                },
            },
        },
    });

    if (!session) {
        throw new Error('Session not found');
    }

    // Check if student is enrolled in this session's group
    const isEnrolled = session.group.students.some(s => s.id === studentId);
    if (!isEnrolled) {
        throw new Error('Student is not enrolled in this session');
    }

    // Check if attendance already exists for this student and session
    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            studentId,
            sessionId,
        },
    });

    if (existingAttendance) {
        // Update existing attendance to present
        const attendance = await prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: { status: 'present' },
            include: {
                student: true,
                session: {
                    include: {
                        group: true,
                    },
                },
            },
        });
        return attendance;
    } else {
        // Create new attendance record
        const attendance = await prisma.attendance.create({
            data: {
                studentId,
                sessionId,
                status: 'present',
            },
            include: {
                student: true,
                session: {
                    include: {
                        group: true,
                    },
                },
            },
        });
        return attendance;
    }
};
