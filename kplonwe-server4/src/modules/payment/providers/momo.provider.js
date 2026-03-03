import axios from 'axios';
import crypto from 'crypto';
import logger from '../../../utils/logger.js';

/**
 * MOMO PAY PROVIDER - BÉNIN
 * Documentation: https://momodeveloper.mtn.com/
 * 
 * SÉCURITÉ CRITIQUE:
 * - Vérification signature HMAC SHA256 sur TOUS les webhooks
 * - Timeout sur requêtes API
 * - Logging complet
 */

const MOMO_CONFIG = {
  apiUrl: process.env.MOMO_API_URL,
  apiKey: process.env.MOMO_API_KEY,
  apiSecret: process.env.MOMO_API_SECRET,
  subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  timeout: 30000,
};

async function getMomoAccessToken() {
  try {
    const auth = Buffer.from(`${MOMO_CONFIG.apiKey}:${MOMO_CONFIG.apiSecret}`).toString('base64');
    const response = await axios.post(
      `${MOMO_CONFIG.apiUrl}/token/`,
      {},
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey
        },
        timeout: MOMO_CONFIG.timeout
      }
    );
    return response.data.access_token;
  } catch (error) {
    logger.error('Erreur token MoMo:', error.response?.data || error.message);
    throw new Error('Impossible d\'obtenir le token MoMo');
  }
}

export const initiateMomoPayment = async (amount, phone, reference) => {
  try {
    const accessToken = await getMomoAccessToken();
    const response = await axios.post(
      `${MOMO_CONFIG.apiUrl}/collection/v1_0/requesttopay`,
      {
        amount: amount.toString(),
        currency: 'XOF',
        externalId: reference,
        payer: { partyIdType: 'MSISDN', partyId: phone.replace('+', '') },
        payerMessage: 'Recharge EduConnect',
        payeeNote: `Transaction ${reference}`
      },
      {
        headers: {
          'X-Reference-Id': reference,
          'X-Target-Environment': MOMO_CONFIG.environment,
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: MOMO_CONFIG.timeout
      }
    );
    logger.info(`MoMo initié: ${reference} - ${amount} FCFA`);
    return { success: true, reference, data: response.data };
  } catch (error) {
    logger.error('Erreur MoMo:', { reference, error: error.response?.data || error.message });
    return { success: false, reference, error: error.response?.data || error.message };
  }
};

export const verifyMomoPayment = async (reference) => {
  try {
    const accessToken = await getMomoAccessToken();
    const response = await axios.get(
      `${MOMO_CONFIG.apiUrl}/collection/v1_0/requesttopay/${reference}`,
      {
        headers: {
          'X-Target-Environment': MOMO_CONFIG.environment,
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
          'Authorization': `Bearer ${accessToken}`
        },
        timeout: MOMO_CONFIG.timeout
      }
    );
    return { success: true, status: response.data.status, data: response.data };
  } catch (error) {
    logger.error('Erreur vérification MoMo:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * CRITIQUE: Vérification signature webhook MoMo
 * SANS CELA = FAILLE DE SÉCURITÉ MAJEURE
 */
export const verifyMomoWebhook = (payload, signature) => {
  if (!signature) {
    logger.warn('Webhook MoMo sans signature - REJETÉ');
    return false;
  }
  try {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', MOMO_CONFIG.apiSecret)
      .update(payloadString)
      .digest('hex');
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isValid) {
      logger.error('Signature MoMo INVALIDE - tentative de fraude?');
    }
    return isValid;
  } catch (error) {
    logger.error('Erreur vérification signature MoMo:', error.message);
    return false;
  }
};

export const parseMomoWebhook = (payload) => ({
  reference: payload.externalId,
  status: payload.status,
  amount: parseFloat(payload.amount),
  currency: payload.currency,
  reason: payload.reason || null,
  raw: payload
});

export default {
  initiateMomoPayment,
  verifyMomoPayment,
  verifyMomoWebhook,
  parseMomoWebhook
};
