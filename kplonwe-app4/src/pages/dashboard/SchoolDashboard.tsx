import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Users, Search, BookOpen, CheckCircle, AlertCircle, Plus, Award } from 'lucide-react';

export function SchoolDashboard() {
  const { user } = useAuth();

  // Statut réel depuis le profil (à terme depuis l'API)
  const hasSubscription = false; // TODO: charger depuis user.schoolProfile ou API

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        title="Espace École"
        subtitle="Recrutez les meilleurs enseignants et gérez vos évaluations"
      />

      {/* Statut abonnement */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Statut de votre abonnement</h2>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
            hasSubscription ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
          }`}>
            {hasSubscription ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {hasSubscription ? 'Abonnement actif' : "Pas d'abonnement actif"}
          </span>

          {!hasSubscription && (
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-800">
              <div className="flex items-start gap-3">
                <Award size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Passez à l'abonnement Premium</p>
                  <p>QCM illimités, accès aux profils complets des enseignants, statistiques avancées.</p>
                  <p className="font-semibold mt-1">5 000 FCFA / mois</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Actions rapides */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link
            to="/teachers"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users size={24} className="text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Trouver des enseignants</p>
                <p className="text-sm text-gray-500">Rechercher par matière et niveau</p>
              </div>
            </div>
          </Link>

          <Link
            to="/quiz/create"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Créer un quiz d'évaluation</p>
                <p className="text-sm text-gray-500">{hasSubscription ? 'Quiz illimités' : '5 quiz gratuits par mois'}</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Fonctionnalités disponibles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={22} />
              Disponible gratuitement
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Consulter les enseignants validés</li>
              <li>• Voir les profils détaillés</li>
              <li>• Contacter les enseignants</li>
              <li>• Recherche par matière et niveau</li>
              <li>• 5 QCM par mois</li>
            </ul>
          </div>

          <div className={`p-4 sm:p-6 rounded-lg shadow-md border-l-4 ${
            hasSubscription ? 'bg-white border-green-500' : 'bg-gray-50 border-gray-300'
          }`}>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              {hasSubscription
                ? <CheckCircle className="text-green-600" size={22} />
                : <Award className="text-gray-400" size={22} />}
              {hasSubscription ? 'Premium actif' : 'Premium uniquement'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• QCM illimités</li>
              <li>• Évaluer les candidats</li>
              <li>• Statistiques avancées</li>
              <li>• Support prioritaire</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section enseignants — vers la recherche réelle */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Enseignants disponibles</h2>
          <Link to="/teachers">
            <Button variant="outline">
              <Search size={18} className="mr-2" />
              Voir tous les enseignants
            </Button>
          </Link>
        </div>
        <div className="bg-white p-8 sm:p-10 rounded-lg shadow-md text-center">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">
            Parcourez notre liste de professeurs validés par l'administration.
          </p>
          <Link to="/teachers">
            <Button>Rechercher des enseignants</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
