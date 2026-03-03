import cron from 'node-cron';
import { deactivateExpiredSubscriptions } from '../modules/subscription/subscription.service.js';
import logger from '../utils/logger.js';

/**
 * CRON JOB - DÉSACTIVATION ABONNEMENTS EXPIRÉS
 * 
 * Tourne tous les jours à 2h du matin
 * Désactive les abonnements dont endDate < now
 * Envoie des notifications aux utilisateurs
 */

export function startSubscriptionCron() {
  // Cron expression: '0 2 * * *' = Tous les jours à 2h00
  // Pour test: '*/5 * * * *' = Toutes les 5 minutes
  
  const cronExpression = process.env.NODE_ENV === 'production' 
    ? '0 2 * * *'  // 2h du matin en production
    : '0 */6 * * *'; // Toutes les 6 heures en dev

  cron.schedule(cronExpression, async () => {
    logger.info('⏰ CRON: Vérification des abonnements expirés...');
    
    try {
      const result = await deactivateExpiredSubscriptions();
      logger.info(`✅ CRON: ${result.count} abonnement(s) traité(s)`);
    } catch (error) {
      logger.error('❌ CRON: Erreur lors de la désactivation des abonnements:', error);
    }
  });

  logger.info(`🕐 CRON: Planificateur d'abonnements démarré (${cronExpression})`);
}

/**
 * Exécuter manuellement la désactivation (pour tests)
 */
export async function runSubscriptionCheckManually() {
  logger.info('🔄 Exécution manuelle de la vérification des abonnements...');
  try {
    const result = await deactivateExpiredSubscriptions();
    logger.info(`✅ ${result.count} abonnement(s) désactivé(s)`);
    return result;
  } catch (error) {
    logger.error('❌ Erreur:', error);
    throw error;
  }
}

export default {
  startSubscriptionCron,
  runSubscriptionCheckManually
};
