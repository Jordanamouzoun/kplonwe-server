import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import * as authController from './auth.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.get('/profile', authenticate, authController.getMe); // Alias pour /me
router.put('/accept-terms', authenticate, authController.acceptTerms);

export default router;