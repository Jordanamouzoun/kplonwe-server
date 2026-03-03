import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Search, Users, Ban, CheckCircle, Trash2 } from 'lucide-react';

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  _count?: { children: number };
}

export function AdminParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadParents(); }, []);

  async function loadParents() {
    try {
      const res = await api.get('/admin/parents');
      setParents(res.data?.parents || res.data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleActive = async (parentId: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/users/${parentId}`, { isActive: !isActive });
      loadParents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const filteredParents = parents.filter(p =>
    searchQuery === '' || 
    `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Gestion des parents</h1>
        <p className="text-sm sm:text-base text-gray-600">Gérez les comptes parents</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><p className="text-gray-500">Chargement...</p></div>
        ) : filteredParents.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Users className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">Aucun parent trouvé</p>
          </div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="block lg:hidden divide-y divide-gray-100">
              {filteredParents.map((parent) => (
                <div key={parent.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold text-lg">
                        {parent.firstName[0]}{parent.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{parent.firstName} {parent.lastName}</h3>
                      <p className="text-sm text-gray-600 truncate">{parent.email}</p>
                      {parent.phone && <p className="text-xs text-gray-500">{parent.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${parent.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {parent.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => handleToggleActive(parent.id, parent.isActive)}>
                      {parent.isActive ? <Ban size={14} className="mr-1" /> : <CheckCircle size={14} className="mr-1" />}
                      {parent.isActive ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Parent</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Enfants</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredParents.map((parent) => (
                    <tr key={parent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-bold">{parent.firstName[0]}{parent.lastName[0]}</span>
                          </div>
                          <p className="font-semibold text-gray-900">{parent.firstName} {parent.lastName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{parent.email}</p>
                        {parent.phone && <p className="text-xs text-gray-500">{parent.phone}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{parent._count?.children || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${parent.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {parent.isActive ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button size="sm" variant="outline" onClick={() => handleToggleActive(parent.id, parent.isActive)}>
                          {parent.isActive ? <Ban size={14} className="mr-1" /> : <CheckCircle size={14} className="mr-1" />}
                          {parent.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
