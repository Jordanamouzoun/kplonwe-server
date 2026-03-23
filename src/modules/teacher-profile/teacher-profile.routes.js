import express from 'express';
import { 
  getTeacherProfile, 
  updateTeacherProfile, 
  getOwnProfile, 
  searchTeachers, 
  uploadAvatar,
  getMyCourses,
  getMyPublicProfile,
  addTeacher
} from './teacher-profile.controller.js';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getPublicDocuments
} from './teacher-documents.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/upload.middleware.js';

const router = express.Router();

// Routes protégées (Professeur)
router.get('/profile', authenticate, getOwnProfile);
router.put('/profile', authenticate, updateTeacherProfile);
router.get('/me/profile', authenticate, getMyPublicProfile);
router.get('/me/courses', authenticate, getMyCourses);
router.post('/upload-avatar', authenticate, upload.single('avatar'), uploadAvatar);

// Documents
router.get('/documents', authenticate, getDocuments);
router.post('/documents', authenticate, upload.single('file'), uploadDocument);
router.delete('/documents/:documentId', authenticate, deleteDocument);

// Routes publiques (Move dynamic routes to the end)
router.get('/search', searchTeachers);
router.get('/public/:teacherId/documents', getPublicDocuments); // Rename slightly or keep order
router.get('/:teacherId/profile', getTeacherProfile);
router.get('/:teacherId/documents', getPublicDocuments);

// Route protégée (Parent)
router.post('/:teacherId/add', authenticate, addTeacher);

export default router;
