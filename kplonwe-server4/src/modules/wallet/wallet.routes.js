import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import * as walletController from './wallet.controller.js';

const router = express.Router();

router.use(authenticate); // Toutes les routes wallet sont protégées

router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);
router.get('/balance', walletController.getBalance);

export default router;
