import express from 'express';
import { 
  getTeacherProfile, 
  updateTeacherProfile, 
  getOwnProfile, 
  searchTeachers, 
  uploadAvatar,
  uploadDocument,
  getMyCourses,
  getMyPublicProfile,
  addTeacher
} from './teacher-profile.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/upload.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/search', searchTeachers);
router.get('/:teacherId/profile', getTeacherProfile);

// Routes protégées (Professeur)
router.get('/profile', authenticate, getOwnProfile);
router.put('/profile', authenticate, updateTeacherProfile);
router.get('/me/profile', authenticate, getMyPublicProfile);
router.get('/me/courses', authenticate, getMyCourses);
router.post('/profile/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.post('/upload-avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.post('/upload-document', authenticate, upload.single('document'), uploadDocument);

// Route protégée (Parent)
router.post('/:teacherId/add', authenticate, addTeacher);

export default router;
