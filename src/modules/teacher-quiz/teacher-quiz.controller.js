import * as quizService from './teacher-quiz.service.js';
import { asyncHandler, AppError } from '../../middlewares/error.middleware.js';
import prisma from '../../lib/prisma.js';

/**
 * Middleware helper pour récupérer l'ID du profil professeur
 */
const getTeacherId = async (userId) => {
  const profile = await prisma.teacherProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError('Profil professeur introuvable', 404);
  return profile.id;
};

export const createQuiz = asyncHandler(async (req, res) => {
  const teacherId = await getTeacherId(req.user.id);
  const quiz = await quizService.createQuiz(teacherId, req.body);
  res.status(201).json({ success: true, data: quiz });
});

export const getMyQuizzes = asyncHandler(async (req, res) => {
  const teacherId = await getTeacherId(req.user.id);
  const quizzes = await quizService.getTeacherQuizzes(teacherId);
  res.json({ success: true, data: quizzes });
});

export const getQuiz = asyncHandler(async (req, res) => {
  const teacherId = await getTeacherId(req.user.id);
  const quiz = await quizService.getQuizById(req.params.id, teacherId);
  res.json({ success: true, data: quiz });
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const teacherId = await getTeacherId(req.user.id);
  const quiz = await quizService.updateQuiz(req.params.id, teacherId, req.body);
  res.json({ success: true, data: quiz });
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const teacherId = await getTeacherId(req.user.id);
  await quizService.deleteQuiz(req.params.id, teacherId);
  res.json({ success: true, message: 'Quiz supprimé' });
});

export const getMyLinkedStudents = asyncHandler(async (req, res) => {
  const teacherId = await getTeacherId(req.user.id);
  const students = await quizService.getLinkedStudents(teacherId);
  res.json({ success: true, data: students });
});

export const assignQuiz = asyncHandler(async (req, res) => {
  const teacherId = await getTeacherId(req.user.id);
  const { studentIds, dueDate } = req.body;
  const result = await quizService.assignQuiz(req.params.id, teacherId, studentIds, dueDate);
  res.json({ success: true, data: result });
});

export const getQuizResults = asyncHandler(async (req, res) => {
  const teacherId = await getTeacherId(req.user.id);
  const results = await quizService.getQuizResults(req.params.id, teacherId);
  res.json({ success: true, data: results });
});

export const getStudentQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await quizService.getStudentQuizzes(req.user.id);
  res.json({ success: true, data: quizzes });
});

/**
 * Récupérer un quiz pour un élève
 */
export const getQuizForStudent = asyncHandler(async (req, res) => {
  const quiz = await quizService.getQuizForStudent(req.params.id, req.user.id);
  res.json({ success: true, data: quiz });
});

/**
 * Soumettre un quiz
 */
export const submitQuiz = asyncHandler(async (req, res) => {
  const result = await quizService.submitQuiz(req.params.id, req.user.id, req.body);
  res.json({ success: true, data: result });
});

export const uploadQuizImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Aucun fichier fourni', 400);
  
  // Avec Cloudinary (multer-storage-cloudinary), req.file.path est l'URL Cloudinary
  res.json({ 
    success: true, 
    data: { 
      url: req.file.path || req.file.secure_url 
    } 
  });
});
