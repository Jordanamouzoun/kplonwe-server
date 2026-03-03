import axios from 'axios';
import crypto from 'crypto';
import logger from '../../../utils/logger.js';

/**
 * MOOV MONEY PROVIDER - BÉNIN
 * 
 * SÉCURITÉ:
 * - Vérification signature webhook
 * - Headers sécurisés
 */

const MOOV_CONFIG = {
  apiUrl: process.env.MOOV_API_URL,
  apiKey: process.env.MOOV_API_KEY,
  apiSecret: process.env.MOOV_API_SECRET,
  merchantCode: process.env.MOOV_MERCHANT_CODE,
  timeout: 30000
};

export const initiateMoovPayment = async (amount, phone, reference) => {
  try {
    const response = await axios.post(
      `${MOOV_CONFIG.apiUrl}/payments/request`,
      {
        amount,
        currency: 'XOF',
        merchant_code: MOOV_CONFIG.merchantCode,
        reference,
        phone,
        description: 'Recharge EduConnect'
      },
      {
        headers: {
          'X-API-KEY': MOOV_CONFIG.apiKey,
          'X-API-SECRET': MOOV_CONFIG.apiSecret,
          'Content-Type': 'application/json'
        },
        timeout: MOOV_CONFIG.timeout
      }
    );
    logger.info(`Moov initié: ${reference} - ${amount} FCFA`);
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Erreur Moov:', { reference, error: error.response?.data || error.message });
    return { success: false, error: error.response?.data || error.message };
  }
};

export const verifyMoovPayment = async (reference) => {
  try {
    const response = await axios.get(
      `${MOOV_CONFIG.apiUrl}/payments/status/${reference}`,
      {
        headers: {
          'X-API-KEY': MOOV_CONFIG.apiKey,
          'X-API-SECRET': MOOV_CONFIG.apiSecret
        },
        timeout: MOOV_CONFIG.timeout
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Erreur vérification Moov:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * CRITIQUE: Vérification signature Moov
 */
export const verifyMoovWebhook = (payload, signature) => {
  if (!signature) {
    logger.warn('Webhook Moov sans signature - REJETÉ');
    return false;
  }
  try {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', MOOV_CONFIG.apiSecret)
      .update(payloadString)
      .digest('hex');
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isValid) {
      logger.error('Signature Moov INVALIDE');
    }
    return isValid;
  } catch (error) {
    logger.error('Erreur vérification signature Moov:', error.message);
    return false;
  }
};

export const parseMoovWebhook = (payload) => ({
  reference: payload.reference,
  status: payload.status,
  amount: parseFloat(payload.amount),
  currency: payload.currency,
  raw: payload
});

export default {
  initiateMoovPayment,
  verifyMoovPayment,
  verifyMoovWebhook,
  parseMoovWebhook
};
