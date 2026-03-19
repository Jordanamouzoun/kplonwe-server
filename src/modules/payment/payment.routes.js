import express from 'express';
import { 
  rechargeWallet, 
  transferMoney, 
  payTeacher, 
  momoWebhook, 
  moovWebhook, 
  stripeWebhook, 
  getTransactionStatus 
} from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Webhooks (pas d'auth car appelés par les prestataires)
router.post('/webhooks/momo', momoWebhook);
router.post('/webhooks/moov', moovWebhook);
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

// Routes protégées
router.use(authenticate);

router.post('/recharge', rechargeWallet);
router.post('/transfer', transferMoney);
router.post('/pay-teacher', payTeacher);
router.get('/status/:reference', getTransactionStatus);

export default router;
