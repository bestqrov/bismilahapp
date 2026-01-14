import { Request, Response } from 'express';
import { getStudentsForDocuments, getStudentDocument } from './documents.service';
import { sendSuccess, sendError } from '../../utils/response';

export const getSoutienStudentsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type } = req.query;
        const filters: { type?: string } = {};
        
        if (type && typeof type === 'string') {
            const upperType = type.toUpperCase();
            if (!['SOUTIEN', 'FORMATION'].includes(upperType)) {
                sendError(res, 'Invalid type parameter', 'Type must be SOUTIEN or FORMATION', 400);
                return;
            }
            filters.type = upperType;
        }
        
        const students = await getStudentsForDocuments(filters);
        sendSuccess(res, students, 'Students retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve students', 500);
    }
};

export const getStudentDocumentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const student = await getStudentDocument(id);
        sendSuccess(res, student, 'Student document data retrieved successfully', 200);
    } catch (error: any) {
        sendError(res, error.message, 'Failed to retrieve student document data', 404);
    }
};
