import prisma from '../../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middlewares/error.middleware.js';
import logger from '../../utils/logger.js';


// Prix des abonnements (en FCFA)
const SUBSCRIPTION_PRICES = {
  TEACHER_PREMIUM: parseInt(process.env.TEACHER_PREMIUM_PRICE) || 5000,
  SCHOOL_QUIZ: parseInt(process.env.SCHOOL_SUBSCRIPTION_PRICE) || 5000
};

// Durée des abonnements (en jours)
const SUBSCRIPTION_DURATION_DAYS = 30;

const PLATFORM_WALLET_USER_ID = process.env.PLATFORM_WALLET_ID;

/**
 * ==========================================
 * SOUSCRIRE À UN ABONNEMENT
 * ==========================================
 */

/**
 * Souscrire abonnement TEACHER_PREMIUM
 */
export const subscribeToPremium = async (userId, teacherId) => {
  // Vérifier que c'est bien un enseignant
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    include: { user: { include: { wallet: true } } }
  });

  if (!teacherProfile || teacherProfile.userId !== userId) {
    throw new AppError('Enseignant introuvable ou non autorisé', 403);
  }

  // Vérifier validation
  if (teacherProfile.validationStatus !== 'VERIFIED') {
    throw new AppError('Profil doit être validé avant abonnement', 403);
  }

  const price = SUBSCRIPTION_PRICES.TEACHER_PREMIUM;
  const wallet = teacherProfile.user.wallet;

  if (!wallet || wallet.balance < price) {
    throw new AppError(`Solde insuffisant (requis: ${price} FCFA)`, 400);
  }

  if (wallet.isLocked) {
    throw new AppError('Wallet verrouillé', 403);
  }

  // Vérifier wallet plateforme
  const platformWallet = await prisma.wallet.findUnique({
    where: { userId: PLATFORM_WALLET_USER_ID }
  });

  if (!platformWallet) {
    throw new AppError('Erreur système - contactez le support', 500);
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + SUBSCRIPTION_DURATION_DAYS);

  const reference = `SUB-PREM-${uuidv4()}`;

  logger.info(`📋 Abonnement Premium: ${teacherId} - ${price} FCFA`);

  // CRITIQUE: Transaction atomique
  const result = await prisma.$transaction(async (tx) => {
    // 1. Débiter wallet enseignant
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: price } }
    });

    // 2. Créditer wallet plateforme
    await tx.wallet.update({
      where: { id: platformWallet.id },
      data: { balance: { increment: price } }
    });

    // 3. Créer transaction
    const transaction = await tx.transaction.create({
      data: {
        reference,
        type: 'SUBSCRIPTION',
        amount: price,
        status: 'COMPLETED',
        fromWalletId: wallet.id,
        toWalletId: platformWallet.id,
        paymentMethod: 'WALLET',
        description: 'Abonnement Premium Enseignant',
        isLocked: true,
        metadata: JSON.stringify({ 
          subscriptionType: 'TEACHER_PREMIUM',
          teacherId 
        })
      }
    });

    // 4. Créer abonnement
    const subscription = await tx.subscription.create({
      data: {
        type: 'TEACHER_PREMIUM',
        userId,
        teacherId,
        amount: price,
        startDate,
        endDate,
        isActive: true,
        autoRenew: false,
        transactionId: transaction.id
      }
    });

    // 5. Activer premium sur profil
    await tx.teacherProfile.update({
      where: { id: teacherId },
      data: {
        isPremium: true,
        premiumUntil: endDate
      }
    });

    // 6. Notification
    await tx.notification.create({
      data: {
        userId,
        type: 'SUBSCRIPTION_ACTIVE',
        title: 'Abonnement Premium activé',
        message: `Votre abonnement Premium est actif jusqu'au ${endDate.toLocaleDateString('fr-FR')}`
      }
    });

    return { subscription, transaction };
  });

  logger.info(`✅ Abonnement Premium activé: ${teacherId}`);
  return result;
};

/**
 * Souscrire abonnement SCHOOL_QUIZ
 */
export const subscribeSchool = async (userId, schoolId) => {
  const schoolProfile = await prisma.schoolProfile.findUnique({
    where: { id: schoolId },
    include: { user: { include: { wallet: true } } }
  });

  if (!schoolProfile || schoolProfile.userId !== userId) {
    throw new AppError('École introuvable ou non autorisée', 403);
  }

  const price = SUBSCRIPTION_PRICES.SCHOOL_QUIZ;
  const wallet = schoolProfile.user.wallet;

  if (!wallet || wallet.balance < price) {
    throw new AppError(`Solde insuffisant (requis: ${price} FCFA)`, 400);
  }

  if (wallet.isLocked) {
    throw new AppError('Wallet verrouillé', 403);
  }

  const platformWallet = await prisma.wallet.findUnique({
    where: { userId: PLATFORM_WALLET_USER_ID }
  });

  if (!platformWallet) {
    throw new AppError('Erreur système', 500);
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + SUBSCRIPTION_DURATION_DAYS);

  const reference = `SUB-SCHOOL-${uuidv4()}`;

  logger.info(`📋 Abonnement École: ${schoolId} - ${price} FCFA`);

  const result = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: price } }
    });

    await tx.wallet.update({
      where: { id: platformWallet.id },
      data: { balance: { increment: price } }
    });

    const transaction = await tx.transaction.create({
      data: {
        reference,
        type: 'SUBSCRIPTION',
        amount: price,
        status: 'COMPLETED',
        fromWalletId: wallet.id,
        toWalletId: platformWallet.id,
        paymentMethod: 'WALLET',
        description: 'Abonnement École Quiz',
        isLocked: true,
        metadata: JSON.stringify({ 
          subscriptionType: 'SCHOOL_QUIZ',
          schoolId 
        })
      }
    });

    const subscription = await tx.subscription.create({
      data: {
        type: 'SCHOOL_QUIZ',
        userId,
        schoolId,
        amount: price,
        startDate,
        endDate,
        isActive: true,
        autoRenew: false,
        transactionId: transaction.id
      }
    });

    await tx.schoolProfile.update({
      where: { id: schoolId },
      data: {
        hasSubscription: true,
        subscriptionUntil: endDate
      }
    });

    await tx.notification.create({
      data: {
        userId,
        type: 'SUBSCRIPTION_ACTIVE',
        title: 'Abonnement École activé',
        message: `Votre abonnement Quiz est actif jusqu'au ${endDate.toLocaleDateString('fr-FR')}`
      }
    });

    return { subscription, transaction };
  });

  logger.info(`✅ Abonnement École activé: ${schoolId}`);
  return result;
};

/**
 * ==========================================
 * GESTION DES ABONNEMENTS
 * ==========================================
 */

/**
 * Récupérer les abonnements d'un utilisateur
 */
export const getUserSubscriptions = async (userId) => {
  return await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Récupérer un abonnement actif
 */
export const getActiveSubscription = async (userId, type) => {
  return await prisma.subscription.findFirst({
    where: {
      userId,
      type,
      isActive: true,
      endDate: { gte: new Date() }
    }
  });
};

/**
 * Vérifier si un abonnement est actif
 */
export const isSubscriptionActive = async (userId, type) => {
  const subscription = await getActiveSubscription(userId, type);
  return !!subscription;
};

/**
 * Annuler un abonnement
 */
export const cancelSubscription = async (subscriptionId, userId) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId }
  });

  if (!subscription) {
    throw new AppError('Abonnement introuvable', 404);
  }

  if (subscription.userId !== userId) {
    throw new AppError('Non autorisé', 403);
  }

  // On ne désactive que le auto-renew, pas l'abonnement en cours
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { autoRenew: false }
  });

  logger.info(`❌ Auto-renew désactivé: ${subscriptionId}`);

  return { message: 'Auto-renew désactivé. L\'abonnement reste actif jusqu\'à la fin de la période.' };
};

/**
 * ==========================================
 * CRON JOB - EXPIRATION DES ABONNEMENTS
 * ==========================================
 */

/**
 * Désactiver les abonnements expirés
 * À appeler quotidiennement via cron job
 */
export const deactivateExpiredSubscriptions = async () => {
  const now = new Date();

  logger.info('🔄 Vérification des abonnements expirés...');

  // Trouver tous les abonnements actifs expirés
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      isActive: true,
      endDate: { lt: now }
    },
    include: {
      teacher: true,
      school: true
    }
  });

  if (expiredSubscriptions.length === 0) {
    logger.info('✅ Aucun abonnement expiré');
    return { count: 0 };
  }

  logger.info(`⏰ ${expiredSubscriptions.length} abonnement(s) expiré(s)`);

  let deactivatedCount = 0;

  for (const sub of expiredSubscriptions) {
    try {
      await prisma.$transaction(async (tx) => {
        // Désactiver l'abonnement
        await tx.subscription.update({
          where: { id: sub.id },
          data: { isActive: false }
        });

        // Désactiver premium/subscription sur profil
        if (sub.type === 'TEACHER_PREMIUM' && sub.teacher) {
          await tx.teacherProfile.update({
            where: { id: sub.teacherId },
            data: {
              isPremium: false,
              premiumUntil: null
            }
          });
        }

        if (sub.type === 'SCHOOL_QUIZ' && sub.school) {
          await tx.schoolProfile.update({
            where: { id: sub.schoolId },
            data: {
              hasSubscription: false,
              subscriptionUntil: null
            }
          });
        }

        // Notification
        await tx.notification.create({
          data: {
            userId: sub.userId,
            type: 'SUBSCRIPTION_EXPIRED',
            title: 'Abonnement expiré',
            message: `Votre abonnement ${sub.type} a expiré. Renouvelez pour continuer à profiter des avantages.`
          }
        });
      });

      deactivatedCount++;
      logger.info(`✅ Abonnement désactivé: ${sub.id}`);
    } catch (error) {
      logger.error(`Erreur désactivation abonnement ${sub.id}:`, error);
    }
  }

  logger.info(`✅ ${deactivatedCount} abonnement(s) désactivé(s)`);

  return { count: deactivatedCount };
};

export default {
  subscribeToPremium,
  subscribeSchool,
  getUserSubscriptions,
  getActiveSubscription,
  isSubscriptionActive,
  cancelSubscription,
  deactivateExpiredSubscriptions,
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_DURATION_DAYS
};
