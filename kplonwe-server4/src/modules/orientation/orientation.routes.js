import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { getOrientation } from './orientation.controller.js';

const router = express.Router();
router.get('/:studentId', authenticate, getOrientation);
export default router;
