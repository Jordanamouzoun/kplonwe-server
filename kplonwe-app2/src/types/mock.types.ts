export interface MockTeacher {
  id: string;
  firstName: string;
  lastName: string;
  subject: string;
  isPremium: boolean;
  rating: number;
  studentsCount: number;
}

export interface MockStudent {
  id: string;
  firstName: string;
  lastName: string;
  progress: number;
  lastActivity: string;
}

export interface MockChild {
  id: string;
  firstName: string;
  lastName: string;
  level: string;
  school: string;
  subjects: Array<{
    name: string;
    progress: number;
    teacher: string;
  }>;
}

export interface MockQuiz {
  id: string;
  title: string;
  subject: string;
  questionsCount: number;
  createdAt: string;
  status: 'draft' | 'published';
  completedBy?: number;
}

export interface MockActivity {
  id: string;
  type: 'quiz_completed' | 'message_received' | 'assignment_graded';
  description: string;
  timestamp: string;
}

export interface MockRevenue {
  month: string;
  amount: number;
}

export interface MockStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalQuizzes: number;
  pendingTeachers: number;
}
