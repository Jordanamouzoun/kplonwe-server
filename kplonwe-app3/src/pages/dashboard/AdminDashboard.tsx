import { Link } from 'react-router-dom';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Users, DollarSign, TrendingUp, Shield, CheckCircle, UserCheck } from 'lucide-react';

export function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      <DashboardHeader
        title="Administration KPLONWE"
        subtitle="Gérez la plateforme et validez les enseignants"
      />

      {/* Stats globales */}
      <section className="mb-6 sm:mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users size={20} className="sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Utilisateurs</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">—</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign size={20} className="sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Revenus</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">—</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp size={20} className="sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Transactions</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">—</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">En attente</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">—</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions rapides */}
      <section>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">Gestion de la plateforme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link
            to="/admin/teachers"
            className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition flex-shrink-0">
              <UserCheck className="text-blue-600" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm sm:text-base">Valider enseignants</p>
              <p className="text-xs sm:text-sm text-gray-500">Vérifier les profils</p>
            </div>
          </Link>

          <Link
            to="/admin/parents"
            className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition flex-shrink-0">
              <Users className="text-green-600" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm sm:text-base">Gérer parents</p>
              <p className="text-xs sm:text-sm text-gray-500">Liste des parents</p>
            </div>
          </Link>

          <Link
            to="/admin/schools"
            className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition flex-shrink-0">
              <Shield className="text-purple-600" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm sm:text-base">Gérer écoles</p>
              <p className="text-xs sm:text-sm text-gray-500">Liste des écoles</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
