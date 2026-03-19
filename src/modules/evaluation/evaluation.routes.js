import express from 'express';
import { 
  createEvaluationQuiz, 
  assignQuizToTeacher, 
  getTeacherAssignments, 
  getQuizForTaking, 
  submitQuizAnswers, 
  getQuizResults 
} from './evaluation.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/quizzes', requireRole('SCHOOL'), createEvaluationQuiz);
router.post('/quizzes/:quizId/assign', requireRole('SCHOOL'), assignQuizToTeacher);
router.get('/quizzes/:quizId/results', requireRole('SCHOOL'), getQuizResults);

router.get('/assignments', requireRole('TEACHER'), getTeacherAssignments);
router.get('/quizzes/:quizId', requireRole('TEACHER'), getQuizForTaking);
router.post('/quizzes/:quizId/submit', requireRole('TEACHER'), submitQuizAnswers);

export default router;
