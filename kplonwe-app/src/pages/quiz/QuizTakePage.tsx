import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { QuizProgress } from '@/components/quiz/QuizProgress';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  duration: number | null;
  questions: Question[];
}

export function QuizTakePage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => { loadQuiz(); }, [quizId]);

  async function loadQuiz() {
    try {
      const res = await api.get(`/quiz/${quizId}`);
      setQuiz(res.data.quiz || res.data);
    } catch (err) {
      alert('Impossible de charger le quiz');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
    if (!confirm('Êtes-vous sûr de vouloir soumettre vos réponses ?')) return;
    
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      
      await api.post(`/quiz/${quizId}/submit`, { answers: formattedAnswers });
      navigate(`/quiz/${quizId}/results`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement du quiz...</p>
      </div>
    );
  }

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Quitter</span>
            </button>
            
            {quiz.duration && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                <Clock size={16} className="text-primary-600" />
                <QuizTimer
                  duration={quiz.duration}
                  onTimeUp={() => {
                    setTimeUp(true);
                    handleSubmit();
                  }}
                />
              </div>
            )}
          </div>

          {/* Quiz title */}
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          
          {/* Progress */}
          <QuizProgress
            current={currentQuestionIndex + 1}
            total={quiz.questions.length}
            progress={progress}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Question card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8 mb-6">
          
          {/* Question header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1 mb-3">
                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                  Question {currentQuestionIndex + 1}/{quiz.questions.length}
                </span>
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-xs sm:text-sm text-gray-500">Points</div>
              <div className="text-lg sm:text-xl font-bold text-primary-600">{currentQuestion.points}</div>
            </div>
          </div>

          {/* Answer options */}
          <div className="space-y-3">
            {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
              <div className="space-y-2 sm:space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`
                      flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${answers[currentQuestion.id] === option
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="flex-1 text-sm sm:text-base text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'TRUE_FALSE' && (
              <div className="grid grid-cols-2 gap-3">
                {['Vrai', 'Faux'].map((option) => (
                  <label
                    key={option}
                    className={`
                      flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${answers[currentQuestion.id] === option
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'SHORT_ANSWER' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                placeholder="Votre réponse..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition text-sm sm:text-base"
                rows={4}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="order-2 sm:order-1"
          >
            <ArrowLeft size={18} className="mr-2" />
            Précédent
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
              className="order-1 sm:order-2"
            >
              {submitting ? (
                <span>Soumission...</span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle size={18} />
                  Soumettre le quiz
                </span>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="order-1 sm:order-2"
            >
              Suivant
              <ArrowRight size={18} className="ml-2" />
            </Button>
          )}
        </div>

        {/* Warning if incomplete */}
        {isLastQuestion && Object.keys(answers).length !== quiz.questions.length && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Vous n'avez pas répondu à toutes les questions ({Object.keys(answers).length}/{quiz.questions.length})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
