import { asyncHandler } from '../../middlewares/error.middleware.js';
import * as subscriptionService from './subscription.service.js';

export const subscribePremium = asyncHandler(async (req, res) => {
  const { teacherId } = req.body;
  const result = await subscriptionService.subscribeToPremium(req.user.id, teacherId);
  res.status(201).json({ 
    success: true, 
    message: 'Abonnement Premium activé',
    data: result 
  });
});

export const subscribeSchool = asyncHandler(async (req, res) => {
  const { schoolId } = req.body;
  const result = await subscriptionService.subscribeSchool(req.user.id, schoolId);
  res.status(201).json({ 
    success: true, 
    message: 'Abonnement École activé',
    data: result 
  });
});

export const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await subscriptionService.getUserSubscriptions(req.user.id);
  res.json({ success: true, data: subscriptions });
});

export const checkActiveSubscription = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const isActive = await subscriptionService.isSubscriptionActive(req.user.id, type);
  res.json({ success: true, data: { isActive } });
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.cancelSubscription(req.params.id, req.user.id);
  res.json({ success: true, message: result.message });
});
