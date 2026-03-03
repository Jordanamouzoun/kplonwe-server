import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { 
  CheckCircle, XCircle, Clock, Eye, Search,
  AlertCircle, User
} from 'lucide-react';

interface Teacher {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  profile?: {
    bio?: string;
    subjects?: string[];
    validationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    createdAt: string;
  };
}

type Status = 'PENDING' | 'VERIFIED' | 'REJECTED';

export function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | Status>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadTeachers(); }, []);

  async function loadTeachers() {
    try {
      const res = await api.get('/admin/teachers');
      console.log('Réponse API:', res.data); // Debug
      
      // S'assurer que c'est toujours un tableau
      let teachersData = [];
      
      if (Array.isArray(res.data)) {
        teachersData = res.data;
      } else if (res.data?.teachers && Array.isArray(res.data.teachers)) {
        teachersData = res.data.teachers;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        teachersData = res.data.data;
      }
      
      setTeachers(teachersData);
    } catch (err) {
      console.error('Erreur:', err);
      setTeachers([]); // Toujours un tableau même en cas d'erreur
    } finally {
      setLoading(false);
    }
  }

  const handleValidate = async (teacherId: string, status: 'VERIFIED' | 'REJECTED') => {
    if (!confirm(`Confirmer ${status === 'VERIFIED' ? 'la validation' : 'le rejet'} ?`)) return;
    
    try {
      // Appeler le bon endpoint selon le status
      const endpoint = status === 'VERIFIED' 
        ? `/admin/teachers/${teacherId}/validate`
        : `/admin/teachers/${teacherId}/reject`;
      
      await api.post(endpoint, { 
        comment: status === 'REJECTED' ? 'Profil incomplet' : 'Profil validé'
      });
      
      loadTeachers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesFilter = filter === 'ALL' || t.profile?.validationStatus === filter;
    const matchesSearch = searchQuery === '' || 
      `${t.user?.firstName} ${t.user?.lastName} ${t.user?.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusConfig = {
    PENDING: { label: 'En attente', icon: Clock, colorClass: 'text-yellow-600', bgClass: 'bg-yellow-100' },
    VERIFIED: { label: 'Vérifié', icon: CheckCircle, colorClass: 'text-green-600', bgClass: 'bg-green-100' },
    REJECTED: { label: 'Rejeté', icon: XCircle, colorClass: 'text-red-600', bgClass: 'bg-red-100' },
  };

  const counts = {
    ALL: teachers.length,
    PENDING: teachers.filter(t => t.profile?.validationStatus === 'PENDING').length,
    VERIFIED: teachers.filter(t => t.profile?.validationStatus === 'VERIFIED').length,
    REJECTED: teachers.filter(t => t.profile?.validationStatus === 'REJECTED').length,
  };

  function getStatusBadge(status: Status) {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bgClass} ${config.colorClass}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Validation des enseignants</h1>
        <p className="text-sm sm:text-base text-gray-600">Vérifiez et validez les profils des enseignants</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        
        {/* Status tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
          {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                filter === status
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'Tous' : statusConfig[status].label}
              <span className="ml-2 opacity-75">({counts[status]})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <User className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">Aucun enseignant trouvé</p>
          </div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="block lg:hidden divide-y divide-gray-100">
              {filteredTeachers.map((teacher) => {
                const status = teacher.profile?.validationStatus || 'PENDING';
                const isPending = status === 'PENDING';

                return (
                  <div key={teacher.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-bold text-lg">
                          {teacher.user?.firstName?.[0] || '?'}{teacher.user?.lastName?.[0] || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base">
                          {teacher.user?.firstName || 'N/A'} {teacher.user?.lastName || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{teacher.user?.email || 'N/A'}</p>
                        {teacher.user?.phone && (
                          <p className="text-xs text-gray-500">{teacher.user.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      {getStatusBadge(status)}
                    </div>

                    {teacher.profile?.subjects && teacher.profile.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {teacher.profile.subjects.slice(0, 3).map((subject, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {subject}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mb-3">
                      <a
                        href={`/teacher/${teacher.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Eye size={16} />
                        Voir le profil public
                      </a>
                    </div>

                    {isPending && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleValidate(teacher.id, 'VERIFIED')}
                          className="flex-1"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleValidate(teacher.id, 'REJECTED')}
                          className="flex-1 text-red-600 hover:bg-red-50"
                        >
                          <XCircle size={14} className="mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Enseignant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Matières</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeachers.map((teacher) => {
                    const status = teacher.profile?.validationStatus || 'PENDING';
                    const isPending = status === 'PENDING';

                    return (
                      <tr key={teacher.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-primary-700 font-bold">
                                {teacher.user?.firstName?.[0] || '?'}{teacher.user?.lastName?.[0] || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {teacher.user?.firstName || 'N/A'} {teacher.user?.lastName || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{teacher.user?.email || 'N/A'}</p>
                          {teacher.user?.phone && (
                            <p className="text-xs text-gray-500">{teacher.user.phone}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {teacher.profile?.subjects && teacher.profile.subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {teacher.profile.subjects.slice(0, 3).map((subject, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {subject}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/teacher/${teacher.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                            >
                              <Eye size={14} />
                              Voir
                            </a>
                            {isPending && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleValidate(teacher.id, 'VERIFIED')}
                                >
                                  <CheckCircle size={14} className="mr-1" />
                                  Valider
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleValidate(teacher.id, 'REJECTED')}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <XCircle size={14} className="mr-1" />
                                  Rejeter
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
