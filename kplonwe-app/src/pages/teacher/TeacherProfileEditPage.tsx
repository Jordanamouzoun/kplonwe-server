import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

const SUBJECTS = [
  'Mathématiques', 'Français', 'Anglais', 'Physique', 'Chimie',
  'SVT', 'Histoire-Géo', 'Philosophie', 'Espagnol', 'Allemand',
  'Informatique', 'Économie', 'Arts', 'Musique', 'Sport'
];

const LEVELS = [
  'Primaire', 'Collège', 'Lycée', 'Université', 'Formation professionnelle'
];

export function TeacherProfileEditPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    bio: '',
    subjects: [] as string[],
    levels: [] as string[],
    experience: 0,
    pricePerMonth: 0,
  });

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const res = await api.get('/teachers/me/profile');
      const profile = res.data?.profile || res.data;
      if (profile) {
        setFormData({
          bio: profile.bio || '',
          subjects: profile.subjects || [],
          levels: profile.levels || [],
          experience: profile.experience || 0,
          pricePerMonth: profile.pricePerMonth || 0,
        });
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.post('/teachers/me/profile', formData);
      setSuccess('Profil mis à jour avec succès !');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const toggleLevel = (level: string) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter(l => l !== level)
        : [...prev.levels, level]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Modifier mon profil
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Complétez votre profil pour augmenter votre visibilité
          </p>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
          
          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Biographie *
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Présentez-vous en quelques lignes..."
              rows={4}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 caractères</p>
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Matières enseignées *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUBJECTS.map((subject) => (
                <label
                  key={subject}
                  className={`
                    flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all text-sm
                    ${formData.subjects.includes(subject)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300"
                  />
                  <span className="font-medium text-gray-900">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Niveaux enseignés *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LEVELS.map((level) => (
                <label
                  key={level}
                  className={`
                    flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all text-sm
                    ${formData.levels.includes(level)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.levels.includes(level)}
                    onChange={() => toggleLevel(level)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300"
                  />
                  <span className="font-medium text-gray-900">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Années d'expérience *
              </label>
              <Input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                placeholder="5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prix par mois (FCFA) *
              </label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={formData.pricePerMonth}
                onChange={(e) => setFormData({ ...formData, pricePerMonth: parseInt(e.target.value) || 0 })}
                placeholder="50000"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="order-2 sm:order-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="order-1 sm:order-2 sm:flex-1"
            >
              {saving ? (
                <span>Enregistrement...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save size={18} />
                  Enregistrer les modifications
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
