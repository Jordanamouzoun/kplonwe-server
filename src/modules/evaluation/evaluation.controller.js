import prisma from '../../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';


const MONTHLY_QUIZ_LIMIT_FREE = 7;

/**
 * Créer un quiz d'évaluation (École)
 * POST /api/v1/evaluation/quizzes
 */
export const createEvaluationQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, subject, passingScore, timeLimit, questions } = req.body;
    
    // Vérifier que c'est une école
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { schoolProfile: true },
    });
    
    if (!user || user.role !== 'SCHOOL' || !user.schoolProfile) {
      return res.status(403).json({
        success: false,
        message: 'Seules les écoles peuvent créer des quiz d\'évaluation',
      });
    }
    
    // ✅ RÈGLE MÉTIER: Vérifier limite mensuelle si gratuit
    if (!user.schoolProfile.hasSubscription) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const quizzesThisMonth = await prisma.evaluationQuiz.count({
        where: {
          schoolId: user.schoolProfile.id,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });
      
      if (quizzesThisMonth >= MONTHLY_QUIZ_LIMIT_FREE) {
        return res.status(403).json({
          success: false,
          message: `Limite mensuelle atteinte (${MONTHLY_QUIZ_LIMIT_FREE} quiz). Passez en premium pour créer des quiz illimités.`,
          limitReached: true,
          limit: MONTHLY_QUIZ_LIMIT_FREE,
          current: quizzesThisMonth,
        });
      }
    }
    
    // Valider questions
    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le quiz doit contenir au moins une question',
      });
    }
    
    // Créer quiz + questions en transaction
    const quiz = await prisma.$transaction(async (tx) => {
      const newQuiz = await tx.evaluationQuiz.create({
        data: {
          id: uuidv4(),
          schoolId: user.schoolProfile.id,
          title,
          description,
          subject,
          passingScore: passingScore || 70,
          timeLimit,
          status: 'PUBLISHED',
        },
      });
      
      // Créer questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await tx.evaluationQuestion.create({
          data: {
            id: uuidv4(),
            quizId: newQuiz.id,
            question: q.question,
            type: q.type,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            order: i,
          },
        });
      }
      
      return newQuiz;
    });
    
    res.status(201).json({
      success: true,
      message: 'Quiz d\'évaluation créé avec succès',
      quiz,
    });
  } catch (error) {
    console.error('Erreur création quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du quiz',
      error: error.message,
    });
  }
};

/**
 * Attribuer un quiz à un professeur
 * POST /api/v1/evaluation/quizzes/:quizId/assign
 */
export const assignQuizToTeacher = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { teacherId } = req.body;
    const userId = req.user.id;
    
    // Vérifier que c'est une école et que le quiz lui appartient
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { schoolProfile: true },
    });
    
    if (!user || !user.schoolProfile) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }
    
    const quiz = await prisma.evaluationQuiz.findUnique({
      where: { id: quizId },
    });
    
    if (!quiz || quiz.schoolId !== user.schoolProfile.id) {
      return res.status(404).json({
        success: false,
        message: 'Quiz non trouvé',
      });
    }
    
    // Vérifier que le professeur existe
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
    });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Professeur non trouvé',
      });
    }
    
    // Vérifier si déjà assigné
    const existing = await prisma.evaluationAssignment.findUnique({
      where: {
        quizId_teacherId: {
          quizId,
          teacherId,
        },
      },
    });
    
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Quiz déjà attribué à ce professeur',
      });
    }
    
    // Créer l'assignment
    const assignment = await prisma.evaluationAssignment.create({
      data: {
        id: uuidv4(),
        quizId,
        teacherId,
        status: 'PENDING',
      },
    });
    
    // Créer notification pour le professeur
    const teacherUser = await prisma.user.findFirst({
      where: {
        teacherProfile: {
          id: teacherId,
        },
      },
    });
    
    if (teacherUser) {
      await prisma.notificationModel.create({
        data: {
          id: uuidv4(),
          userId: teacherUser.id,
          type: 'QUIZ_ASSIGNED',
          title: 'Nouveau quiz d\'évaluation',
          message: `Une école vous a attribué un quiz: ${quiz.title}`,
          data: JSON.stringify({ quizId, assignmentId: assignment.id }),
        },
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Quiz attribué avec succès',
      assignment,
    });
  } catch (error) {
    console.error('Erreur attribution quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'attribution du quiz',
      error: error.message,
    });
  }
};

/**
 * Récupérer les quiz assignés au professeur connecté
 * GET /api/v1/evaluation/assignments
 */
export const getTeacherAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
    
    if (!user || !user.teacherProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil professeur non trouvé',
      });
    }
    
    const assignments = await prisma.evaluationAssignment.findMany({
      where: {
        teacherId: user.teacherProfile.id,
      },
      include: {
        quiz: {
          include: {
            school: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
    
    res.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error('Erreur récupération assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des quiz assignés',
      error: error.message,
    });
  }
};

/**
 * Récupérer un quiz pour le passer
 * GET /api/v1/evaluation/quizzes/:quizId
 */
export const getQuizForTaking = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
    
    if (!user || !user.teacherProfile) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }
    
    // Vérifier assignment
    const assignment = await prisma.evaluationAssignment.findUnique({
      where: {
        quizId_teacherId: {
          quizId,
          teacherId: user.teacherProfile.id,
        },
      },
    });
    
    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à passer ce quiz',
      });
    }
    
    const quiz = await prisma.evaluationQuiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz non trouvé',
      });
    }
    
    // Ne pas envoyer les bonnes réponses
    const questions = quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options ? JSON.parse(q.options) : null,
      points: q.points,
      order: q.order,
    }));
    
    res.json({
      success: true,
      quiz: {
        ...quiz,
        questions,
      },
      assignment,
    });
  } catch (error) {
    console.error('Erreur récupération quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du quiz',
      error: error.message,
    });
  }
};

/**
 * Soumettre les réponses au quiz
 * POST /api/v1/evaluation/quizzes/:quizId/submit
 */
export const submitQuizAnswers = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // { questionId: answer }
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacherProfile: true },
    });
    
    if (!user || !user.teacherProfile) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }
    
    // Vérifier assignment
    const assignment = await prisma.evaluationAssignment.findUnique({
      where: {
        quizId_teacherId: {
          quizId,
          teacherId: user.teacherProfile.id,
        },
      },
    });
    
    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Quiz non assigné',
      });
    }
    
    if (assignment.status === 'COMPLETED') {
      return res.status(409).json({
        success: false,
        message: 'Quiz déjà complété',
      });
    }
    
    // Récupérer quiz + questions
    const quiz = await prisma.evaluationQuiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz non trouvé',
      });
    }
    
    // Calculer le score
    let totalPoints = 0;
    let earnedPoints = 0;
    
    quiz.questions.forEach(q => {
      totalPoints += q.points;
      if (answers[q.id] && answers[q.id] === q.correctAnswer) {
        earnedPoints += q.points;
      }
    });
    
    const scorePercentage = (earnedPoints / totalPoints) * 100;
    const passed = scorePercentage >= quiz.passingScore;
    
    // Mettre à jour assignment
    const updatedAssignment = await prisma.evaluationAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'COMPLETED',
        score: scorePercentage,
        passed,
        answers: JSON.stringify(answers),
        completedAt: new Date(),
        startedAt: assignment.startedAt || new Date(),
      },
    });
    
    // Mettre à jour statut professeur si passé
    if (passed) {
      await prisma.teacherProfile.update({
        where: { id: user.teacherProfile.id },
        data: {
          validationStatus: 'VERIFIED',
          validatedAt: new Date(),
        },
      });
    }
    
    res.json({
      success: true,
      message: passed ? 'Quiz réussi !' : 'Quiz échoué',
      result: {
        score: scorePercentage,
        passed,
        earnedPoints,
        totalPoints,
      },
    });
  } catch (error) {
    console.error('Erreur soumission quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la soumission du quiz',
      error: error.message,
    });
  }
};

/**
 * Récupérer les résultats (École)
 * GET /api/v1/evaluation/quizzes/:quizId/results
 */
export const getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { schoolProfile: true },
    });
    
    if (!user || !user.schoolProfile) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }
    
    const quiz = await prisma.evaluationQuiz.findUnique({
      where: { id: quizId },
    });
    
    if (!quiz || quiz.schoolId !== user.schoolProfile.id) {
      return res.status(404).json({
        success: false,
        message: 'Quiz non trouvé',
      });
    }
    
    const results = await prisma.evaluationAssignment.findMany({
      where: {
        quizId,
        status: 'COMPLETED',
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });
    
    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Erreur récupération résultats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des résultats',
      error: error.message,
    });
  }
};
