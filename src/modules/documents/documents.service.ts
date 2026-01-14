import prisma from '../../config/database';

export const getStudentsForDocuments = async (filters?: { type?: string }) => {
    const whereClause: any = {};

    if (filters?.type) {
        whereClause.inscriptions = {
            some: {
                type: filters.type.toUpperCase()
            }
        };
    }

    const students = await prisma.student.findMany({
        where: whereClause,
        include: {
            inscriptions: {
                orderBy: {
                    date: 'desc'
                }
            },
            payments: {
                orderBy: {
                    date: 'desc'
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return students;
};

export const getStudentDocument = async (studentId: string) => {
    const student = await prisma.student.findUnique({
        where: { id: parseInt(studentId) },
        include: {
            inscriptions: {
                orderBy: {
                    date: 'desc'
                }
            },
            payments: {
                orderBy: {
                    date: 'desc'
                }
            }
        }
    });

    if (!student) {
        throw new Error('Student not found');
    }

    return student;
};
