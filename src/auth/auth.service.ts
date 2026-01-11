import prisma from '../config/database';
import { comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';

interface LoginData {
    email: string;
    password: string;
}

export const loginUser = async (data: LoginData) => {
    const { email, password } = data;

    // Find user by email (case-insensitive)
    let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    let role = '';
    let id = 0;
    let name = '';
    let type = '';

    if (user) {
        role = user.role;
        id = user.id;
        name = user.name;
        type = 'user';
    } else {
        // Check teacher
        const teacher = await prisma.teacher.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (teacher && teacher.password) {
            // Verify password
            const isPasswordValid = await comparePassword(password, teacher.password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }
            role = 'TEACHER';
            id = teacher.id;
            name = teacher.name;
            type = 'teacher';
        } else {
            // Check student
            const student = await prisma.student.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (student && student.password) {
                // Verify password
                const isPasswordValid = await comparePassword(password, student.password);
                if (!isPasswordValid) {
                    throw new Error('Invalid email or password');
                }
                role = 'STUDENT';
                id = student.id;
                name = `${student.name} ${student.surname}`;
                type = 'student';
            } else {
                // Check parent
                const parent = await prisma.parent.findUnique({
                    where: { email: email.toLowerCase() },
                });
                if (parent && parent.password) {
                    // Verify password
                    const isPasswordValid = await comparePassword(password, parent.password);
                    if (!isPasswordValid) {
                        throw new Error('Invalid email or password');
                    }
                    role = 'PARENT';
                    id = parent.id;
                    name = `${parent.name} ${parent.surname || ''}`.trim();
                    type = 'parent';
                } else {
                    throw new Error('Invalid email or password');
                }
            }
        }
    }

    if (!user && role !== 'TEACHER' && role !== 'STUDENT' && role !== 'PARENT') {
        throw new Error('Invalid email or password');
    }

    // For user, verify password
    if (user) {
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
    }

    // Generate JWT token
    const token = generateToken({
        id,
        email,
        role,
        name,
        type,
    });

    return {
        token,
        user: {
            id,
            email,
            name,
            role,
            type,
        },
    };
};
