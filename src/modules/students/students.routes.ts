import { Router } from 'express';
import { create, getAll, getById, update, remove, getAnalytics, getDashboard, getSchedule, getAssignments, getNotifications, getPayments, getLoginInfo, updatePassword, getProfile } from './students.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { ownershipMiddleware } from '../../middlewares/ownership.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Admin/Secretary routes
const adminRouter = Router();
adminRouter.use(roleMiddleware('ADMIN', 'SECRETARY'));
adminRouter.get('/analytics', getAnalytics);
adminRouter.post('/', create);
adminRouter.get('/', getAll);
adminRouter.get('/:id', getById);
adminRouter.put('/:id', update);
adminRouter.delete('/:id', remove);
adminRouter.get('/:id/login-info', getLoginInfo);
adminRouter.put('/:id/password', updatePassword);

// Student routes
const studentRouter = Router();
studentRouter.use(roleMiddleware('STUDENT'));
studentRouter.get('/profile', getProfile); // Students can access their own profile
studentRouter.use(ownershipMiddleware()); // Ownership middleware for other routes
studentRouter.get('/:id/dashboard', getDashboard);
studentRouter.get('/:id/schedule', getSchedule);
studentRouter.get('/:id/assignments', getAssignments);
studentRouter.get('/:id/notifications', getNotifications);
studentRouter.get('/:id/payments', getPayments);

router.use('/', adminRouter);
router.use('/', studentRouter);

export default router;
