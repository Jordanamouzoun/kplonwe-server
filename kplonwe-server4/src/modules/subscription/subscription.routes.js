import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as subscriptionController from './subscription.controller.js';

const router = express.Router();

// Toutes les routes nécessitent authentification
router.use(authenticate);

// Souscrire
router.post('/premium', requireRole('TEACHER'), subscriptionController.subscribePremium);
router.post('/school', requireRole('SCHOOL'), subscriptionController.subscribeSchool);

// Consulter ses abonnements
router.get('/my', subscriptionController.getMySubscriptions);
router.get('/active/:type', subscriptionController.checkActiveSubscription);

// Annuler
router.put('/:id/cancel', subscriptionController.cancelSubscription);

export default router;
