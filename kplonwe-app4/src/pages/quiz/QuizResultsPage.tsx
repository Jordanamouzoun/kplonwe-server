import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import { Button } from '@/components/ui/Button';
import { Trophy, Clock, CheckCircle, XCircle, Home } from 'lucide-react';
import type { QuizAttempt, Quiz } from '@/types';

export function QuizResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();

  const { attempt, quiz } = location.state as { attempt: QuizAttempt; quiz: Quiz } || {};

  if (!attempt || !quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">Résultats non trouvés</p>
        <Button onClick={() => navigate('/dashboard')}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  const percentage = Math.round((attempt.score / attempt.maxScore) * 100);
  const correctCount = quiz.questions.filter(
    (q) => attempt.answers[q.id] === q.correctAnswer
  ).length;
  const minutes = Math.floor(attempt.timeSpent / 60);
  const seconds = attempt.timeSpent % 60;

  const getGrade = () => {
    if (percentage >= 90) return { text: 'Excellent !', color: 'text-green-600', icon: Trophy };
    if (percentage >= 75) return { text: 'Très bien !', color: 'text-blue-600', icon: CheckCircle };
    if (percentage >= 50) return { text: 'Bien', color: 'text-yellow-600', icon: CheckCircle };
    return { text: 'À améliorer', color: 'text-red-600', icon: XCircle };
  };

  const grade = getGrade();
  const GradeIcon = grade.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
          <GradeIcon className={`${grade.color} w-12 h-12`} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz terminé !</h1>
        <p className="text-xl text-gray-600">{quiz.title}</p>
      </div>

      {/* Score principal */}
      <div className="bg-white p-8 rounded-lg shadow-md text-center mb-6">
        <p className={`text-6xl font-bold ${grade.color} mb-2`} aria-label={`Score: ${percentage} pour cent`}>
          {percentage}%
        </p>
        <p className="text-2xl font-semibold text-gray-900 mb-4">{grade.text}</p>
        <p className="text-gray-600">
          {attempt.score} / {attempt.maxScore} points
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" aria-hidden="true" />
          <p className="text-3xl font-bold text-green-600">{correctCount}</p>
          <p className="text-sm text-gray-600">Réponses correctes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" aria-hidden="true" />
          <p className="text-3xl font-bold text-red-600">{quiz.questions.length - correctCount}</p>
          <p className="text-sm text-gray-600">Réponses incorrectes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" aria-hidden="true" />
          <p className="text-3xl font-bold text-blue-600">
            {minutes}:{String(seconds).padStart(2, '0')}
          </p>
          <p className="text-sm text-gray-600">Temps passé</p>
        </div>
      </div>

      {/* Correction détaillée */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Correction détaillée</h2>
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <QuizQuestion
              key={question.id}
              question={question}
              questionNumber={index + 1}
              totalQuestions={quiz.questions.length}
              selectedAnswer={attempt.answers[question.id] ?? null}
              onAnswerSelect={() => {}}
              showCorrectAnswer
              disabled
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <Home size={20} className="mr-2" aria-hidden="true" />
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
}
