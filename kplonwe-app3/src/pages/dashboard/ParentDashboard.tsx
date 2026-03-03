import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ChildCard } from '@/components/dashboard/ChildCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { CreateChildForm } from '@/components/parent/CreateChildForm';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Users, TrendingUp, UserPlus, MessageSquare, Search, AlertCircle } from 'lucide-react';
import type { Child } from '@/types';

export function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateChildModal, setShowCreateChildModal] = useState(false);

  useEffect(() => { loadChildren(); }, []);

  async function loadChildren() {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/children');
      const data = response.data.success ? response.data.children : response.data.children || [];
      setChildren(data);
    } catch (err: any) {
      if (err.response?.status !== 403) {
        setError('Impossible de charger vos enfants. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleChildCreated = () => { loadChildren(); };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <DashboardHeader
        title="Espace Parent"
        subtitle={`Bienvenue ${user?.firstName}, suivez la progression de vos enfants`}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Actions rapides */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-xl sm:text-2xl font-bold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link to="/teachers" className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search size={24} className="text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Trouver un professeur</p>
                <p className="text-sm text-gray-500">Rechercher par matière ou niveau</p>
              </div>
            </div>
          </Link>

          <Link to="/messages" className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Mes messages</p>
                <p className="text-sm text-gray-500">Contacter les professeurs</p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => setShowCreateChildModal(true)}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserPlus size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ajouter un enfant</p>
                <p className="text-sm text-gray-500">Créer un compte enfant</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Stats réelles */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 sm:gap-6">
          <StatCard label="Enfants inscrits" value={children.length} icon={<Users size={40} />} />
          <StatCard label="Professeurs disponibles" value="→" icon={<TrendingUp size={40} />} />
        </div>
      </section>

      {/* Mes enfants */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Mes enfants</h2>
          <Button onClick={() => setShowCreateChildModal(true)}>
            <UserPlus size={18} className="mr-2" />
            Créer un compte enfant
          </Button>
        </div>

        {children.length === 0 ? (
          <div className="bg-white p-8 sm:p-10 rounded-lg shadow-md text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">Vous n'avez pas encore créé de compte pour vos enfants.</p>
            <Button onClick={() => setShowCreateChildModal(true)}>
              <UserPlus size={18} className="mr-2" />
              Créer le premier compte
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </section>

      {/* Professeurs — guide vers la recherche */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Trouver un professeur</h2>
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center">
          <Search size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">
            Parcourez notre liste de professeurs validés et contactez-les directement.
          </p>
          <Link to="/teachers">
            <Button>Rechercher des professeurs</Button>
          </Link>
        </div>
      </section>

      <CreateChildForm
        isOpen={showCreateChildModal}
        onClose={() => setShowCreateChildModal(false)}
        onSuccess={handleChildCreated}
      />
    </div>
  );
}
