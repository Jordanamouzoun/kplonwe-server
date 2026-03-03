import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Search, User, BookOpen, Star, CheckCircle, Clock, UserPlus, Check } from 'lucide-react';

interface Teacher {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  subjects: string[];
  levels: string[];
  experience: number;
  pricePerMonth: number | null;
  rating: number;
  reviewCount: number;
  validationStatus: string;
  isPremium: boolean;
}

const SUBJECTS_OPTIONS = [
  'Mathématiques',
  'Physique',
  'Chimie',
  'Biologie',
  'Français',
  'Anglais',
  'Espagnol',
  'Histoire',
  'Géographie',
  'Philosophie',
  'Économie',
  'Informatique',
];

const LEVELS_OPTIONS = [
  'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  '6ème', '5ème', '4ème', '3ème',
  'Seconde', 'Première', 'Terminale',
];

export function TeachersSearchPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [resultsMessage, setResultsMessage] = useState('');
  // PMF event: track which teachers the parent has already added
  const [addedTeachers, setAddedTeachers] = useState<Record<string, boolean>>({});
  const [addingTeacher, setAddingTeacher] = useState<string | null>(null);

  const isParent = user?.role === 'PARENT';

  const handleAddTeacher = useCallback(async (teacherId: string) => {
    if (!isParent || addingTeacher) return;
    setAddingTeacher(teacherId);
    try {
      await api.post(`/teachers/${teacherId}/add`);
      setAddedTeachers(prev => ({ ...prev, [teacherId]: true }));
    } catch {
      // silently ignore (already added = fine)
      setAddedTeachers(prev => ({ ...prev, [teacherId]: true }));
    } finally {
      setAddingTeacher(null);
    }
  }, [isParent, addingTeacher]);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchQuery, selectedSubject, selectedLevel]);

  async function loadTeachers() {
    try {
      setLoading(true);
      const response = await api.get('/teachers/search');
      if (response.data.success) {
        setTeachers(response.data.teachers);
        setResultsMessage(`${response.data.count} professeur${response.data.count > 1 ? 's' : ''} trouvé${response.data.count > 1 ? 's' : ''}`);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  function filterTeachers() {
    let filtered = [...teachers];

    // Filtrer par nom (recherche)
    if (searchQuery.trim()) {
      filtered = filtered.filter(t =>
        `${t.user.firstName} ${t.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrer par matière
    if (selectedSubject) {
      filtered = filtered.filter(t => t.subjects.includes(selectedSubject));
    }

    // Filtrer par niveau
    if (selectedLevel) {
      filtered = filtered.filter(t => t.levels.includes(selectedLevel));
    }

    setFilteredTeachers(filtered);
    setResultsMessage(`${filtered.length} professeur${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600" role="status" aria-live="polite">
          Chargement des professeurs...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ✅ ACCESSIBILITÉ: Live region pour annonces */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {resultsMessage}
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trouver un professeur
        </h1>
        <p className="text-gray-600">
          Recherchez et contactez des professeurs qualifiés pour vos enfants
        </p>
      </header>

      {/* Filtres */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8" aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="text-xl font-bold text-gray-900 mb-4">
          Recherche et filtres
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Recherche par nom */}
          <div>
            <label htmlFor="search-name" className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher par nom
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
              <input
                id="search-name"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom du professeur..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Rechercher un professeur par nom"
              />
            </div>
          </div>

          {/* Filtrer par matière */}
          <div>
            <label htmlFor="filter-subject" className="block text-sm font-medium text-gray-700 mb-2">
              Matière
            </label>
            <select
              id="filter-subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filtrer par matière"
            >
              <option value="">Toutes les matières</option>
              {SUBJECTS_OPTIONS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Filtrer par niveau */}
          <div>
            <label htmlFor="filter-level" className="block text-sm font-medium text-gray-700 mb-2">
              Niveau
            </label>
            <select
              id="filter-level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filtrer par niveau scolaire"
            >
              <option value="">Tous les niveaux</option>
              {LEVELS_OPTIONS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bouton réinitialiser */}
        {(searchQuery || selectedSubject || selectedLevel) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('');
                setSelectedLevel('');
              }}
              className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
              aria-label="Réinitialiser les filtres"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </section>

      {/* Résultats */}
      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="text-2xl font-bold text-gray-900 mb-4">
          {filteredTeachers.length} professeur{filteredTeachers.length > 1 ? 's' : ''} trouvé{filteredTeachers.length > 1 ? 's' : ''}
        </h2>

        {filteredTeachers.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">
              Aucun professeur ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('');
                setSelectedLevel('');
              }}
              className="text-primary-600 hover:text-primary-700"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Liste des professeurs">
            {filteredTeachers.map(teacher => (
              <article
                key={teacher.id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 ${teacher.isPremium ? 'border-yellow-400' : 'border-transparent'
                  }`}
                role="listitem"
              >
                <div className="p-6">
                  {/* Badge Premium */}
                  {teacher.isPremium && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        <Star size={16} className="fill-current" aria-hidden="true" />
                        Premium
                      </span>
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    {teacher.user.avatar ? (
                      <img
                        src={teacher.user.avatar.startsWith('http')
                          ? teacher.user.avatar
                          : `http://localhost:5000${teacher.user.avatar}`}
                        alt={`Photo de ${teacher.user.firstName} ${teacher.user.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <User size={32} className="text-primary-600" aria-hidden="true" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {teacher.user.firstName} {teacher.user.lastName}
                      </h3>
                      {teacher.experience && (
                        <p className="text-sm text-gray-600">
                          {teacher.experience} an{teacher.experience > 1 ? 's' : ''} d'exp.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Statut */}
                  {teacher.validationStatus === 'VERIFIED' && (
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} className="text-green-600" aria-hidden="true" />
                      <span className="text-sm text-green-600 font-medium">Vérifié</span>
                    </div>
                  )}
                  {teacher.validationStatus === 'PENDING' && (
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={16} className="text-yellow-600" aria-hidden="true" />
                      <span className="text-sm text-yellow-600 font-medium">En attente</span>
                    </div>
                  )}

                  {/* Matières */}
                  {teacher.subjects.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={16} className="text-primary-600" aria-hidden="true" />
                        <span className="text-sm font-medium text-gray-700">Matières</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.slice(0, 3).map((subject, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs"
                          >
                            {subject}
                          </span>
                        ))}
                        {teacher.subjects.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{teacher.subjects.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prix */}
                  {teacher.pricePerMonth && (
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-primary-600">
                        {teacher.pricePerMonth.toLocaleString()} FCFA
                        <span className="text-sm text-gray-600 font-normal">/mois</span>
                      </p>
                    </div>
                  )}

                  {/* Note */}
                  {teacher.reviewCount > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex" aria-label={`Note: ${teacher.rating} étoiles sur 5`}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.round(teacher.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({teacher.reviewCount})</span>
                    </div>
                  )}

                  {/* Boutons */}
                  <div className="flex gap-2 mt-2">
                    <Link to={`/teacher/${teacher.id}`} className="flex-1">
                      <Button className="w-full" variant="outline">
                        Voir le profil
                      </Button>
                    </Link>
                    {isParent && (
                      <button
                        onClick={() => handleAddTeacher(teacher.id)}
                        disabled={!!addedTeachers[teacher.id] || addingTeacher === teacher.id}
                        aria-label={addedTeachers[teacher.id] ? 'Professeur déjà ajouté' : `Ajouter ${teacher.user.firstName} ${teacher.user.lastName}`}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${addedTeachers[teacher.id]
                            ? 'bg-emerald-100 text-emerald-700 cursor-default'
                            : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
                          } disabled:opacity-70`}
                      >
                        {addedTeachers[teacher.id] ? (
                          <><Check size={16} /> Ajouté</>
                        ) : addingTeacher === teacher.id ? (
                          <span className="animate-pulse">…</span>
                        ) : (
                          <><UserPlus size={16} /> Ajouter</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
