import express from 'express';
import { 
  getStats, 
  getAllTeachers, 
  getPendingTeachers, 
  getTeacherDetails, 
  validateTeacher, 
  rejectTeacher,
  verifyDocument,
  rejectDocument,
  getAllParents,
  getAllSchools,
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  getPMFCohorts,
  certifyTeacher,
  decertifyTeacher
} from './admin.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = express.Router();

// Appliquer authenticate et requireRole('ADMIN') à toutes les routes
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', getStats);
router.get('/teachers', getAllTeachers);
router.get('/teachers/pending', getPendingTeachers);
router.get('/teachers/:id', getTeacherDetails);
router.put('/teachers/:id/validate', validateTeacher);
router.put('/teachers/:id/reject', rejectTeacher);
router.put('/teachers/:id/certify', certifyTeacher);
router.put('/teachers/:id/decertify', decertifyTeacher);

router.put('/documents/:docId/verify', verifyDocument);
router.put('/documents/:docId/reject', rejectDocument);

router.get('/parents', getAllParents);
router.get('/schools', getAllSchools);
router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);
router.delete('/admins/:id', deleteAdmin);

router.get('/pmf-cohorts', getPMFCohorts);

export default router;
