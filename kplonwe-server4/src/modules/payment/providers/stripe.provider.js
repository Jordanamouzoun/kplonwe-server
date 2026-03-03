import logger from '../../../utils/logger.js';

/**
 * STRIPE PROVIDER - OPTIONNEL
 * Si STRIPE_SECRET_KEY n'est pas défini, toutes les fonctions retournent une erreur claire
 */

let Stripe = null;
let stripe = null;

// ✅ Initialisation conditionnelle de Stripe
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key') {
  try {
    // Import dynamique de Stripe seulement si nécessaire
    const stripeModule = await import('stripe');
    Stripe = stripeModule.default;
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    logger.info('✅ Stripe initialisé avec succès');
  } catch (error) {
    logger.warn('⚠️ Stripe non disponible:', error.message);
  }
} else {
  logger.info('ℹ️ Stripe désactivé (pas de clé API configurée)');
}

// Taux de conversion XOF → EUR
const XOF_TO_EUR_RATE = 655.957;

const convertXOFtoEURCents = (amountXOF) => {
  const amountEUR = amountXOF / XOF_TO_EUR_RATE;
  return Math.round(amountEUR * 100);
};

const convertEURCentsToXOF = (amountEURCents) => {
  const amountEUR = amountEURCents / 100;
  return Math.round(amountEUR * XOF_TO_EUR_RATE);
};

export const createStripePaymentIntent = async (amountXOF, metadata) => {
  if (!stripe) {
    return {
      success: false,
      error: 'Stripe non configuré. Veuillez ajouter STRIPE_SECRET_KEY dans .env'
    };
  }

  try {
    const amountEURCents = convertXOFtoEURCents(amountXOF);
    
    logger.info(`Stripe: ${amountXOF} XOF = ${amountEURCents / 100} EUR`);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountEURCents,
      currency: 'eur',
      metadata: {
        ...metadata,
        originalAmountXOF: amountXOF.toString(),
        conversionRate: XOF_TO_EUR_RATE.toString()
      },
      description: 'Recharge EduConnect',
      automatic_payment_methods: {
        enabled: true,
      }
    });
    
    logger.info(`Payment Intent créé: ${paymentIntent.id}`);
    
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amountXOF,
      amountEUR: amountEURCents / 100
    };
  } catch (error) {
    logger.error('Erreur création Payment Intent Stripe:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const verifyStripeWebhook = (rawBody, signature) => {
  if (!stripe) {
    return { success: false, error: 'Stripe non configuré' };
  }

  if (!signature) {
    logger.warn('Webhook Stripe sans signature - REJETÉ');
    return { success: false, error: 'Signature manquante' };
  }

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    logger.info(`Webhook Stripe vérifié: ${event.type}`);
    
    return {
      success: true,
      event
    };
  } catch (error) {
    logger.error('Signature Stripe INVALIDE:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const parseStripeWebhook = (event) => {
  const paymentIntent = event.data.object;
  
  const amountXOF = parseInt(paymentIntent.metadata.originalAmountXOF);
  const reference = paymentIntent.metadata.reference;
  
  return {
    reference,
    status: paymentIntent.status,
    amountEUR: paymentIntent.amount / 100,
    amountXOF,
    paymentIntentId: paymentIntent.id,
    raw: paymentIntent
  };
};

export const getPaymentIntent = async (paymentIntentId) => {
  if (!stripe) {
    return { success: false, error: 'Stripe non configuré' };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      data: paymentIntent
    };
  } catch (error) {
    logger.error('Erreur récupération Payment Intent:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  createStripePaymentIntent,
  verifyStripeWebhook,
  parseStripeWebhook,
  getPaymentIntent,
  convertXOFtoEURCents,
  convertEURCentsToXOF
};
