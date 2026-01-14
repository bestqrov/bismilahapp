import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentAnalytics,
    getStudentDashboard,
    getStudentSchedule,
    getStudentAssignments,
    getStudentNotifications,
    getStudentPayments,
    getStudentLoginInfo,
    updateStudentPassword,
    getStudentProfile,
} from './students.service';
import { sendSuccess, sendError } from '../../utils/response';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            name, surname, phone, email, cin, address, birthDate,
            birthPlace, fatherName, motherName, schoolLevel, currentSchool, subjects, photo,
            parentName, parentPhone, parentRelation
        } = req.body;

        // Validate required fields
        if (!name || !surname) {
            sendError(res, 'Name and surname are required', 'Validation error', 400);
            return;
        }

        const studentData: any = { name, surname };
        if (phone) studentData.phone = phone;
        if (email) studentData.email = email;
        if (cin) studentData.cin = cin;
        if (address) studentData.address = address;
        if (birthDate) studentData.birthDate = new Date(birthDate);
        if (birthPlace) studentData.birthPlace = birthPlace;
        if (fatherName) studentData.fatherName = fatherName;
        if (motherName) studentData.motherName = motherName;
        if (schoolLevel) studentData.schoolLevel = schoolLevel;
        if (currentSchool) studentData.currentSchool = currentSchool;
        if (subjects) studentData.subjects = subjects;
        if (photo) studentData.photo = photo;
        if (req.body.inscriptionFee) studentData.inscriptionFee = req.body.inscriptionFee;
        if (req.body.amountPaid) studentData.amountPaid = req.body.amountPaid;
        if (parentName) studentData.parentName = parentName;
        if (parentPhone) studentData.parentPhone = parentPhone;
        if (parentRelation) studentData.parentRelation = parentRelation;

        const student = await createStudent(studentData);

        sendSuccess(res, student, 'Student created successfully', 201);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to create student', 400);
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const students = await getAllStudents();
        sendSuccess(res, students, 'Students retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve students', 500);
    }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const student = await getStudentById(parseInt(id));
        sendSuccess(res, student, 'Student retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve student', 404);
    }
};

export const update = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name, surname, phone, email, cin, address, birthDate,
            birthPlace, fatherName, motherName, schoolLevel, currentSchool, subjects, photo,
            parentName, parentPhone, parentRelation
        } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (surname) updateData.surname = surname;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (cin !== undefined) updateData.cin = cin;
        if (address !== undefined) updateData.address = address;
        if (birthDate) updateData.birthDate = new Date(birthDate);
        if (birthPlace !== undefined) updateData.birthPlace = birthPlace;
        if (fatherName !== undefined) updateData.fatherName = fatherName;
        if (motherName !== undefined) updateData.motherName = motherName;
        if (schoolLevel !== undefined) updateData.schoolLevel = schoolLevel;
        if (currentSchool !== undefined) updateData.currentSchool = currentSchool;
        if (subjects !== undefined) updateData.subjects = subjects;
        if (photo !== undefined) updateData.photo = photo;
        if (parentName !== undefined) updateData.parentName = parentName;
        if (parentPhone !== undefined) updateData.parentPhone = parentPhone;
        if (parentRelation !== undefined) updateData.parentRelation = parentRelation;

        const student = await updateStudent(id, updateData);

        sendSuccess(res, student, 'Student updated successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to update student', 400);
    }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await deleteStudent(id);
        sendSuccess(res, result, 'Étudiant supprimé avec succès', 200);
    } catch (error: any) {
        console.error('Delete student error:', error.message);
        // Return appropriate status code based on error type
        const statusCode = error.message.includes('Cannot delete') ? 400 :
                          error.message.includes('not found') ? 404 : 500;
        sendError(res, error.message, 'Erreur lors de la suppression de l\'étudiant', statusCode);
    }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const analytics = await getStudentAnalytics();
        sendSuccess(res, analytics, 'Analytics retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve analytics', 500);
    }
};

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const dashboard = await getStudentDashboard(id);
        sendSuccess(res, dashboard, 'Dashboard retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve dashboard', 500);
    }
};

export const getSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const schedule = await getStudentSchedule(id);
        sendSuccess(res, schedule, 'Schedule retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve schedule', 500);
    }
};

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const assignments = await getStudentAssignments(id);
        sendSuccess(res, assignments, 'Assignments retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve assignments', 500);
    }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const notifications = await getStudentNotifications(id);
        sendSuccess(res, notifications, 'Notifications retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve notifications', 500);
    }
};

export const getPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const payments = await getStudentPayments(id);
        sendSuccess(res, payments, 'Payments retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve payments', 500);
    }
};

export const getLoginInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const loginInfo = await getStudentLoginInfo(id);
        sendSuccess(res, loginInfo, 'Login info retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve login info', 500);
    }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Get student ID from authenticated user
        const studentId = req.user?.id;
        if (!studentId) {
            sendError(res, 'User not authenticated', 'Authentication error', 401);
            return;
        }

        const student = await getStudentProfile(studentId.toString());
        sendSuccess(res, student, 'Profile retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve profile', 500);
    }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            sendError(res, 'New password is required', 'Validation error', 400);
            return;
        }

        const updatedInfo = await updateStudentPassword(id, newPassword);
        sendSuccess(res, updatedInfo, 'Password updated successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to update password', 500);
    }
};
