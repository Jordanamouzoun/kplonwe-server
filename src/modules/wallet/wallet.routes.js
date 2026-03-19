import express from 'express';
import { getWallet, getTransactions, getBalance } from './wallet.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getWallet);
router.get('/transactions', getTransactions);
router.get('/balance', getBalance);

export default router;
