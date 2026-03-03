import express from 'express';
import {
  createOrGetConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
} from './messaging.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

// Conversations
router.post('/conversations', createOrGetConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getMessages);

// Messages
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/read', markAsRead);

export default router;
