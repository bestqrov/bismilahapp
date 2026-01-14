import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';
import * as teacherService from './teacher.service';

export const getDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const [groups, courses, sessions, notifications, attendanceStats, studentStats] = await Promise.all([
            teacherService.getTeacherGroups(teacherId),
            teacherService.getTeacherCourses(teacherId),
            teacherService.getTeacherSessions(teacherId),
            teacherService.getNotifications(teacherId),
            teacherService.getAttendanceStats(teacherId),
            teacherService.getStudentAttendanceStats(teacherId),
        ]);

        // Calculate additional statistics
        const totalStudents = new Set(
            groups.flatMap(group => group.students.map(student => student.id))
        ).size;

        const todaySessions = sessions.filter(session => {
            const sessionDate = new Date(session.date);
            const today = new Date();
            return sessionDate.toDateString() === today.toDateString();
        });

        const recentActivities = await teacherService.getRecentActivities(teacherId);

        sendSuccess(res, {
            groups,
            courses,
            sessions,
            notifications,
            stats: {
                totalStudents,
                totalGroups: groups.length,
                totalSessions: sessions.length,
                todaySessions: todaySessions.length,
                attendanceRate: attendanceStats.averageAttendance,
                totalNotifications: notifications.length,
            },
            attendanceStats,
            studentStats,
            recentActivities,
        }, 'Dashboard data retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to get dashboard', 500);
    }
};

export const getGroups = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const groups = await teacherService.getTeacherGroups(teacherId);
        sendSuccess(res, groups, 'Groups retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to get groups', 500);
    }
};

export const getCourses = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const courses = await teacherService.getTeacherCourses(teacherId);
        sendSuccess(res, courses, 'Courses retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to get courses', 500);
    }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const courseData = { ...req.body, teacherId };
        const course = await teacherService.createCourse(courseData);
        sendSuccess(res, course, 'Course created', 201);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to create course', 400);
    }
};

export const getSessions = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const sessions = await teacherService.getTeacherSessions(teacherId);
        sendSuccess(res, sessions, 'Sessions retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to get sessions', 500);
    }
};

export const createSessionHandler = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const sessionData = { ...req.body, teacherId };
        const session = await teacherService.createSession(sessionData);
        sendSuccess(res, session, 'Session created', 201);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to create session', 400);
    }
};

export const markAttendanceHandler = async (req: AuthRequest, res: Response) => {
    try {
        const { sessionId, attendances } = req.body;
        await teacherService.markAttendance(sessionId, attendances);
        sendSuccess(res, 'Attendance marked');
    } catch (error: any) {
        sendError(res, error.message, 'Failed to mark attendance', 500);
    }
};

export const getAttendanceStats = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const stats = await teacherService.getAttendanceStats(teacherId);
        sendSuccess(res, stats, 'Attendance stats retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to get attendance stats', 500);
    }
};

export const getStudentAttendanceStats = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const stats = await teacherService.getStudentAttendanceStats(teacherId);
        sendSuccess(res, stats, 'Student attendance stats retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to get student attendance stats', 500);
    }
};

export const getSessionAttendanceStats = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const stats = await teacherService.getSessionAttendanceStats(teacherId);
        sendSuccess(res, stats, 'Session attendance stats retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to get session attendance stats', 500);
    }
};

export const getNotificationsHandler = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const notifications = await teacherService.getNotifications(teacherId);
        sendSuccess(res, notifications, 'Notifications retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to get notifications', 500);
    }
};

export const sendNotificationHandler = async (req: AuthRequest, res: Response) => {
    try {
        const teacherId = req.user!.id;
        const notificationData = { ...req.body, senderId: teacherId };
        const notification = await teacherService.sendNotification(notificationData);
        sendSuccess(res, notification, 'Notification sent', 201);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to send notification', 500);
    }
};

export const getRooms = async (req: AuthRequest, res: Response) => {
    try {
        const { date, startTime, endTime } = req.query;
        const rooms = await teacherService.getAvailableRooms(date as string, startTime as string, endTime as string);
        sendSuccess(res, rooms, 'Rooms retrieved', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to get rooms', 500);
    }
};