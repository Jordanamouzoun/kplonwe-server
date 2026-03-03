import logger from '../utils/logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      error = new AppError('Données en conflit', 409);
    }
    if (err.code === 'P2025') {
      error = new AppError('Ressource introuvable', 404);
    }
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Erreur serveur';

  logger.error(`[${req.method}] ${req.path} - ${message}`, { 
    error: err.message,
    stack: err.stack
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.code && { code: error.code }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default { AppError, errorHandler, asyncHandler };
