import { Router } from 'express';
import { getDashboard, getChildren, getChildrenSchedules, getChildrenGrades, getNotifications, getPayments, create, getLoginInfo, updatePassword } from './parents.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { ownershipMiddleware } from '../../middlewares/ownership.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Admin/Secretary routes
const adminRouter = Router();
adminRouter.use(roleMiddleware('ADMIN', 'SECRETARY'));
adminRouter.post('/', create);
adminRouter.get('/:id/login-info', getLoginInfo);
adminRouter.put('/:id/password', updatePassword);

// Parent routes
const parentRouter = Router();
parentRouter.use(roleMiddleware('PARENT'));
parentRouter.use(ownershipMiddleware());
parentRouter.get('/:id/dashboard', getDashboard);
parentRouter.get('/:id/children', getChildren);
parentRouter.get('/:id/children/schedules', getChildrenSchedules);
parentRouter.get('/:id/children/grades', getChildrenGrades);
parentRouter.get('/:id/notifications', getNotifications);
parentRouter.get('/:id/payments', getPayments);

router.use('/', adminRouter);
router.use('/', parentRouter);

export default router;