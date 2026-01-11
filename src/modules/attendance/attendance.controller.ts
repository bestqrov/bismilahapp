import { Request, Response } from 'express';
import {
    createAttendance,
    getAttendanceByStudent,
    markAttendanceByQR,
} from './attendance.service';
import { sendSuccess, sendError } from '../../utils/response';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId, sessionId, status } = req.body;

        // Validate required fields
        if (!studentId || !sessionId || !status) {
            sendError(
                res,
                'StudentId, sessionId, and status are required',
                'Validation error',
                400
            );
            return;
        }

        if (!['present', 'absent'].includes(status)) {
            sendError(
                res,
                'Invalid status',
                'Status must be "present" or "absent"',
                400
            );
            return;
        }

        const attendance = await createAttendance({
            studentId: parseInt(studentId),
            sessionId: parseInt(sessionId),
            status,
        });

        sendSuccess(res, attendance, 'Attendance created successfully', 201);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to create attendance', 400);
    }
};

export const getByStudent = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const attendances = await getAttendanceByStudent(id);
        sendSuccess(res, attendances, 'Attendance retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve attendance', 404);
    }
};

export const markAttendanceByQR = async (req: Request, res: Response): Promise<void> => {
    try {
        const { qrData, sessionId } = req.body;

        // Validate required fields
        if (!qrData || !sessionId) {
            sendError(
                res,
                'qrData and sessionId are required',
                'Validation error',
                400
            );
            return;
        }

        const attendance = await markAttendanceByQR({
            qrData,
            sessionId: parseInt(sessionId),
        });

        sendSuccess(res, attendance, 'Attendance marked successfully via QR', 201);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to mark attendance via QR', 400);
    }
};
