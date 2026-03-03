import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import {
  Users, GraduationCap, School, CheckCircle,
  Clock, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { PMFCohortTable } from '@/components/admin/PMFCohortTable';


interface Stats {
  totalTeachers: number;
  verifiedTeachers: number;
  pendingTeachers: number;
  rejectedTeachers: number;
  totalParents: number;
  totalSchools: number;
  totalAdmins: number;
  totalStudents: number;
}

function StatCard({ label, value, icon, color, href }: {
  label: string; value: number; icon: React.ReactNode;
  color: string; href?: string;
}) {
  const inner = (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 ${href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch {
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-gray-500">Chargement des statistiques…</div>;
  if (error) return <div className="text-red-500 bg-red-50 rounded-lg p-4">{error}</div>;
  if (!stats) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">Vue d'ensemble de la plateforme KPLONWE</p>

      {/* Alerte pending */}
      {stats.pendingTeachers > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">
              {stats.pendingTeachers} professeur{stats.pendingTeachers > 1 ? 's' : ''} en attente de validation
            </p>
            <Link to="/admin/teachers" className="text-sm text-amber-600 hover:underline">
              Voir les demandes →
            </Link>
          </div>
        </div>
      )}

      {/* Grille stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Professeurs"
          value={stats.totalTeachers}
          icon={<GraduationCap size={24} className="text-blue-600" />}
          color="bg-blue-50"
          href="/admin/teachers"
        />
        <StatCard
          label="Professeurs validés"
          value={stats.verifiedTeachers}
          icon={<CheckCircle size={24} className="text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          label="En attente de validation"
          value={stats.pendingTeachers}
          icon={<Clock size={24} className="text-amber-600" />}
          color="bg-amber-50"
          href="/admin/teachers"
        />
        <StatCard
          label="Parents"
          value={stats.totalParents}
          icon={<Users size={24} className="text-purple-600" />}
          color="bg-purple-50"
          href="/admin/parents"
        />
        <StatCard
          label="Écoles"
          value={stats.totalSchools}
          icon={<School size={24} className="text-indigo-600" />}
          color="bg-indigo-50"
          href="/admin/schools"
        />
        <StatCard
          label="Administrateurs"
          value={stats.totalAdmins}
          icon={<ShieldCheck size={24} className="text-rose-600" />}
          color="bg-rose-50"
          href="/admin/manage-admins"
        />
      </div>

      {/* Raccourcis */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { to: '/admin/teachers', label: 'Gérer les professeurs', icon: GraduationCap, bg: 'bg-blue-600' },
          { to: '/admin/parents', label: 'Voir les parents', icon: Users, bg: 'bg-purple-600' },
          { to: '/admin/schools', label: 'Voir les écoles', icon: School, bg: 'bg-indigo-600' },
          { to: '/admin/manage-admins', label: 'Gérer les admins', icon: ShieldCheck, bg: 'bg-rose-600' },
        ].map(({ to, label, icon: Icon, bg }) => (
          <Link
            key={to}
            to={to}
            className={`${bg} text-white rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity`}
          >
            <Icon size={20} />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── PMF Cohort Table ─────────────────────────────────────────────── */}
      <PMFCohortTable />
    </div>
  );
}
