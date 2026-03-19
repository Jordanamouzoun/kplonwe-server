import express from 'express';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './notifications.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/:notificationId/read', authenticate, markNotificationAsRead);
router.put('/read-all', authenticate, markAllNotificationsAsRead);

export default router;
