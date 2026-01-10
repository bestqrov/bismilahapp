import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import * as teacherController from './teacher.controller';

const router = Router();

// All teacher routes require authentication and TEACHER role
router.use(authMiddleware);
router.use(roleMiddleware('TEACHER'));

router.get('/dashboard', teacherController.getDashboard);
router.get('/groups', teacherController.getGroups);
router.get('/courses', teacherController.getCourses);
router.get('/sessions', teacherController.getSessions);
router.post('/sessions', teacherController.createSessionHandler);
router.post('/attendance', teacherController.markAttendanceHandler);
router.get('/attendance/stats', teacherController.getAttendanceStats);
router.get('/attendance/students', teacherController.getStudentAttendanceStats);
router.get('/attendance/sessions', teacherController.getSessionAttendanceStats);
router.get('/notifications', teacherController.getNotificationsHandler);
router.post('/notifications', teacherController.sendNotificationHandler);
router.get('/rooms', teacherController.getRooms);

export default router;