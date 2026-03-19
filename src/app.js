import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

// ── Garantir l'existence des dossiers d'upload au démarrage ──────────────────
const UPLOAD_DIRS = [
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'uploads', 'avatars'),
  path.join(process.cwd(), 'uploads', 'teacher-documents'),
];
for (const dir of UPLOAD_DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[init] Dossier créé : ${dir}`);
  }
}

import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import walletRoutes from './modules/wallet/wallet.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import subscriptionRoutes from './modules/subscription/subscription.routes.js';
import childrenRoutes from './modules/children/children.routes.js';
import messagingRoutes from './modules/messaging/messaging.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import teacherProfileRoutes from './modules/teacher-profile/teacher-profile.routes.js';
import evaluationRoutes from './modules/evaluation/evaluation.routes.js';

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
// CORP "cross-origin" : obligatoire pour que les images /uploads soient
// accessibles depuis le frontend (localhost:5173 → localhost:5000).
// Sans ça, helmet applique "same-origin" par défaut et le navigateur bloque.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Les outils comme Postman n'envoient pas de header origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log(`[CORS] Rejeté: ${origin}`);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
});
app.use('/api/', limiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Fichiers statiques (avatars, documents) ───────────────────────────────────
// Le middleware inline force le header CORP sur chaque réponse static.
// Double protection avec le helmet ci-dessus.
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(process.cwd(), 'uploads')));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'EduConnect API is running', timestamp: new Date() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const apiPrefix = process.env.API_PREFIX || '/api/v1';
app.use(`${apiPrefix}/auth`,          authRoutes);
app.use(`${apiPrefix}/wallet`,        walletRoutes);
app.use(`${apiPrefix}/payment`,       paymentRoutes);
app.use(`${apiPrefix}/admin`,         adminRoutes);
app.use(`${apiPrefix}/subscription`,  subscriptionRoutes);
app.use(`${apiPrefix}/children`,      childrenRoutes);
app.use(`${apiPrefix}/messages`,      messagingRoutes);
app.use(`${apiPrefix}/notifications`, notificationsRoutes);
app.use(`${apiPrefix}/teachers`,      teacherProfileRoutes);
app.use(`${apiPrefix}/evaluation`,    evaluationRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});
app.use(errorHandler);

export default app;
