import jwt from 'jsonwebtoken';

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'change-this-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.refreshSecret, { expiresIn: JWT_CONFIG.refreshExpiresIn });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new Error('Token expiré');
    if (error.name === 'JsonWebTokenError') throw new Error('Token invalide');
    throw error;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.refreshSecret);
  } catch (error) {
    throw new Error('Refresh token invalide');
  }
};

export default { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken };
