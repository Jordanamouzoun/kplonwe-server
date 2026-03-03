import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  Award, BookOpen, User, CheckCircle, XCircle, Clock,
  GraduationCap, Briefcase, Edit, FileText, Download, AlertCircle
} from 'lucide-react';

interface TeacherProfile {
  id: string;
  bio: string | null;
  subjects: string[];
  levels: string[];
  experience: number | null;
  education: string | null;
  certifications: string[];
  pricePerMonth: number | null;
  validationStatus: string;
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export function TeacherProfilePage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = user?.teacherProfile?.id === teacherId;

  useEffect(() => {
    if (!teacherId || teacherId === 'undefined') {
      setLoading(false);
      setNotFound(true);
      return;
    }
    loadProfile();
    loadDocuments();
  }, [teacherId]);

  async function loadProfile() {
    try {
      setLoading(true);
      const response = await api.get(`/teachers/${teacherId}/profile`);
      if (response.data.success) {
        setProfile(response.data.profile);
        setNotFound(false);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadDocuments() {
    try {
      const response = await api.get(`/teachers/${teacherId}/documents`);
      if (response.data.success) {
        setDocuments(response.data.documents || []);
      }
    } catch {
      setDocuments([]);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Chargement du profil...</p>
      </div>
    );
  }

  // teacherId manquant = session à rafraîchir (pas un vrai 404)
  if (!teacherId || teacherId === 'undefined') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session à rafraîchir</h1>
          <p className="text-gray-600 mb-6">
            Déconnectez-vous puis reconnectez-vous pour accéder à votre profil public.
          </p>
          <Link to="/dashboard"><Button>Retour au dashboard</Button></Link>
        </div>
      </div>
    );
  }

  // Professeur inexistant en base = vrai 404
  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Professeur introuvable</h1>
          <p className="text-gray-600 mb-6">Ce professeur n'existe pas dans notre base de données.</p>
          <Link to="/"><Button>Retour à l'accueil</Button></Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Impossible de charger le profil.</p>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    PENDING:  { label: 'Non vérifié', icon: Clock,       color: 'text-yellow-600', bg: 'bg-yellow-100' },
    VERIFIED: { label: 'Vérifié',     icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-100'  },
    REJECTED: { label: 'Refusé',      icon: XCircle,     color: 'text-red-600',    bg: 'bg-red-100'    },
  };
  const status = statusConfig[profile.validationStatus] ?? statusConfig.PENDING;
  const StatusIcon = status.icon;

  const avatarUrl = profile.user.avatar
    ? (profile.user.avatar.startsWith('http')
        ? profile.user.avatar
        : `${BACKEND_URL}${profile.user.avatar}`)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Bouton éditer – propriétaire seulement */}
      {isOwnProfile && (
        <div className="mb-4">
          <Link to="/teacher/profile/edit">
            <Button className="flex items-center gap-2">
              <Edit size={20} />
              Éditer mon profil
            </Button>
          </Link>
        </div>
      )}

      {/* ── EN-TÊTE ── */}
      <header className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">

          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`Photo de ${profile.user.firstName} ${profile.user.lastName}`}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-primary-100"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200">
                <User size={48} className="sm:w-12 sm:h-12 md:w-16 md:h-16 text-primary-400" />
              </div>
            )}
          </div>

          {/* Infos principales */}
          <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
              {profile.user.firstName} {profile.user.lastName}
            </h1>

            <div className="mb-3 flex justify-center sm:justify-start">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${status.bg} ${status.color}`}>
                <StatusIcon size={14} className="sm:w-4 sm:h-4" />
                {status.label}
              </span>
            </div>

            {/* Expérience */}
            {profile.experience && profile.experience > 0 ? (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-700 mb-2 text-sm sm:text-base">
                <Briefcase size={16} className="sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                <span><strong>{profile.experience}</strong> an{profile.experience > 1 ? 's' : ''} d'expérience</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400 italic mb-2">
                <Briefcase size={18} />
                <span>Expérience non renseignée</span>
              </div>
            )}

            {/* Prix */}
            {profile.pricePerMonth ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary-600">
                  {profile.pricePerMonth.toLocaleString('fr-FR')} FCFA
                </span>
                <span className="text-gray-500">/mois</span>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">Prix non défini</p>
            )}
          </div>
        </div>
      </header>

      {/* ── BIO ── */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">À propos</h2>
        {profile.bio ? (
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
        ) : (
          <p className="text-gray-400 italic">Bio non renseignée.</p>
        )}
      </section>

      {/* ── MATIÈRES ── */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen size={20} className="text-primary-600" />
          Matières enseignées
        </h2>
        {Array.isArray(profile.subjects) && profile.subjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.subjects.map((s, i) => (
              <span key={i} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-lg font-medium text-sm">{s}</span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">Aucune matière renseignée.</p>
        )}
      </section>

      {/* ── NIVEAUX ── */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          <GraduationCap size={20} className="text-primary-600" />
          Niveaux enseignés
        </h2>
        {Array.isArray(profile.levels) && profile.levels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.levels.map((l, i) => (
              <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-medium text-sm">{l}</span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">Aucun niveau renseigné.</p>
        )}
      </section>

      {/* ── FORMATION ── */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          <GraduationCap size={20} className="text-primary-600" />
          Formation
        </h2>
        {profile.education ? (
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{profile.education}</p>
        ) : (
          <p className="text-gray-400 italic">Formation non renseignée.</p>
        )}
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Award size={20} className="text-primary-600" />
          Certifications
        </h2>
        {Array.isArray(profile.certifications) && profile.certifications.length > 0 ? (
          <ul className="space-y-2">
            {profile.certifications.map((cert, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{cert}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 italic">Aucune certification renseignée.</p>
        )}
      </section>

      {/* ── DOCUMENTS ── */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-primary-600" />
          Diplômes et documents
        </h2>

        {documents.length > 0 ? (
          <ul className="space-y-3">
            {documents.map((doc) => {
              const typeLabels: Record<string, string> = {
                DIPLOMA: 'Diplôme', CERTIFICATE: 'Certificat',
                ID_CARD: "Pièce d'identité", OTHER: 'Document',
              };
              const docStatusCfg: Record<string, { label: string; icon: any; color: string; bg: string }> = {
                PENDING:  { label: 'En attente', icon: Clock,       color: 'text-yellow-600', bg: 'bg-yellow-100' },
                VERIFIED: { label: 'Vérifié',    icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-100'  },
                REJECTED: { label: 'Refusé',     icon: XCircle,     color: 'text-red-600',    bg: 'bg-red-100'    },
              };
              const ds = docStatusCfg[doc.status] ?? docStatusCfg.PENDING;
              const DocIcon = ds.icon;

              return (
                <li key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText size={22} className="text-primary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{doc.originalName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{typeLabels[doc.type] ?? doc.type}</span>
                        <span>•</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${ds.bg} ${ds.color}`}>
                          <DocIcon size={11} />
                          {ds.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`${BACKEND_URL}${doc.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 rounded-lg"
                  >
                    <Download size={18} />
                    <span className="hidden sm:inline text-sm">Télécharger</span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 italic">
              {isOwnProfile
                ? "Vous n'avez pas encore uploadé de documents."
                : "Aucun document disponible."}
            </p>
            {isOwnProfile && (
              <Link
                to="/teacher/documents"
                className="inline-block mt-4 px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
              >
                Ajouter mes documents
              </Link>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
