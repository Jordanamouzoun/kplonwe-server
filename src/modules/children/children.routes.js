import express from 'express';
import { createChild, getChildren, deleteChild } from './children.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', requireRole('PARENT'), createChild);
router.get('/', requireRole('PARENT'), getChildren);
router.delete('/:childId', requireRole('PARENT'), deleteChild);

export default router;
