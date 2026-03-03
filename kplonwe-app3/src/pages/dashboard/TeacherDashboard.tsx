import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/Button';
import {
  UserCircle, Edit, Camera, FileText,
  CheckCircle, AlertCircle, Clock, Award
} from 'lucide-react';

/** Garantit toujours un tableau, que la valeur soit déjà un Array ou une string JSON. */
function parseArr(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function TeacherDashboard() {
  const { user } = useAuth();

  // Données réelles depuis le contexte auth (chargées au login)
  const validationStatus = user?.teacherProfile?.validationStatus ?? 'PENDING';
  const isPremium        = user?.teacherProfile?.isPremium ?? false;

  // Toujours des tableaux, même si la DB a renvoyé une string JSON
  const subjects = parseArr(user?.teacherProfile?.subjects);
  const levels   = parseArr(user?.teacherProfile?.levels);

  const statusConfig = {
    VERIFIED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Compte validé — visible dans les recherches' },
    PENDING:  { color: 'bg-yellow-100 text-yellow-800', icon: Clock,       text: 'En attente de validation par l\'administration' },
    REJECTED: { color: 'bg-red-100 text-red-800',      icon: AlertCircle,  text: 'Validation refusée — complétez votre profil' },
  };

  const st = statusConfig[validationStatus as keyof typeof statusConfig] ?? statusConfig.PENDING;
  const StatusIcon = st.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        title={`Espace enseignant — ${user?.firstName} ${user?.lastName}`}
        subtitle="Gérez votre profil et suivez vos cours"
      />

      {/* Statut du compte */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Statut de votre compte</h2>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${st.color}`} role="status">
              <StatusIcon size={18} />
              {st.text}
            </span>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              isPremium ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
            }`}>
              <Award size={18} />
              {isPremium ? 'Premium' : 'Gratuit'}
            </span>
          </div>

          {validationStatus === 'PENDING' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800">
              Votre profil est en cours de vérification. Complétez vos informations et uploadez
              vos documents pour accélérer la validation.
            </div>
          )}
          {validationStatus === 'REJECTED' && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-800">
              Votre profil a été refusé. Mettez-le à jour et soumettez à nouveau.
            </div>
          )}
          {validationStatus === 'VERIFIED' && !isPremium && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-800">
              <strong>Passez Premium</strong> pour apparaître en tête des recherches,
              accéder aux statistiques avancées et créer des quiz illimités.
              <span className="font-semibold"> (5 000 FCFA/mois)</span>
            </div>
          )}
        </div>
      </section>

      {/* Gestion du profil */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Mon profil professionnel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { to: `/teacher/${user?.teacherProfile?.id ?? ''}`, icon: UserCircle, label: 'Mon profil', sub: 'Voir mon profil public', color: 'bg-primary-100 text-primary-600' },
            { to: '/teacher/profile/edit',   icon: Edit,       label: 'Modifier mon profil', sub: 'Bio, matières, prix…', color: 'bg-blue-100 text-blue-600' },
            { to: '/teacher/profile/avatar', icon: Camera,     label: 'Ma photo',             sub: 'Modifier ma photo',     color: 'bg-purple-100 text-purple-600' },
            { to: '/teacher/documents',      icon: FileText,   label: 'Mes diplômes',         sub: 'Gérer mes certifications', color: 'bg-green-100 text-green-600' },
          ].map(({ to, icon: Icon, label, sub, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Informations du profil réelles */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Récapitulatif</h2>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Matières enseignées</p>
              {subjects.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {subjects.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">{s}</span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">Non renseigné — <Link to="/teacher/profile/edit" className="text-primary-600 hover:underline">Ajouter</Link></p>
              )}
            </div>
            <div>
              <p className="text-gray-500 mb-1">Prix mensuel</p>
              {user?.teacherProfile?.pricePerMonth ? (
                <p className="font-semibold text-gray-900">{user.teacherProfile.pricePerMonth.toLocaleString()} FCFA/mois</p>
              ) : (
                <p className="text-gray-400 italic">Non renseigné — <Link to="/teacher/profile/edit" className="text-primary-600 hover:underline">Définir</Link></p>
              )}
            </div>
            <div>
              <p className="text-gray-500 mb-1">Expérience</p>
              {user?.teacherProfile?.experience ? (
                <p className="font-semibold text-gray-900">{user.teacherProfile.experience} an{user.teacherProfile.experience > 1 ? 's' : ''}</p>
              ) : (
                <p className="text-gray-400 italic">Non renseigné</p>
              )}
            </div>
            <div>
              <p className="text-gray-500 mb-1">Niveaux enseignés</p>
              {levels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {levels.map((l, i) => (
                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">{l}</span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">Non renseigné</p>
              )}
            </div>
          </div>

          {validationStatus !== 'VERIFIED' && (
            <div className="mt-4 pt-4 border-t">
              <Link to="/teacher/profile/edit">
                <Button>Compléter mon profil</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
