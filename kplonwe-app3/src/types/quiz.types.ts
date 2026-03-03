export type QuestionType = 'multiple_choice' | 'true_false';

export interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: number; // index de la réponse correcte
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  createdBy: string;
  createdAt: string;
  questions: QuizQuestion[];
  timeLimit?: number; // en minutes
  status: 'draft' | 'published';
  assignedTo?: string[]; // IDs des élèves
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number;
  maxScore: number;
  completedAt: string;
  timeSpent: number; // en secondes
}

export interface QuizResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
}
