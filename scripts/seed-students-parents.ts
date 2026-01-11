import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding students and parents...');

    // Create sample teacher
    const teacher = await prisma.teacher.create({
        data: {
            name: 'Monsieur Dupont',
            email: 'dupont@example.com',
            password: await hashPassword('password123'),
            phone: '+21644444444',
            specialties: ['MATHS', 'PHYSIQUE'],
            levels: ['LYCEE', 'COLLEGE'],
        },
    });

    // Create sample parents
    const parent1 = await prisma.parent.create({
        data: {
            name: 'Ahmed',
            surname: 'Ben Ali',
            email: 'ahmed.benali@example.com',
            password: await hashPassword('password123'),
            phone: '+21612345678',
            address: 'Tunis, Tunisia',
        },
    });

    const parent2 = await prisma.parent.create({
        data: {
            name: 'Fatima',
            surname: 'Trabelsi',
            email: 'fatima.trabelsi@example.com',
            password: await hashPassword('password123'),
            phone: '+21687654321',
            address: 'Sfax, Tunisia',
        },
    });

    // Create sample students
    const student1 = await prisma.student.create({
        data: {
            name: 'Mohamed',
            surname: 'Ben Ali',
            email: 'mohamed.benali@example.com',
            password: await hashPassword('password123'),
            phone: '+21611111111',
            schoolLevel: 'LYCEE',
            currentSchool: 'Lycée de Tunis',
            parents: {
                create: {
                    parentId: parent1.id,
                    relation: 'father',
                },
            },
        },
    });

    const student2 = await prisma.student.create({
        data: {
            name: 'Amina',
            surname: 'Ben Ali',
            email: 'amina.benali@example.com',
            password: await hashPassword('password123'),
            phone: '+21622222222',
            schoolLevel: 'COLLEGE',
            currentSchool: 'Collège de Tunis',
            parents: {
                create: [
                    {
                        parentId: parent1.id,
                        relation: 'father',
                    },
                    {
                        parentId: parent2.id,
                        relation: 'mother',
                    },
                ],
            },
        },
    });

    const student3 = await prisma.student.create({
        data: {
            name: 'Youssef',
            surname: 'Trabelsi',
            email: 'youssef.trabelsi@example.com',
            password: await hashPassword('password123'),
            phone: '+21633333333',
            schoolLevel: 'LYCEE',
            currentSchool: 'Lycée de Sfax',
            parents: {
                create: {
                    parentId: parent2.id,
                    relation: 'father',
                },
            },
        },
    });

    // Create sample groups
    const group1 = await prisma.group.create({
        data: {
            name: 'Mathématiques LYCEE',
            type: 'SOUTIEN',
            level: 'LYCEE',
            subject: 'MATHS',
            teacherId: teacher.id,
        },
    });

    const group2 = await prisma.group.create({
        data: {
            name: 'Physique COLLÈGE',
            type: 'SOUTIEN',
            level: 'COLLEGE',
            subject: 'PHYSIQUE',
            teacherId: teacher.id,
        },
    });

    // Link students to groups
    await prisma.group.update({
        where: { id: group1.id },
        data: {
            students: {
                connect: [{ id: student1.id }, { id: student3.id }],
            },
        },
    });

    await prisma.group.update({
        where: { id: group2.id },
        data: {
            students: {
                connect: [{ id: student2.id }],
            },
        },
    });

    // Create sample assignments
    await prisma.assignment.create({
        data: {
            title: 'Exercice d\'algèbre',
            description: 'Résoudre les équations du second degré',
            subject: 'MATHS',
            dueDate: new Date('2026-01-20'),
            teacherId: teacher.id,
            groupId: group1.id,
            students: {
                connect: [{ id: student1.id }, { id: student3.id }],
            },
        },
    });

    // Create sample grades
    await prisma.grade.create({
        data: {
            studentId: student1.id,
            subject: 'MATHS',
            grade: 15.5,
            teacherId: teacher.id,
            date: new Date('2026-01-05'),
        },
    });

    // Create sample notifications
    await prisma.studentNotification.create({
        data: {
            title: 'Vacances scolaires',
            message: 'Les vacances d\'hiver commencent le 15 janvier',
            type: 'holiday',
            studentId: student1.id,
        },
    });

    await prisma.studentNotification.create({
        data: {
            title: 'Rappel de paiement',
            message: 'Le paiement de février est en retard',
            type: 'payment',
            parentId: parent1.id,
        },
    });

    // Create sample payments
    await prisma.payment.create({
        data: {
            studentId: student1.id,
            amount: 200.0,
            method: 'Virement',
            note: 'Paiement mensuel',
            date: new Date('2026-01-01'),
        },
    });

    console.log('Seeding completed successfully!');
    console.log('Sample accounts:');
    console.log('Student: mohamed.benali@example.com / password123');
    console.log('Student: amina.benali@example.com / password123');
    console.log('Student: youssef.trabelsi@example.com / password123');
    console.log('Parent: ahmed.benali@example.com / password123');
    console.log('Parent: fatima.trabelsi@example.com / password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });