import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware.js';
import logger from '../../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Créer un nouveau quiz avec ses questions
 */
export const createQuiz = async (teacherId, quizData) => {
  const { title, description, subject, coverImage, status, questions } = quizData;

  return await prisma.quiz.create({
    data: {
      title,
      description,
      subject,
      coverImage,
      status: status || 'DRAFT',
      createdBy: teacherId,
      questions: {
        create: questions.map((q, index) => ({
          question: q.question,
          type: q.type,
          coverImage: q.coverImage,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: String(q.correctAnswer),
          points: q.points || 1,
          pointsType: q.pointsType || 'STANDARD',
          duration: q.duration,
          order: q.order || index
        }))
      }
    },
    include: {
      questions: true
    }
  });
};

/**
 * Récupérer tous les quiz d'un professeur
 */
export const getTeacherQuizzes = async (teacherId) => {
  return await prisma.quiz.findMany({
    where: { createdBy: teacherId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { questions: true, results: true, assignments: true }
      }
    }
  });
};

/**
 * Récupérer un quiz spécifique avec ses questions
 */
export const getQuizById = async (quizId, teacherId) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!quiz) throw new AppError('Quiz introuvable', 404);
  if (quiz.createdBy !== teacherId) throw new AppError('Non autorisé', 403);

  // Parser les options JSON
  quiz.questions = quiz.questions.map(q => ({
    ...q,
    options: q.options ? JSON.parse(q.options) : []
  }));

  return quiz;
};

/**
 * Mettre à jour un quiz et ses questions
 */
export const updateQuiz = async (quizId, teacherId, updateData) => {
  const { title, description, subject, coverImage, status, questions } = updateData;

  // Vérifier la propriété
  const existing = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!existing || existing.createdBy !== teacherId) {
    throw new AppError('Quiz introuvable ou non autorisé', 404);
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Mettre à jour le quiz de base
    const updatedQuiz = await tx.quiz.update({
      where: { id: quizId },
      data: { title, description, subject, coverImage, status },
    });

    // 2. Si des questions sont fournies, on remplace tout (plus simple pour Kahoot style)
    if (questions) {
      // Supprimer les anciennes questions
      await tx.quizQuestion.deleteMany({ where: { quizId } });

      // Créer les nouvelles
      await tx.quizQuestion.createMany({
        data: questions.map((q, index) => ({
          quizId,
          question: q.question,
          type: q.type,
          coverImage: q.coverImage,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: String(q.correctAnswer),
          points: q.points || 1,
          pointsType: q.pointsType || 'STANDARD',
          duration: q.duration,
          order: q.order || index
        }))
      });
    }

    return updatedQuiz;
  });
};

/**
 * Supprimer un quiz
 */
export const deleteQuiz = async (quizId, teacherId) => {
  const existing = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!existing || existing.createdBy !== teacherId) {
    throw new AppError('Quiz introuvable ou non autorisé', 404);
  }

  await prisma.quiz.delete({ where: { id: quizId } });
  return { success: true };
};

/**
 * Récupérer les élèves liés à un professeur
 */
export const getLinkedStudents = async (teacherId) => {
  const links = await prisma.studentTeacherLink.findMany({
    where: { teacherId, status: 'ACTIVE' },
    include: {
      student: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true, email: true }
          }
        }
      }
    }
  });

  return links.map(l => ({
    id: l.student.id,
    userId: l.student.user.id,
    firstName: l.student.user.firstName,
    lastName: l.student.user.lastName,
    avatar: l.student.user.avatar,
    email: l.student.user.email,
    grade: l.student.grade
  }));
};

/**
 * Assigner un quiz à des élèves
 */
export const assignQuiz = async (quizId, teacherId, studentIds, dueDate) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || quiz.createdBy !== teacherId) {
    throw new AppError('Quiz introuvable ou non autorisé', 404);
  }

  const assignments = studentIds.map(studentId => ({
    quizId,
    studentId,
    dueDate: dueDate ? new Date(dueDate) : null
  }));

  // Utiliser createMany with skipDuplicates: true
  return await prisma.quizAssignment.createMany({
    data: assignments,
    skipDuplicates: true
  });
};

/**
 * Récupérer les résultats des élèves pour un quiz
 */
export const getQuizResults = async (quizId, teacherId) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || quiz.createdBy !== teacherId) {
    throw new AppError('Quiz introuvable ou non autorisé', 404);
  }

  return await prisma.quizResult.findMany({
    where: { quizId },
    include: {
      student: {
        include: {
          user: {
            select: { firstName: true, lastName: true, avatar: true }
          }
        }
      }
    },
    orderBy: { completedAt: 'desc' }
  });
};
/**
 * Récupérer les quiz assignés à un élève
 */
export const getStudentQuizzes = async (userId) => {
  // Trouver le profil élève pour cet utilisateur
  const student = await prisma.studentProfile.findUnique({
    where: { userId }
  });

  if (!student) throw new AppError('Profil élève non trouvé', 404);

  return await prisma.quizAssignment.findMany({
    where: { studentId: student.id },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          description: true,
          subject: true,
          coverImage: true,
          status: true,
          _count: { select: { questions: true } }
        }
      }
    },
    orderBy: { assignedAt: 'desc' }
  });
};
/**
 * Récupérer un quiz pour un élève (sans les réponses correctes)
 */
export const getQuizForStudent = async (quizId, userId) => {
  const student = await prisma.studentProfile.findUnique({
    where: { userId }
  });

  if (!student) throw new AppError('Profil élève non trouvé', 404);

  // Vérifier si le quiz est assigné à cet élève
  const assignment = await prisma.quizAssignment.findUnique({
    where: {
      quizId_studentId: { quizId, studentId: student.id }
    }
  });

  if (!assignment) throw new AppError('Ce quiz ne vous est pas assigné', 403);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          question: true,
          type: true,
          coverImage: true,
          options: true,
          points: true,
          duration: true,
          order: true
          // On omet correctAnswer
        }
      }
    }
  });

  if (!quiz) throw new AppError('Quiz introuvable', 404);

  // Parser les options JSON
  quiz.questions = quiz.questions.map(q => ({
    ...q,
    options: q.options ? JSON.parse(q.options) : []
  }));

  return quiz;
};

/**
 * Soumettre les réponses à un quiz
 */
export const submitQuiz = async (quizId, userId, { answers, timeSpent }) => {
  const student = await prisma.studentProfile.findUnique({
    where: { userId }
  });

  if (!student) throw new AppError('Profil élève non trouvé', 404);

  // Récupérer le quiz et ses questions pour corriger
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true }
  });

  if (!quiz) throw new AppError('Quiz introuvable', 404);

  let totalPoints = 0;
  let earnedPoints = 0;

  quiz.questions.forEach(q => {
    const userAnswer = answers.find(a => a.questionId === q.id)?.answer;
    const weight = q.pointsType === 'DOUBLE' ? 2 : (q.pointsType === 'NONE' ? 0 : 1);
    const questionPoints = q.points * weight;
    
    totalPoints += questionPoints;

    // Correction simple
    let isCorrect = false;
    if (q.type === 'SINGLE_CHOICE' || q.type === 'FREE_TEXT') {
      isCorrect = String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    } else if (q.type === 'MULTIPLE_CHOICE') {
      // Pour multiple choix, l'utilisateur envoie probablement une string séparée par des virgules ou un array
      // On compare avec la réponse correcte
      const userArr = Array.isArray(userAnswer) ? userAnswer : String(userAnswer).split(',').map(s => s.trim());
      const correctArr = String(q.correctAnswer).split(',').map(s => s.trim());
      
      isCorrect = userArr.length === correctArr.length && 
                  userArr.every(val => correctArr.includes(val));
    }

    if (isCorrect) {
      earnedPoints += questionPoints;
    }
  });

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  return await prisma.quizResult.create({
    data: {
      quizId,
      studentId: student.id,
      score,
      maxScore: 100,
      timeSpent: timeSpent || 0,
      answers: JSON.stringify(answers),
      completedAt: new Date()
    }
  });
};
