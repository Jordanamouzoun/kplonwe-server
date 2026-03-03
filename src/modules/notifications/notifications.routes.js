import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './notifications.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/:notificationId/read', markNotificationAsRead);
router.put('/read-all', markAllNotificationsAsRead);

export default router;
