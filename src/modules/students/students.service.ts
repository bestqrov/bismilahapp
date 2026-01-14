import prisma from '../../config/database';
import { hashPassword, generateRandomPassword } from '../../utils/bcrypt';
import { getSettings } from '../settings/settings.service';

interface CreateStudentData {
    name: string;
    surname: string;
    phone?: string;
    email?: string;
    password?: string;
    cin?: string;
    address?: string;
    birthDate?: Date;
    birthPlace?: string;
    fatherName?: string;
    motherName?: string;
    parentName?: string;
    parentPhone?: string;
    parentRelation?: string;
    schoolLevel?: string;
    currentSchool?: string;
    subjects?: any;
    photo?: string;
    active?: boolean;
}

interface UpdateStudentData {
    name?: string;
    surname?: string;
    phone?: string;
    email?: string;
    cin?: string;
    address?: string;
    birthDate?: Date;
    birthPlace?: string;
    fatherName?: string;
    motherName?: string;
    parentName?: string;
    parentPhone?: string;
    parentRelation?: string;
    schoolLevel?: string;
    currentSchool?: string;
    subjects?: any;
    photo?: string;
    active?: boolean;
    groupIds?: string[];
}

export const createStudent = async (data: CreateStudentData & { inscriptionFee?: number; amountPaid?: number }) => {
    return await prisma.$transaction(async (tx) => {
        // Generate email and password if not provided
        let email = data.email;
        let password = data.password;
        if (!email) {
            // Get school settings to use school name in email
            const settings = await getSettings();
            const schoolName = settings.schoolName.toLowerCase().replace(/\s+/g, ''); // Remove spaces
            email = `${data.name.toLowerCase().replace(/\s+/g, '')}.${data.surname.toLowerCase().replace(/\s+/g, '')}@${schoolName}.com`;
        }
        if (!password) {
            password = generateRandomPassword();
            console.log(`Generated password for ${data.name} ${data.surname}: ${password}`);
        }
        const hashedPassword = await hashPassword(password);

        // 1. Create Student
        const student = await tx.student.create({
            data: {
                name: data.name,
                surname: data.surname,
                phone: data.phone,
                email,
                password: hashedPassword,
                cin: data.cin,
                address: data.address,
                birthDate: data.birthDate,
                birthPlace: data.birthPlace,
                fatherName: data.fatherName,
                motherName: data.motherName,
                parentName: data.parentName,
                parentPhone: data.parentPhone,
                parentRelation: data.parentRelation,
                schoolLevel: data.schoolLevel,
                currentSchool: data.currentSchool,
                subjects: data.subjects,
                photo: data.photo,
                active: data.active ?? true,
            },
        });

        // 2. Create Inscription if fee is provided
        console.log('DEBUG: inscriptionFee is', data.inscriptionFee);
        if (data.inscriptionFee !== undefined) {
            console.log('DEBUG: Creating inscription...');
            await tx.inscription.create({
                data: {
                    studentId: student.id,
                    type: 'SOUTIEN',
                    category: data.schoolLevel || 'Unknown',
                    amount: data.inscriptionFee,
                    date: new Date(),
                    note: 'Inscription initiale',
                },
            });
            console.log('DEBUG: Inscription created.');
        }

        // 3. Create Payment if amount is provided
        if (data.amountPaid !== undefined && data.amountPaid > 0) {
            await tx.payment.create({
                data: {
                    studentId: student.id,
                    amount: data.amountPaid,
                    method: 'CASH', // Default to CASH for now
                    date: new Date(),
                    note: 'Paiement à l\'inscription',
                },
            });
        }

        return student;
    });
};

export const getAllStudents = async () => {
    const students = await prisma.student.findMany({
        include: {
            inscriptions: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return students;
};

export const getStudentById = async (id: number) => {
    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            inscriptions: true,
            payments: true,
            attendances: true,
        },
    });

    if (!student) {
        throw new Error('Student not found');
    }

    return student;
};

export const updateStudent = async (id: string, data: UpdateStudentData) => {
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
        where: { id: parseInt(id) },
        include: { groups: true }
    });

    if (!existingStudent) {
        throw new Error('Student not found');
    }

    // If groupIds provided, validate no duplicate subjects for SOUTIEN groups
    if (data.groupIds) {
        const groups = await prisma.group.findMany({
            where: { id: { in: data.groupIds.map(id => parseInt(id)) } },
            select: { id: true, subject: true, type: true }
        });

        const soutienGroups = groups.filter(g => g.type === 'SOUTIEN');
        const subjects = soutienGroups.map(g => g.subject);
        const uniqueSubjects = new Set(subjects);

        if (subjects.length !== uniqueSubjects.size) {
            throw new Error('Un étudiant ne peut pas s\'inscrire deux fois à la même matière de soutien scolaire');
        }

        // Check if student is already in any of these groups
        const existingGroupIds = existingStudent.groups.map(g => g.id);
        const conflictingGroups = data.groupIds.filter(id => existingGroupIds.includes(parseInt(id)));
        if (conflictingGroups.length > 0) {
            throw new Error('L\'étudiant est déjà inscrit à certains groupes sélectionnés');
        }
    }

    const updateData: any = { ...data };
    if (data.groupIds) {
        updateData.groups = {
            connect: data.groupIds.map(id => ({ id: parseInt(id) }))
        };
    }

    const student = await prisma.student.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { groups: true }
    });

    return student;
};

export const deleteStudent = async (id: string) => {
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
        where: { id: parseInt(id) },
    });

    if (!existingStudent) {
        throw new Error('Étudiant non trouvé');
    }

    // Delete the student (cascade will handle related records)
    await prisma.student.delete({
        where: { id: parseInt(id) },
    });

    return { message: 'Étudiant supprimé avec succès' };
};

// Helpers removed as global pricing is deprecated

export const getStudentAnalytics = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    // Set endOfMonth to end of the day
    endOfMonth.setHours(23, 59, 59, 999);

    const totalStudents = await prisma.student.count();
    const totalInscriptions = await prisma.inscription.count({
        where: { type: 'SOUTIEN' }
    });

    // 1. Calculate Recurring Monthly Revenue from ALL Students
    // We assume all students in the database are "Active"
    const allStudents = await prisma.student.findMany();

    let monthlyRevenue = 0;

    console.log(`DEBUG ANALYTICS: Calculating recurring revenue for ${allStudents.length} students (Manual Pricing mode)...`);

    for (const student of allStudents) {
        if (student.subjects) {
            const subjects = student.subjects as Record<string, any>;
            let studentTotal = 0;

            for (const [subject, value] of Object.entries(subjects)) {
                // In manual mode, value should be the price (number)
                // We handle legacy boolean 'true' as 0
                if (typeof value === 'number') {
                    studentTotal += value;
                } else if (value === true) {
                    console.warn(`Warning: Student ${student.id} has legacy boolean subject ${subject}, treating as 0`);
                }
            }
            monthlyRevenue += studentTotal;
        }
    }
    console.log(`DEBUG ANALYTICS: Total Recurring Revenue: ${monthlyRevenue}`);

    // 2. Add ALL Inscription Fees for SOUTIEN
    // Inscription fees contribute to the total expected revenue
    const allSoutienInscriptions = await prisma.inscription.findMany({
        where: { type: 'SOUTIEN' }
    });

    let totalInscriptionFees = 0;
    for (const inscription of allSoutienInscriptions) {
        totalInscriptionFees += inscription.amount || 0;
    }
    monthlyRevenue += totalInscriptionFees;
    console.log(`DEBUG ANALYTICS: Total SOUTIEN Inscription Fees: ${totalInscriptionFees}`);
    console.log(`DEBUG ANALYTICS: Total Revenue (Recurring + All Inscriptions): ${monthlyRevenue}`);

    // Get recent inscriptions
    const recentInscriptions = await prisma.inscription.findMany({
        where: { type: 'SOUTIEN' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            student: true
        }
    });

    const recentInscriptionsWithTotal = recentInscriptions.map(inscription => {
        let totalAmount = inscription.amount;
        const student = inscription.student;

        if (student && student.subjects) {
            const subjects = student.subjects as Record<string, any>;
            for (const [subject, value] of Object.entries(subjects)) {
                if (typeof value === 'number') {
                    totalAmount += value;
                }
            }
        }

        return {
            ...inscription,
            amount: totalAmount
        };
    });

    return {
        totalStudents,
        totalInscriptions,
        totalRevenue: monthlyRevenue,
        recentInscriptions: recentInscriptionsWithTotal,
        debugInfo: {
            mode: 'MANUAL_PRICING',
            studentDetails: allStudents.map(s => ({
                id: s.id,
                subjects: s.subjects,
                calculatedRevenue: (() => {
                    let total = 0;
                    if (s.subjects) {
                        for (const [, val] of Object.entries(s.subjects as Record<string, any>)) {
                            if (typeof val === 'number') total += val;
                        }
                    }
                    return total;
                })()
            }))
        }
    };
};

export const getStudentDashboard = async (studentId: string) => {
    const id = parseInt(studentId);
    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            groups: {
                include: {
                    teacher: true,
                    formation: true,
                },
            },
        },
    });

    if (!student) throw new Error('Student not found');

    // Get recent assignments
    const assignments = await prisma.assignment.findMany({
        where: {
            group: {
                students: {
                    some: { id },
                },
            },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
            teacher: true,
            group: true,
        },
    });

    // Get recent notifications
    const notifications = await prisma.studentNotification.findMany({
        where: { studentId: id },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    // Get payment status
    const payments = await prisma.payment.findMany({
        where: { studentId: id },
        orderBy: { date: 'desc' },
        take: 3,
    });

    return {
        student: {
            id: student.id,
            name: `${student.name} ${student.surname}`,
            schoolLevel: student.schoolLevel,
            groups: student.groups,
        },
        assignments,
        notifications,
        payments,
    };
};

export const getStudentSchedule = async (studentId: string) => {
    const id = parseInt(studentId);
    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            groups: {
                include: {
                    sessions: {
                        include: {
                            room: true,
                            teacher: true,
                        },
                        orderBy: { date: 'asc' },
                    },
                    formation: true,
                },
            },
        },
    });

    if (!student) throw new Error('Student not found');

    // For now, return sessions from groups
    const schedule = (student as any).groups.flatMap((group: any) =>
        group.sessions.map((session: any) => ({
            id: session.id,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            subject: group.subject || group.formation?.name || 'N/A',
            teacher: session.teacher.name,
            group: group.name,
            room: session.room?.name || 'N/A',
        }))
    );

    return schedule;
};

export const getStudentAssignments = async (studentId: string) => {
    const id = parseInt(studentId);
    const assignments = await prisma.assignment.findMany({
        where: {
            group: {
                students: {
                    some: { id },
                },
            },
        },
        orderBy: { dueDate: 'asc' },
        include: {
            teacher: true,
            group: true,
        },
    });

    return assignments.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        dueDate: assignment.dueDate,
        teacher: assignment.teacher.name,
        group: assignment.group.name,
    }));
};

export const getStudentNotifications = async (studentId: string) => {
    const id = parseInt(studentId);
    const notifications = await prisma.studentNotification.findMany({
        where: { studentId: id },
        orderBy: { createdAt: 'desc' },
    });

    return notifications;
};

export const getStudentPayments = async (studentId: string) => {
    const id = parseInt(studentId);
    const payments = await prisma.payment.findMany({
        where: { studentId: id },
        orderBy: { date: 'desc' },
    });

    // Calculate total paid and pending
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    // Assuming some total amount, for now just return payments
    return {
        totalPaid,
        payments,
        status: totalPaid > 0 ? 'partial' : 'pending', // Placeholder
    };
};

export const getStudentLoginInfo = async (studentId: string) => {
    const id = parseInt(studentId);
    const student = await prisma.student.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            surname: true,
            email: true,
        },
    });

    if (!student) throw new Error('Student not found');

    return {
        id: student.id,
        name: `${student.name} ${student.surname}`,
        email: student.email,
    };
};

export const getStudentProfile = async (studentId: string) => {
    const id = parseInt(studentId);
    const student = await prisma.student.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            surname: true,
            phone: true,
            email: true,
            cin: true,
            address: true,
            birthDate: true,
            birthPlace: true,
            fatherName: true,
            motherName: true,
            schoolLevel: true,
            currentSchool: true,
            subjects: true,
            photo: true,
        },
    });

    if (!student) {
        throw new Error('Student not found');
    }

    return student;
};

export const updateStudentPassword = async (id: string, newPassword: string) => {
    // Hash the new password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the student's password directly
    const updatedStudent = await prisma.student.update({
        where: { id: parseInt(id) },
        data: { password: hashedPassword },
        select: {
            id: true,
            email: true,
            name: true,
            surname: true,
        },
    });

    return {
        student: updatedStudent,
        message: 'Password updated successfully',
    };
};
