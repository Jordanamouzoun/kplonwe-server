import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/upload.middleware.js';
import * as quizController from './teacher-quiz.controller.js';

const router = express.Router();

// Toutes les routes de ce module nécessitent une authentification
router.use(authenticate);

// Upload d'image pour quiz
router.post('/upload-image', upload.single('image'), quizController.uploadQuizImage);

// CRUD Quiz
router.post('/', quizController.createQuiz);
router.get('/', quizController.getMyQuizzes);
router.get('/:id', quizController.getQuiz);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

// Gestion des élèves et assignations (Enseignants)
router.get('/students/linked', quizController.getMyLinkedStudents);
router.post('/:id/assign', quizController.assignQuiz);
router.get('/:id/results', quizController.getQuizResults);

// Routes pour les élèves
router.get('/assigned/me', quizController.getStudentQuizzes);
router.get('/:id/student', quizController.getQuizForStudent);
router.post('/:id/submit', quizController.submitQuiz);

export default router;
