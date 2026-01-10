import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seed...');

    // Clear existing data (in correct order to avoid foreign key constraints)
    await prisma.attendance.deleteMany();
    await prisma.session.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.course.deleteMany();
    await prisma.group.deleteMany();
    await prisma.formation.deleteMany();
    await prisma.pricing.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();
    const hashedAdminPassword = await bcrypt.hash('enovazone123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'enovazone@arwaeduc.com',
            password: hashedAdminPassword,
            name: 'Administrateur ENOVAZONE',
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin account created:', {
        email: admin.email,
        name: admin.name,
        role: admin.role,
    });

    // Create secretary account
    const hashedPassword = await bcrypt.hash('secretary123', 10);

    const secretary = await prisma.user.create({
        data: {
            email: 'secretary@injahi.com',
            password: hashedPassword,
            name: 'Souad Injah',
            role: 'SECRETARY',
        },
    });

    console.log('✅ Secretary account created:', {
        email: secretary.email,
        name: secretary.name,
        role: secretary.role,
    });

    console.log('\n📋 Login Credentials:');
    console.log('\n🔐 ADMIN:');
    console.log('Email: enovazone@arwaeduc.com');
    console.log('Password: enovazone123');
    console.log('\n🔐 SECRETARY:');
    console.log('Email: secretary@injahi.com');
    console.log('Password: secretary123');
    console.log('\n⚠️  Please change the passwords after first login!');

    // Create sample formations
    const formations = [
        {
            name: 'Développement Web Fullstack',
            duration: '6 mois',
            price: 3000,
            description: 'Formation complète en développement web (HTML, CSS, JS, React, Node.js)',
        },
        {
            name: 'Marketing Digital',
            duration: '3 mois',
            price: 1500,
            description: 'Maîtrisez les réseaux sociaux et la publicité en ligne',
        },
        {
            name: 'Design Graphique',
            duration: '4 mois',
            price: 2000,
            description: 'Apprenez Photoshop, Illustrator et InDesign',
        },
        {
            name: 'Comptabilité Pratique',
            duration: '3 mois',
            price: 1800,
            description: 'Formation pratique sur Sage et Excel',
        },
    ];

    console.log('\nCreating sample formations...');
    for (const formation of formations) {
        const existing = await prisma.formation.findFirst({
            where: { name: formation.name }
        });

        if (!existing) {
            await prisma.formation.create({
                data: formation
            });
            console.log(`Created formation: ${formation.name}`);
        } else {
            console.log(`Formation already exists: ${formation.name}`);
        }
    }

    // Create default pricing
    const pricingItems = [
        // LYCEE
        { category: 'SOUTIEN', level: 'Lycée', subject: 'Maths', price: 200 },
        { category: 'SOUTIEN', level: 'Lycée', subject: 'Physique et Chimique', price: 200 },
        { category: 'SOUTIEN', level: 'Lycée', subject: 'S.V.T', price: 200 },
        { category: 'SOUTIEN', level: 'Lycée', subject: 'Anglais', price: 150 },
        { category: 'SOUTIEN', level: 'Lycée', subject: 'Français', price: 150 },

        // COLLEGE
        { category: 'SOUTIEN', level: 'Collège', subject: 'Maths', price: 150 },
        { category: 'SOUTIEN', level: 'Collège', subject: 'Physique et Chimique', price: 150 },
        { category: 'SOUTIEN', level: 'Collège', subject: 'S.V.T', price: 150 },
        { category: 'SOUTIEN', level: 'Collège', subject: 'Anglais', price: 100 },

        // PRIMAIRE
        { category: 'SOUTIEN', level: 'Primaire', subject: 'Maths', price: 100 },
        { category: 'SOUTIEN', level: 'Primaire', subject: 'Français', price: 100 },
        { category: 'SOUTIEN', level: 'Primaire', subject: 'Français Communication', price: 100 },
        { category: 'SOUTIEN', level: 'Primaire', subject: 'Calcul Mental', price: 100 },
    ];

    console.log('\nCreating default pricing...');
    for (const item of pricingItems) {
        // Upsert based on composite key logic if possible, or just create if not exists
        // Since we don't have a unique constraint on (category, level, subject) easy to use here without ID,
        // we'll check first.
        const existing = await prisma.pricing.findFirst({
            where: {
                level: item.level,
                subject: item.subject,
                category: item.category
            }
        });

        if (!existing) {
            await prisma.pricing.create({
                data: {
                    ...item,
                    active: true
                }
            });
            console.log(`Created pricing: ${item.level} - ${item.subject}`);
        } else {
            console.log(`Pricing already exists: ${item.level} - ${item.subject}`);
        }
    }

    console.log('\n✅ Database seed completed!');

    // Create sample teachers
    console.log('\n👨‍🏫 Creating sample teachers...');
    const hashedTeacherPassword = await bcrypt.hash('teacher123', 10);

    const teachers = [
        {
            name: 'Ahmed Bennani',
            email: 'ahmed.teacher@enovazone.com',
            phone: '+212600000001',
            specialties: ['Maths', 'Français'],
            levels: ['Primaire'],
            hourlyRate: 50,
            password: hashedTeacherPassword,
        },
        {
            name: 'Fatima Alaoui',
            email: 'fatima.teacher@enovazone.com',
            phone: '+212600000002',
            specialties: ['Maths', 'Physique et Chimique', 'S.V.T'],
            levels: ['Lycée', 'Collège'],
            hourlyRate: 70,
            password: hashedTeacherPassword,
        },
    ];

    const createdTeachers = [];
    for (const teacherData of teachers) {
        const teacher = await prisma.teacher.create({
            data: teacherData,
        });
        createdTeachers.push(teacher);
        console.log(`✅ Created teacher: ${teacher.name} (${teacher.email})`);
    }

    // Create sample students
    console.log('\n👨‍🎓 Creating sample students...');
    const students = [
        {
            name: 'Youssef',
            surname: 'Tazi',
            phone: '+212600000003',
            email: 'youssef.tazi@email.com',
            schoolLevel: 'Primaire',
            currentSchool: 'École Primaire Ibn Khaldoun',
        },
        {
            name: 'Sara',
            surname: 'El Amrani',
            phone: '+212600000004',
            email: 'sara.amrani@email.com',
            schoolLevel: 'Lycée',
            currentSchool: 'Lycée Mohammed V',
        },
        {
            name: 'Omar',
            surname: 'Benhaddou',
            phone: '+212600000005',
            email: 'omar.benhaddou@email.com',
            schoolLevel: 'Collège',
            currentSchool: 'Collège Ibn Sina',
        },
    ];

    const createdStudents = [];
    for (const studentData of students) {
        const student = await prisma.student.create({
            data: studentData,
        });
        createdStudents.push(student);
        console.log(`✅ Created student: ${student.name} ${student.surname} (${student.schoolLevel})`);
    }

    // Create sample rooms
    console.log('\n🏫 Creating sample rooms...');
    const rooms = [
        { name: 'Salle 101', capacity: 20 },
        { name: 'Salle 102', capacity: 25 },
        { name: 'Salle 103', capacity: 15 },
    ];

    const createdRooms = [];
    for (const roomData of rooms) {
        const room = await prisma.room.create({
            data: roomData,
        });
        createdRooms.push(room);
        console.log(`✅ Created room: ${room.name}`);
    }

    // Create sample courses
    console.log('\n📚 Creating sample courses...');
    const courses = [
        {
            name: 'Mathématiques Primaire',
            teacherId: createdTeachers[0].id, // Ahmed Bennani
        },
        {
            name: 'Mathématiques Lycée',
            teacherId: createdTeachers[1].id, // Fatima Alaoui
        },
        {
            name: 'Physique-Chimie Collège',
            teacherId: createdTeachers[1].id, // Fatima Alaoui
        },
    ];

    const createdCourses = [];
    for (const courseData of courses) {
        const course = await prisma.course.create({
            data: courseData,
        });
        createdCourses.push(course);
        console.log(`✅ Created course: ${course.name}`);
    }

    // Create sample groups
    console.log('\n👥 Creating sample groups...');
    const groups = [
        {
            name: 'Groupe Maths Primaire A',
            level: 'Primaire',
            subject: 'Maths',
            teacherId: createdTeachers[0].id,
            courseId: createdCourses[0].id,
            room: 'Salle 101',
            timeSlots: [
                { day: 'Lundi', startTime: '14:00', endTime: '15:30' },
                { day: 'Mercredi', startTime: '14:00', endTime: '15:30' },
            ],
        },
        {
            name: 'Groupe Maths Lycée B',
            level: 'Lycée',
            subject: 'Maths',
            teacherId: createdTeachers[1].id,
            courseId: createdCourses[1].id,
            room: 'Salle 102',
            timeSlots: [
                { day: 'Mardi', startTime: '16:00', endTime: '17:30' },
                { day: 'Jeudi', startTime: '16:00', endTime: '17:30' },
            ],
        },
        {
            name: 'Groupe Physique Collège C',
            level: 'Collège',
            subject: 'Physique et Chimique',
            teacherId: createdTeachers[1].id,
            courseId: createdCourses[2].id,
            room: 'Salle 103',
            timeSlots: [
                { day: 'Lundi', startTime: '17:00', endTime: '18:30' },
                { day: 'Vendredi', startTime: '17:00', endTime: '18:30' },
            ],
        },
    ];

    const createdGroups = [];
    for (const groupData of groups) {
        const group = await prisma.group.create({
            data: groupData,
        });
        createdGroups.push(group);
        console.log(`✅ Created group: ${group.name}`);
    }

    // Link students to groups
    console.log('\n🔗 Linking students to groups...');
    await prisma.student.update({
        where: { id: createdStudents[0].id }, // Youssef - Primaire
        data: {
            groups: {
                connect: { id: createdGroups[0].id }, // Groupe Maths Primaire
            },
        },
    });

    await prisma.student.update({
        where: { id: createdStudents[1].id }, // Sara - Lycée
        data: {
            groups: {
                connect: { id: createdGroups[1].id }, // Groupe Maths Lycée
            },
        },
    });

    await prisma.student.update({
        where: { id: createdStudents[2].id }, // Omar - Collège
        data: {
            groups: {
                connect: { id: createdGroups[2].id }, // Groupe Physique Collège
            },
        },
    });

    console.log('✅ Students linked to groups');

    // Create sample sessions
    console.log('\n📅 Creating sample sessions...');
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sessions = [
        {
            date: nextWeek,
            startTime: '14:00',
            endTime: '15:30',
            groupId: createdGroups[0].id,
            teacherId: createdTeachers[0].id,
            roomId: createdRooms[0].id,
        },
        {
            date: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000), // Next day
            startTime: '16:00',
            endTime: '17:30',
            groupId: createdGroups[1].id,
            teacherId: createdTeachers[1].id,
            roomId: createdRooms[1].id,
        },
        {
            date: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after
            startTime: '17:00',
            endTime: '18:30',
            groupId: createdGroups[2].id,
            teacherId: createdTeachers[1].id,
            roomId: createdRooms[2].id,
        },
    ];

    for (const sessionData of sessions) {
        const session = await prisma.session.create({
            data: sessionData,
        });
        console.log(`✅ Created session for ${session.date.toDateString()} ${session.startTime}-${session.endTime}`);
    }

    console.log('\n🎓 Teacher Dashboard Seed Data Completed!');
    console.log('\n🔐 TEACHER LOGIN CREDENTIALS:');
    console.log('Email: ahmed.teacher@enovazone.com');
    console.log('Email: fatima.teacher@enovazone.com');
    console.log('Password: teacher123');
    console.log('\n📊 Sample Data Summary:');
    console.log(`- ${createdTeachers.length} Teachers`);
    console.log(`- ${createdStudents.length} Students`);
    console.log(`- ${createdGroups.length} Groups`);
    console.log(`- ${createdRooms.length} Rooms`);
    console.log(`- ${createdCourses.length} Courses`);
    console.log(`- ${sessions.length} Sessions`);
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
