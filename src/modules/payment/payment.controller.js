import { asyncHandler } from '../../middlewares/error.middleware.js';
import * as paymentService from './payment.service.js';

export const rechargeWallet = asyncHandler(async (req, res) => {
  const { amount, method } = req.body; // method: 'MOMO', 'MOOV', 'CARD_STRIPE'
  const result = await paymentService.initiateRecharge(req.user.id, amount, method);
  res.json({ success: true, data: result });
});

export const transferMoney = asyncHandler(async (req, res) => {
  const { toUserId, amount, description } = req.body;
  const result = await paymentService.transferBetweenWallets(req.user.id, toUserId, amount, description);
  res.json({ success: true, data: result });
});

export const payTeacher = asyncHandler(async (req, res) => {
  const { teacherId, amount, description } = req.body;
  const result = await paymentService.payTeacherWithCommission(req.user.id, teacherId, amount, description);
  res.json({ success: true, data: result });
});

export const momoWebhook = asyncHandler(async (req, res) => {
  await paymentService.handleMomoWebhook(req.body, req.headers);
  res.sendStatus(200);
});

export const moovWebhook = asyncHandler(async (req, res) => {
  await paymentService.handleMoovWebhook(req.body, req.headers);
  res.sendStatus(200);
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  await paymentService.handleStripeWebhook(req.rawBody, signature);
  res.sendStatus(200);
});

export const getTransactionStatus = asyncHandler(async (req, res) => {
  const transaction = await paymentService.getTransactionByReference(req.params.reference);
  res.json({ success: true, data: transaction });
});
