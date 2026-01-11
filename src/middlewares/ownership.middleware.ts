import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { sendError } from '../utils/response';

export const ownershipMiddleware = (paramName: string = 'id') => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            sendError(res, 'User not authenticated', 'Access denied', 401);
            return;
        }

        const userId = req.user.id;
        const resourceId = parseInt(req.params[paramName]);

        // For students and parents, they can only access their own data
        if ((req.user.role === 'STUDENT' || req.user.role === 'PARENT') && userId !== resourceId) {
            sendError(res, 'Access denied', 'You can only access your own data', 403);
            return;
        }

        next();
    };
};