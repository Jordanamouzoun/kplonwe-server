import express from 'express';
import {
  getTeacherProfile,
  updateTeacherProfile,
  getOwnProfile,
  searchTeachers,
  uploadAvatar,
  getMyPublicProfile,
} from './teacher-profile.controller.js';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getPublicDocuments,
} from './teacher-documents.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { optionalAuth } from '../../middlewares/optional-auth.middleware.js';
import upload from '../../middlewares/upload.middleware.js';
import uploadAvatarMiddleware from '../../middlewares/upload-avatar.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/search', searchTeachers); // Recherche professeurs

// Route spéciale "me" - DOIT être avant /:teacherId
router.get('/me/profile', authenticate, getMyPublicProfile);

router.get('/:teacherId/profile', getTeacherProfile);
router.get('/:teacherId/documents', optionalAuth, getPublicDocuments); // Documents publics d'un prof (auth optionnelle)

// Routes protégées
router.use(authenticate);

// Profil
router.get('/profile', getOwnProfile);
router.put('/profile', updateTeacherProfile);
router.post('/profile/avatar', uploadAvatarMiddleware.single('avatar'), uploadAvatar);

// Documents - utiliser multer pour upload
router.post('/documents', upload.single('file'), uploadDocument);
router.get('/documents', getDocuments);
router.delete('/documents/:documentId', deleteDocument);

export default router;
