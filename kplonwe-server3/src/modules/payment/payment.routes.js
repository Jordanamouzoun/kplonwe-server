import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import * as paymentController from './payment.controller.js';

const router = express.Router();

// Recharge wallet
router.post('/recharge', authenticate, paymentController.rechargeWallet);

// Paiements
router.post('/transfer', authenticate, paymentController.transferMoney);
router.post('/pay-teacher', authenticate, paymentController.payTeacher);

// Webhooks (publics - pas d'authentification)
router.post('/webhook/momo', paymentController.momoWebhook);
router.post('/webhook/moov', paymentController.moovWebhook);
router.post('/webhook/stripe', paymentController.stripeWebhook);

// Status
router.get('/transaction/:reference', authenticate, paymentController.getTransactionStatus);

export default router;
