import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { BookOpen, Trophy, Target, PlayCircle, Info, AlertCircle } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  status: string;
  duration: number | null;
  questions?: { id: string }[];
}

export function StudentDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes]   = useState<Quiz[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => { loadQuizzes(); }, []);

  async function loadQuizzes() {
    try {
      const res = await api.get('/quiz');
      const data = res.data?.quizzes ?? res.data?.data ?? [];
      setQuizzes(Array.isArray(data) ? data.filter((q: Quiz) => q.status === 'PUBLISHED') : []);
    } catch {
      setError('Impossible de charger les quiz. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        title={`Bienvenue, ${user?.firstName} !`}
        subtitle="Ton espace d'apprentissage personnel"
      />

      {/* Info compte géré */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 sm:mb-8" role="note">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0" size={22} />
          <div>
            <p className="font-medium text-blue-900">Compte géré par ton parent</p>
            <p className="text-sm text-blue-800 mt-1">
              Ton parent peut suivre ta progression et t'aider dans ton apprentissage.
            </p>
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats réelles */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen size={28} className="text-primary-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{loading ? '…' : quizzes.length}</p>
              <p className="text-sm text-gray-500">Quiz disponibles</p>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target size={28} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">—</p>
              <p className="text-sm text-gray-500">Résultats disponibles bientôt</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz disponibles */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Quiz disponibles</h2>

        {loading ? (
          <p className="text-gray-500">Chargement des quiz…</p>
        ) : quizzes.length === 0 ? (
          <div className="bg-white p-8 sm:p-10 rounded-lg shadow-md text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Aucun quiz disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quizzes.slice(0, 6).map((quiz) => (
              <article key={quiz.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-primary-600">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{quiz.subject}</p>
                <p className="text-xs text-gray-400 mb-4">
                  {quiz.questions?.length ?? 0} questions
                  {quiz.duration ? ` • ${quiz.duration} min` : ''}
                </p>
                <Link to={`/quiz/${quiz.id}/take`}>
                  <Button fullWidth>
                    <PlayCircle size={18} className="mr-2" />
                    Commencer
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
