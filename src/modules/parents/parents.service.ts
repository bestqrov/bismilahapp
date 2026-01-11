import prisma from '../../config/database';
import { hashPassword, generateRandomPassword } from '../../utils/bcrypt';

interface CreateParentData {
    name: string;
    surname?: string;
    email?: string;
    password?: string;
    phone?: string;
    address?: string;
}

export const createParent = async (data: CreateParentData) => {
    // Generate email and password if not provided
    let email = data.email;
    let password = data.password;
    if (!email) {
        email = `${data.name.toLowerCase()}.${data.surname?.toLowerCase() || ''}@parent.school`;
    }
    if (!password) {
        password = generateRandomPassword();
    }
    const hashedPassword = await hashPassword(password);

    const parent = await prisma.parent.create({
        data: {
            name: data.name,
            surname: data.surname,
            email,
            password: hashedPassword,
            phone: data.phone,
            address: data.address,
        },
    });

    return parent;
};

export const getParentDashboard = async (parentId: string) => {
    const id = parseInt(parentId);
    const parent = await prisma.parent.findUnique({
        where: { id },
        include: {
            children: {
                include: {
                    student: {
                        include: {
                            groups: true,
                        },
                    },
                },
            },
        },
    });

    if (!parent) throw new Error('Parent not found');

    const children = parent.children.map(pc => ({
        id: pc.student.id,
        name: `${pc.student.name} ${pc.student.surname}`,
        class: pc.student.groups.map(g => g.name).join(', '),
        level: pc.student.schoolLevel,
    }));

    // Get recent notifications
    const notifications = await prisma.studentNotification.findMany({
        where: { parentId: id },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    return {
        parent: {
            id: parent.id,
            name: `${parent.name} ${parent.surname || ''}`.trim(),
        },
        children,
        notifications,
    };
};

export const getParentChildren = async (parentId: string) => {
    const id = parseInt(parentId);
    const parent = await prisma.parent.findUnique({
        where: { id },
        include: {
            children: {
                include: {
                    student: {
                        include: {
                            groups: true,
                        },
                    },
                },
            },
        },
    });

    if (!parent) throw new Error('Parent not found');

    return parent.children.map(pc => ({
        id: pc.student.id,
        name: `${pc.student.name} ${pc.student.surname}`,
        class: pc.student.groups.map(g => g.name).join(', '),
        level: pc.student.schoolLevel,
    }));
};

export const getParentChildrenSchedules = async (parentId: string) => {
    const id = parseInt(parentId);
    const parent = await prisma.parent.findUnique({
        where: { id },
        include: {
            children: {
                include: {
                    student: {
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
                    },
                },
            },
        },
    });

    if (!parent) throw new Error('Parent not found');

    const schedules: any[] = [];
    parent.children.forEach(pc => {
        const student = pc.student;
        student.groups.forEach(group => {
            group.sessions.forEach(session => {
                schedules.push({
                    childId: student.id,
                    childName: `${student.name} ${student.surname}`,
                    id: session.id,
                    date: session.date,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    subject: group.subject || group.formation?.name || 'N/A',
                    teacher: session.teacher.name,
                    group: group.name,
                    room: session.room?.name || 'N/A',
                });
            });
        });
    });

    return schedules;
};

export const getParentChildrenGrades = async (parentId: string) => {
    const id = parseInt(parentId);
    const parent = await prisma.parent.findUnique({
        where: { id },
        include: {
            children: {
                include: {
                    student: {
                        include: {
                            grades: {
                                include: {
                                    teacher: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!parent) throw new Error('Parent not found');

    const grades: any[] = [];
    parent.children.forEach(pc => {
        const student = pc.student;
        student.grades.forEach(grade => {
            grades.push({
                childId: student.id,
                childName: `${student.name} ${student.surname}`,
                id: grade.id,
                subject: grade.subject,
                grade: grade.grade,
                teacher: grade.teacher.name,
                date: grade.date,
            });
        });
    });

    return grades;
};

export const getParentNotifications = async (parentId: string) => {
    const id = parseInt(parentId);
    const notifications = await prisma.studentNotification.findMany({
        where: { parentId: id },
        orderBy: { createdAt: 'desc' },
    });

    return notifications;
};

export const getParentPayments = async (parentId: string) => {
    const id = parseInt(parentId);
    const parent = await prisma.parent.findUnique({
        where: { id },
        include: {
            children: {
                include: {
                    student: {
                        include: {
                            payments: true,
                        },
                    },
                },
            },
        },
    });

    if (!parent) throw new Error('Parent not found');

    const payments: any[] = [];
    parent.children.forEach(pc => {
        const student = pc.student;
        student.payments.forEach(payment => {
            payments.push({
                childId: student.id,
                childName: `${student.name} ${student.surname}`,
                id: payment.id,
                amount: payment.amount,
                method: payment.method,
                note: payment.note,
                date: payment.date,
            });
        });
    });

    return payments;
};

export const getParentLoginInfo = async (parentId: string) => {
    const id = parseInt(parentId);
    const parent = await prisma.parent.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            surname: true,
            email: true,
        },
    });

    if (!parent) throw new Error('Parent not found');

    return {
        id: parent.id,
        name: `${parent.name} ${parent.surname || ''}`.trim(),
        email: parent.email,
    };
};

export const updateParentPassword = async (parentId: string, newPassword: string) => {
    const id = parseInt(parentId);
    const hashedPassword = await hashPassword(newPassword);

    const parent = await prisma.parent.update({
        where: { id },
        data: { password: hashedPassword },
        select: {
            id: true,
            name: true,
            surname: true,
            email: true,
        },
    });

    return {
        id: parent.id,
        name: `${parent.name} ${parent.surname || ''}`.trim(),
        email: parent.email,
    };
};