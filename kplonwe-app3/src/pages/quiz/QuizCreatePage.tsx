import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Plus, Trash2, Save } from 'lucide-react';
import type { Quiz, QuizQuestion } from '@/types';

export function QuizCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    subject: '',
    timeLimit: 30,
  });

  const [questions, setQuestions] = useState<Partial<QuizQuestion>[]>([
    {
      text: '',
      type: 'multiple_choice' as const,
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10,
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...(updated[qIndex].options || [])];
    options[optIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options };
    setQuestions(updated);
  };

  const handleSave = async (status: 'draft' | 'published') => {
    // Validation basique
    if (!quiz.title || !quiz.subject) {
      alert('Veuillez remplir le titre et la matière');
      return;
    }

    if (questions.some((q) => !q.text || q.options?.some((o) => !o))) {
      alert('Veuillez remplir toutes les questions et options');
      return;
    }

    try {
      await api.post('/quiz', { ...quiz, questions, status: status.toUpperCase() });
      navigate('/dashboard');
    } catch {
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {user?.role === 'ADMIN' ? 'Créer un QCM de validation' : 'Créer un quiz'}
      </h1>

      <div className="space-y-8">
        {/* Informations générales */}
        <section className="bg-white p-6 rounded-lg shadow-md" aria-labelledby="general-info">
          <h2 id="general-info" className="text-xl font-semibold mb-4">Informations générales</h2>
          <div className="space-y-4">
            <Input
              label="Titre du quiz"
              id="title"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              required
              autoFocus
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={quiz.description}
                onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <Input
              label="Matière"
              id="subject"
              value={quiz.subject}
              onChange={(e) => setQuiz({ ...quiz, subject: e.target.value })}
              required
            />

            <Input
              label="Temps limite (minutes)"
              id="timeLimit"
              type="number"
              value={quiz.timeLimit}
              onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) })}
              min={1}
            />
          </div>
        </section>

        {/* Questions */}
        <section aria-labelledby="questions-section">
          <div className="flex items-center justify-between mb-4">
            <h2 id="questions-section" className="text-xl font-semibold">Questions ({questions.length})</h2>
            <Button onClick={addQuestion}>
              <Plus size={20} className="mr-2" aria-hidden="true" />
              Ajouter une question
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
                      aria-label={`Supprimer la question ${qIndex + 1}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor={`question-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Texte de la question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`question-${qIndex}`}
                      rows={2}
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Réponses <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === optIndex}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                            className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                            aria-label={`Marquer l'option ${optIndex + 1} comme correcte`}
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Sélectionnez la bonne réponse</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Points"
                      id={`points-${qIndex}`}
                      type="number"
                      value={question.points}
                      onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Annuler
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')}>
            <Save size={20} className="mr-2" aria-hidden="true" />
            Sauvegarder en brouillon
          </Button>
          <Button onClick={() => handleSave('published')}>
            Publier le quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
