import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middlewares/error.middleware.js';
import * as momoProvider from './providers/momo.provider.js';
import * as moovProvider from './providers/moov.provider.js';
import * as stripeProvider from './providers/stripe.provider.js';
import logger from '../../utils/logger.js';

const prisma = new PrismaClient();

// Configuration
const COMMISSION_RATE = parseFloat(process.env.PLATFORM_COMMISSION_RATE) || 0.02;
const PLATFORM_WALLET_USER_ID = process.env.PLATFORM_WALLET_ID;

/**
 * ==========================================
 * RECHARGE WALLET
 * ==========================================
 */

export const initiateRecharge = async (userId, amount, method) => {
  // Validation montant (JAMAIS faire confiance au frontend)
  if (!amount || amount <= 0 || amount > 10000000) {
    throw new AppError('Montant invalide (0-10,000,000 FCFA)', 400);
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError('Wallet introuvable', 404);
  
  if (wallet.isLocked) {
    throw new AppError('Wallet verrouillé - contactez le support', 403);
  }

  const reference = `RECH-${uuidv4()}`;
  
  // Vérifier qu'on n'a pas déjà une transaction avec cette référence (paranoïa)
  const existing = await prisma.transaction.findUnique({ where: { reference } });
  if (existing) {
    throw new AppError('Référence en conflit - réessayez', 409);
  }
  
  // Créer transaction PENDING
  const transaction = await prisma.transaction.create({
    data: {
      reference,
      type: 'RECHARGE',
      amount,
      status: 'PENDING',
      toWalletId: wallet.id,
      paymentMethod: method,
      metadata: JSON.stringify({ userId, method }),
      isLocked: false // Pas encore verrouillé
    }
  });

  let paymentResponse;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // Initier le paiement selon la méthode
  try {
    switch (method) {
      case 'MOMO':
        if (!user.phone) throw new AppError('Numéro de téléphone requis', 400);
        paymentResponse = await momoProvider.initiateMomoPayment(amount, user.phone, reference);
        break;
        
      case 'MOOV':
        if (!user.phone) throw new AppError('Numéro de téléphone requis', 400);
        paymentResponse = await moovProvider.initiateMoovPayment(amount, user.phone, reference);
        break;
        
      case 'CARD_STRIPE':
        paymentResponse = await stripeProvider.createStripePaymentIntent(amount, { 
          userId, 
          reference,
          type: 'recharge' 
        });
        break;
        
      default:
        throw new AppError('Méthode de paiement non supportée', 400);
    }
  } catch (error) {
    // Marquer transaction comme FAILED
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FAILED', isLocked: true }
    });
    throw error;
  }

  if (!paymentResponse.success) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { 
        status: 'FAILED', 
        providerResponse: JSON.stringify(paymentResponse.error),
        isLocked: true
      }
    });
    throw new AppError('Échec initiation paiement', 500);
  }

  // Mettre à jour avec la référence provider
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { 
      providerRef: paymentResponse.data?.id || paymentResponse.id,
      providerResponse: JSON.stringify(paymentResponse)
    }
  });

  logger.info(`💳 Recharge initiée: ${reference} - ${amount} XOF - ${method}`);

  return {
    reference,
    amount,
    method,
    clientSecret: paymentResponse.clientSecret, // Pour Stripe
    status: 'PENDING'
  };
};

/**
 * ==========================================
 * WEBHOOKS SÉCURISÉS
 * ==========================================
 */

export const handleMomoWebhook = async (payload, headers) => {
  const signature = headers['x-momo-signature'];
  
  // CRITIQUE: Vérifier signature
  if (!momoProvider.verifyMomoWebhook(payload, signature)) {
    logger.error('🚨 Tentative webhook MoMo avec signature invalide');
    throw new AppError('Signature invalide', 401);
  }

  const webhookData = momoProvider.parseMomoWebhook(payload);
  const { reference, status } = webhookData;

  logger.info(`📥 Webhook MoMo: ${reference} - ${status}`);

  // Récupérer la transaction
  const transaction = await prisma.transaction.findUnique({ where: { reference } });

  if (!transaction) {
    logger.error(`Transaction ${reference} introuvable`);
    throw new AppError('Transaction introuvable', 404);
  }

  // CRITIQUE: Idempotence - Si déjà traitée, ignorer
  if (transaction.isLocked) {
    logger.warn(`Transaction ${reference} déjà traitée - idempotence OK`);
    return { success: true, message: 'Déjà traité' };
  }

  // Vérifier que la transaction était bien PENDING
  if (transaction.status !== 'PENDING') {
    logger.warn(`Transaction ${reference} n'était pas PENDING (${transaction.status})`);
    return { success: true, message: 'Statut incorrect' };
  }

  if (status === 'SUCCESSFUL') {
    await completeRecharge(transaction, webhookData);
  } else {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { 
        status: 'FAILED', 
        providerResponse: JSON.stringify(webhookData),
        isLocked: true 
      }
    });
    logger.info(`❌ Recharge échouée: ${reference}`);
  }

  return { success: true };
};

export const handleMoovWebhook = async (payload, headers) => {
  const signature = headers['x-moov-signature'];
  
  // CRITIQUE: Vérifier signature
  if (!moovProvider.verifyMoovWebhook(payload, signature)) {
    logger.error('🚨 Tentative webhook Moov avec signature invalide');
    throw new AppError('Signature invalide', 401);
  }

  const webhookData = moovProvider.parseMoovWebhook(payload);
  const { reference, status } = webhookData;

  logger.info(`📥 Webhook Moov: ${reference} - ${status}`);

  const transaction = await prisma.transaction.findUnique({ where: { reference } });
  if (!transaction || transaction.isLocked) {
    return { success: true, message: 'Déjà traité ou introuvable' };
  }

  if (transaction.status !== 'PENDING') {
    return { success: true, message: 'Statut incorrect' };
  }

  if (status === 'SUCCESS') {
    await completeRecharge(transaction, webhookData);
  } else {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FAILED', providerResponse: JSON.stringify(webhookData), isLocked: true }
    });
  }

  return { success: true };
};

export const handleStripeWebhook = async (rawBody, signature) => {
  // CRITIQUE: Vérifier signature Stripe
  const verification = stripeProvider.verifyStripeWebhook(rawBody, signature);
  
  if (!verification.success) {
    logger.error('🚨 Tentative webhook Stripe avec signature invalide');
    throw new AppError('Signature invalide', 401);
  }

  const event = verification.event;
  
  logger.info(`📥 Webhook Stripe: ${event.type}`);

  // On ne traite QUE payment_intent.succeeded
  if (event.type !== 'payment_intent.succeeded') {
    logger.info(`Événement Stripe ${event.type} ignoré`);
    return { success: true, message: 'Event ignoré' };
  }

  const webhookData = stripeProvider.parseStripeWebhook(event);
  const { reference } = webhookData;
  
  const transaction = await prisma.transaction.findUnique({ where: { reference } });
  if (!transaction || transaction.isLocked || transaction.status !== 'PENDING') {
    return { success: true, message: 'Déjà traité ou introuvable' };
  }

  await completeRecharge(transaction, webhookData);
  return { success: true };
};

/**
 * Compléter une recharge - TRANSACTION ATOMIQUE
 */
async function completeRecharge(transaction, webhookData) {
  logger.info(`✅ Complétion recharge: ${transaction.reference}`);

  // CRITIQUE: Transaction atomique Prisma
  // Soit TOUT réussit, soit RIEN
  await prisma.$transaction(async (tx) => {
    // 1. Créditer le wallet
    await tx.wallet.update({
      where: { id: transaction.toWalletId },
      data: { balance: { increment: transaction.amount } }
    });

    // 2. Marquer transaction COMPLETED et LOCKED
    await tx.transaction.update({
      where: { id: transaction.id },
      data: { 
        status: 'COMPLETED', 
        isLocked: true,
        providerResponse: JSON.stringify(webhookData)
      }
    });

    // 3. Créer notification
    const wallet = await tx.wallet.findUnique({ where: { id: transaction.toWalletId } });
    await tx.notification.create({
      data: {
        userId: wallet.userId,
        type: 'RECHARGE_SUCCESS',
        title: 'Recharge réussie',
        message: `Votre wallet a été crédité de ${transaction.amount} FCFA`
      }
    });
  });

  logger.info(`💰 Wallet crédité: ${transaction.amount} FCFA`);
}

/**
 * ==========================================
 * TRANSFERT ENTRE WALLETS
 * ==========================================
 */

export const transferBetweenWallets = async (fromUserId, toUserId, amount, description) => {
  // Validation montant (CRITIQUE)
  if (!amount || amount <= 0 || amount > 10000000) {
    throw new AppError('Montant invalide', 400);
  }

  if (fromUserId === toUserId) {
    throw new AppError('Impossible de transférer vers soi-même', 400);
  }

  const fromWallet = await prisma.wallet.findUnique({ where: { userId: fromUserId } });
  const toWallet = await prisma.wallet.findUnique({ where: { userId: toUserId } });

  if (!fromWallet || !toWallet) throw new AppError('Wallet introuvable', 404);
  if (fromWallet.isLocked) throw new AppError('Votre wallet est verrouillé', 403);
  if (toWallet.isLocked) throw new AppError('Wallet destinataire verrouillé', 403);
  
  // Vérifier solde AVANT transaction
  if (fromWallet.balance < amount) throw new AppError('Solde insuffisant', 400);

  const reference = `TRANS-${uuidv4()}`;

  // CRITIQUE: Transaction atomique
  const result = await prisma.$transaction(async (tx) => {
    // 1. Débiter
    await tx.wallet.update({
      where: { id: fromWallet.id },
      data: { balance: { decrement: amount } }
    });

    // 2. Créditer
    await tx.wallet.update({
      where: { id: toWallet.id },
      data: { balance: { increment: amount } }
    });

    // 3. Transaction
    const transaction = await tx.transaction.create({
      data: {
        reference,
        type: 'PAYMENT',
        amount,
        status: 'COMPLETED',
        fromWalletId: fromWallet.id,
        toWalletId: toWallet.id,
        paymentMethod: 'WALLET',
        description,
        isLocked: true
      }
    });

    return transaction;
  });

  logger.info(`💸 Transfert: ${amount} FCFA`);
  return result;
};

/**
 * ==========================================
 * PAIEMENT ENSEIGNANT (AVEC COMMISSION)
 * ==========================================
 */

export const payTeacherWithCommission = async (parentUserId, teacherId, amount, description) => {
  // Validation montant (CRITIQUE)
  if (!amount || amount <= 0 || amount > 10000000) {
    throw new AppError('Montant invalide', 400);
  }

  // Récupérer les wallets
  const parentWallet = await prisma.wallet.findUnique({ where: { userId: parentUserId } });
  const teacherProfile = await prisma.teacherProfile.findUnique({ 
    where: { id: teacherId },
    include: { user: { include: { wallet: true } } }
  });

  if (!parentWallet) throw new AppError('Wallet parent introuvable', 404);
  if (!teacherProfile) throw new AppError('Enseignant introuvable', 404);
  
  // CRITIQUE: Vérifier validation enseignant
  if (teacherProfile.validationStatus !== 'VERIFIED') {
    throw new AppError('Enseignant non validé', 403);
  }

  const teacherWallet = teacherProfile.user.wallet;
  if (!teacherWallet) throw new AppError('Wallet enseignant introuvable', 404);

  // Vérifier solde parent
  if (parentWallet.balance < amount) throw new AppError('Solde insuffisant', 400);

  // Vérifier que wallets non verrouillés
  if (parentWallet.isLocked || teacherWallet.isLocked) {
    throw new AppError('Wallet verrouillé', 403);
  }

  // Calculer commission
  const commission = Math.round(amount * COMMISSION_RATE);
  const teacherAmount = amount - commission;

  // CRITIQUE: Récupérer wallet plateforme
  if (!PLATFORM_WALLET_USER_ID) {
    throw new AppError('Wallet plateforme non configuré', 500);
  }

  const platformWallet = await prisma.wallet.findUnique({ 
    where: { userId: PLATFORM_WALLET_USER_ID } 
  });
  
  if (!platformWallet) {
    throw new AppError('Wallet plateforme introuvable', 500);
  }

  const reference = `PAY-${uuidv4()}`;

  logger.info(`💳 Paiement prof: ${amount} FCFA (prof: ${teacherAmount}, commission: ${commission})`);

  // CRITIQUE: Transaction atomique - TOUT ou RIEN
  const result = await prisma.$transaction(async (tx) => {
    // 1. Débiter parent (montant total)
    await tx.wallet.update({
      where: { id: parentWallet.id },
      data: { balance: { decrement: amount } }
    });

    // 2. Créditer enseignant (montant - commission)
    await tx.wallet.update({
      where: { id: teacherWallet.id },
      data: { balance: { increment: teacherAmount } }
    });

    // 3. Créditer plateforme (commission)
    await tx.wallet.update({
      where: { id: platformWallet.id },
      data: { balance: { increment: commission } }
    });

    // 4. Transaction principale (Parent → Enseignant)
    const mainTransaction = await tx.transaction.create({
      data: {
        reference,
        type: 'PAYMENT',
        amount,
        status: 'COMPLETED',
        fromWalletId: parentWallet.id,
        toWalletId: teacherWallet.id,
        paymentMethod: 'WALLET',
        description,
        isLocked: true,
        metadata: JSON.stringify({ 
          teacherId,
          commission,
          teacherAmount 
        })
      }
    });

    // 5. Transaction commission séparée (pour traçabilité)
    await tx.transaction.create({
      data: {
        reference: `COMM-${uuidv4()}`,
        type: 'COMMISSION',
        amount: commission,
        status: 'COMPLETED',
        fromWalletId: parentWallet.id,
        toWalletId: platformWallet.id,
        paymentMethod: 'WALLET',
        description: `Commission ${COMMISSION_RATE * 100}% sur ${reference}`,
        isLocked: true,
        metadata: JSON.stringify({ 
          parentTransactionRef: reference,
          rate: COMMISSION_RATE 
        })
      }
    });

    // 6. Mettre à jour stats enseignant
    await tx.teacherProfile.update({
      where: { id: teacherId },
      data: { totalEarnings: { increment: teacherAmount } }
    });

    // 7. Notifications
    await tx.notification.create({
      data: {
        userId: teacherProfile.userId,
        type: 'PAYMENT_RECEIVED',
        title: 'Paiement reçu',
        message: `Vous avez reçu ${teacherAmount} FCFA`
      }
    });

    await tx.notification.create({
      data: {
        userId: parentUserId,
        type: 'PAYMENT_SENT',
        title: 'Paiement effectué',
        message: `Paiement de ${amount} FCFA envoyé`
      }
    });

    return mainTransaction;
  });

  logger.info(`✅ Paiement prof complété: ${reference}`);
  return result;
};

/**
 * ==========================================
 * UTILITAIRES
 * ==========================================
 */

export const getTransactionByReference = async (reference) => {
  const transaction = await prisma.transaction.findUnique({ where: { reference } });
  if (!transaction) throw new AppError('Transaction introuvable', 404);
  return transaction;
};
