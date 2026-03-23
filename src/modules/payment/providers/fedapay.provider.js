import { FedaPay, Transaction } from 'fedapay';
import logger from '../../../utils/logger.js';

/**
 * FEDAPAY PROVIDER - BÉNIN / TOGO
 * Documentation: https://docs.fedapay.com/
 */

const FEDAPAY_CONFIG = {
  publicKey: process.env.FEDAPAY_PUBLIC_KEY,
  secretKey: process.env.FEDAPAY_SECRET_KEY,
  environment: process.env.FEDAPAY_ENVIRONMENT || 'sandbox',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

// Initialiser le SDK FedaPay (une seule fois au chargement du module)
FedaPay.setApiKey(FEDAPAY_CONFIG.secretKey);
FedaPay.setEnvironment(FEDAPAY_CONFIG.environment);

/**
 * Initier une transaction FedaPay
 * @param {number} amount - Montant en FCFA
 * @param {object} customer - Infos client { firstName, lastName, email, phone }
 * @param {string} reference - Notre référence interne (ex: RECH-uuid)
 */
export const createFedaPayTransaction = async (amount, customer, reference) => {
  try {
    // Sanitisation du numéro de téléphone
    let phoneNumber = '';
    if (customer.phone) {
      phoneNumber = customer.phone.replace(/\D/g, ''); // Garder uniquement les chiffres
    }

    const transactionData = {
      description: `Recharge Portefeuille Kplonwe [Ref: ${reference}]`,
      amount: Math.round(amount),
      currency: { iso: 'XOF' },
      callback_url: `${FEDAPAY_CONFIG.frontendUrl}/wallet?status=success&ref=${reference}`,
      customer: {
        firstname: customer.firstName || 'Utilisateur',
        lastname: customer.lastName || 'Kplonwe',
        email: customer.email,
      }
    };

    // Ajouter le téléphone seulement s'il est valide (min 8 chiffres pour BJ/TG)
    if (phoneNumber.length >= 8) {
      transactionData.customer.phone_number = {
        number: phoneNumber,
        country: 'BJ'
      };
    }

    const transaction = await Transaction.create(transactionData);
    const token = await transaction.generateToken();

    logger.info(`FedaPay Transaction créée: ${reference} (ID: ${transaction.id})`);

    return {
      success: true,
      id: transaction.id,
      url: token.url,
      token: token.token
    };
  } catch (error) {
    // Log détaillé de l'erreur FedaPay
    const fedaError = error.response ? JSON.stringify(error.response.data) : error.message;
    logger.error(`🚨 Erreur FedaPay Create (${reference}):`, fedaError);
    
    return {
      success: false,
      error: fedaError
    };
  }
};

/**
 * Récupérer et vérifier le statut d'une transaction
 * @param {number|string} transactionId - L'ID FedaPay de la transaction
 */
export const retrieveFedaPayTransaction = async (transactionId) => {
  try {
    const transaction = await Transaction.retrieve(transactionId);
    
    // Status possibles : approved, declined, pending, canceled, transferred, refunded
    return {
      success: true,
      status: transaction.status,
      amount: transaction.amount,
      id: transaction.id,
      raw: transaction
    };
  } catch (error) {
    logger.error(`Erreur FedaPay Retrieve (${transactionId}):`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Parser les données d'un webhook FedaPay
 * (FedaPay envoie le même objet Transaction dans ses webhooks)
 */
export const parseFedaPayWebhook = (payload) => {
  // Le payload est l'objet de transaction directement
  const entity = payload.entity || payload;
  
  return {
    reference: entity.description ? entity.description.split('[Ref: ')[1]?.split(']')[0] : null,
    providerRef: entity.id.toString(),
    status: entity.status, // approved, declined, etc.
    amount: entity.amount,
    raw: payload
  };
};

export default {
  createFedaPayTransaction,
  retrieveFedaPayTransaction,
  parseFedaPayWebhook
};
