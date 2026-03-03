import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ShieldCheck, Plus, Trash2, X, Eye, EyeOff } from 'lucide-react';

interface AdminUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: string;
  isActive: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {msg}
    </div>
  );
}

export function AdminManageAdminsPage() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins]       = useState<AdminUser[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPwd, setShowPwd]     = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [form, setForm]           = useState<FormData>({ firstName: '', lastName: '', email: '', password: '' });
  const [errors, setErrors]       = useState<Partial<FormData>>({});

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    try {
      const res = await api.get('/admin/admins');
      setAdmins(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.firstName.trim()) e.firstName = 'Prénom requis';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (!form.password || form.password.length < 8) e.password = 'Minimum 8 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await api.post('/admin/admins', form);
      setAdmins(prev => [...prev, res.data.data]);
      setForm({ firstName: '', lastName: '', email: '', password: '' });
      setShowForm(false);
      showToast('Administrateur créé avec succès ✓', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors de la création', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(admin: AdminUser) {
    if (admin.id === currentUser?.id) {
      showToast('Vous ne pouvez pas supprimer votre propre compte', 'error');
      return;
    }
    setDeletingId(admin.id);
    try {
      await api.delete(`/admin/admins/${admin.id}`);
      setAdmins(prev => prev.filter(a => a.id !== admin.id));
      showToast('Administrateur supprimé', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  }

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer l'administrateur ?</h3>
            <p className="text-sm text-gray-600 mb-5">
              <span className="font-medium">{confirmDelete.firstName} {confirmDelete.lastName}</span> ({confirmDelete.email})<br/>
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === confirmDelete.id ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
            <ShieldCheck size={20} className="text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administrateurs</h1>
            <p className="text-sm text-gray-500">{admins.length} admin{admins.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Annuler' : 'Ajouter un admin'}
        </button>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nouvel administrateur</h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${errors.firstName ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Jean"
              />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Dupont"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="jean@exemple.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Min. 8 caractères"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Annuler
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50">
                {saving ? 'Création…' : 'Créer l\'administrateur'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement…</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nom</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Créé le</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.map(a => {
                const isSelf = a.id === currentUser?.id;
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">
                          {(a.firstName?.[0] ?? '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{a.firstName} {a.lastName}</p>
                          {isSelf && <p className="text-xs text-primary-600 font-semibold">Vous</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.email}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className="text-xs text-gray-400 italic">—</span>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(a)}
                          disabled={deletingId === a.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
