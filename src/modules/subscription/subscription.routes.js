import express from 'express';
import { 
  subscribePremium, 
  subscribeSchool, 
  getMySubscriptions, 
  checkActiveSubscription, 
  cancelSubscription 
} from './subscription.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/premium', subscribePremium);
router.post('/school', subscribeSchool);
router.get('/my-subscriptions', getMySubscriptions);
router.get('/active-check/:type', checkActiveSubscription);
router.put('/:id/cancel', cancelSubscription);

export default router;
