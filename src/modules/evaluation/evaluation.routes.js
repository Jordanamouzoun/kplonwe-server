import express from 'express';
import {
  createEvaluationQuiz,
  assignQuizToTeacher,
  getTeacherAssignments,
  getQuizForTaking,
  submitQuizAnswers,
  getQuizResults,
} from './evaluation.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

// Écoles - création et gestion quiz
router.post('/quizzes', createEvaluationQuiz);
router.post('/quizzes/:quizId/assign', assignQuizToTeacher);
router.get('/quizzes/:quizId/results', getQuizResults);

// Professeurs - assignments et passage
router.get('/assignments', getTeacherAssignments);
router.get('/quizzes/:quizId', getQuizForTaking);
router.post('/quizzes/:quizId/submit', submitQuizAnswers);

export default router;
