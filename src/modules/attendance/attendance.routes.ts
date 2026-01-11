import { Router } from 'express';
import { create, getByStudent, markAttendanceByQR } from './attendance.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Admin routes
router.post('/', roleMiddleware('ADMIN'), create);
router.get('/student/:id', roleMiddleware('ADMIN'), getByStudent);

// Teacher routes for QR attendance
router.post('/qr', roleMiddleware('TEACHER'), markAttendanceByQR);

export default router;
