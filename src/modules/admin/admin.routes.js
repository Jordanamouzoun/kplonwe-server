import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as adminController from './admin.controller.js';

const router = express.Router();

// Toutes les routes admin exigent auth + rôle ADMIN
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Stats
router.get('/stats', adminController.getStats);

// Teachers
router.get('/teachers', adminController.getAllTeachers);
router.get('/teachers/pending', adminController.getPendingTeachers);
router.get('/teachers/:id', adminController.getTeacherDetails);
router.patch('/teachers/:id/validate', adminController.validateTeacher);
router.patch('/teachers/:id/reject', adminController.rejectTeacher);
// Compat avec ancien frontend (PUT)
router.put('/teachers/:id/validate', adminController.validateTeacher);
router.put('/teachers/:id/reject', adminController.rejectTeacher);
// Compat avec nouveau frontend (POST)
router.post('/teachers/:id/validate', adminController.validateTeacher);

// Parents
router.get('/parents', adminController.getAllParents);

// Schools
router.get('/schools', adminController.getAllSchools);

// Admins
router.get('/admins', adminController.getAllAdmins);
router.post('/admins', adminController.createAdmin);
router.delete('/admins/:id', adminController.deleteAdmin);

// Documents
router.patch('/documents/:docId/verify', adminController.verifyDocument);
router.patch('/documents/:docId/reject', adminController.rejectDocument);

// PMF Cohorts
router.get('/pmf-cohorts', adminController.getPMFCohorts);

export default router;

