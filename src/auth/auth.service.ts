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

    if (user) {
        role = user.role;
        id = user.id;
        name = user.name;
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
        } else {
            throw new Error('Invalid email or password');
        }
    }

    if (!user && role !== 'TEACHER') {
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
        type: role === 'TEACHER' ? 'teacher' : 'user',
    });

    return {
        token,
        user: {
            id,
            email,
            name,
            role,
            type: role === 'TEACHER' ? 'teacher' : 'user',
        },
    };
};
