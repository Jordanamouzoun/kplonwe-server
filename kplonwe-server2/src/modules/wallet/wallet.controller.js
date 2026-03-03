import { asyncHandler } from '../../middlewares/error.middleware.js';
import * as walletService from './wallet.service.js';

export const getWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWalletByUserId(req.user.id);
  res.json({ success: true, data: wallet });
});

export const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const transactions = await walletService.getWalletTransactions(req.user.id, parseInt(page), parseInt(limit));
  res.json({ success: true, data: transactions });
});

export const getBalance = asyncHandler(async (req, res) => {
  const balance = await walletService.getWalletBalance(req.user.id);
  res.json({ success: true, data: { balance } });
});
