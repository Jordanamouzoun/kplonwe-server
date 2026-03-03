import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Search, Building2, Ban, CheckCircle } from 'lucide-react';

interface School {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadSchools(); }, []);

  async function loadSchools() {
    try {
      const res = await api.get('/admin/schools');
      setSchools(res.data?.schools || res.data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleActive = async (schoolId: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/users/${schoolId}`, { isActive: !isActive });
      loadSchools();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const filteredSchools = schools.filter(s =>
    searchQuery === '' || 
    `${s.name} ${s.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Gestion des écoles</h1>
        <p className="text-sm sm:text-base text-gray-600">Gérez les comptes écoles</p>
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
        ) : filteredSchools.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">Aucune école trouvée</p>
          </div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="block lg:hidden divide-y divide-gray-100">
              {filteredSchools.map((school) => (
                <div key={school.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 className="text-purple-700" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{school.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{school.email}</p>
                      {school.address && <p className="text-xs text-gray-500">{school.address}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${school.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {school.isActive ? 'Active' : 'Désactivée'}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => handleToggleActive(school.id, school.isActive)}>
                      {school.isActive ? <Ban size={14} className="mr-1" /> : <CheckCircle size={14} className="mr-1" />}
                      {school.isActive ? 'Désactiver' : 'Activer'}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">École</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Adresse</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Building2 className="text-purple-700" size={20} />
                          </div>
                          <p className="font-semibold text-gray-900">{school.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{school.email}</p>
                        {school.phone && <p className="text-xs text-gray-500">{school.phone}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{school.address || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${school.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {school.isActive ? 'Active' : 'Désactivée'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button size="sm" variant="outline" onClick={() => handleToggleActive(school.id, school.isActive)}>
                          {school.isActive ? <Ban size={14} className="mr-1" /> : <CheckCircle size={14} className="mr-1" />}
                          {school.isActive ? 'Désactiver' : 'Activer'}
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
