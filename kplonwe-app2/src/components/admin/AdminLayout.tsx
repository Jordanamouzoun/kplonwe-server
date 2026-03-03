import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, GraduationCap, Users, School,
  ShieldCheck, LogOut, ChevronRight, Menu, X
} from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard',       icon: LayoutDashboard, label: 'Dashboard'        },
  { to: '/admin/teachers',        icon: GraduationCap,   label: 'Professeurs'      },
  { to: '/admin/parents',         icon: Users,           label: 'Parents'           },
  { to: '/admin/schools',         icon: School,          label: 'Écoles'            },
  { to: '/admin/manage-admins',   icon: ShieldCheck,     label: 'Administrateurs'  },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white h-16 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <img 
            src="/logo-kplonwe.png" 
            alt="KPLONWE" 
            className="h-8 w-auto object-contain"
          />
          <span className="text-xs text-gray-400">Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-16"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - Responsive */}
      <aside className={`
        fixed lg:static top-16 lg:top-0 left-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col z-50
        transition-transform duration-300 lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo - Desktop only */}
        <div className="hidden lg:block px-6 py-5 border-b border-gray-700">
          <img 
            src="/logo-kplonwe.png" 
            alt="KPLONWE" 
            className="h-10 w-auto object-contain mb-2"
          />
          <p className="text-xs text-gray-400 uppercase tracking-widest">Administration</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer user */}
        <div className="px-4 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 truncate mb-1">{user?.email}</p>
          <p className="text-sm font-medium text-white mb-3 truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main - Responsive padding */}
      <main className="flex-1 w-full lg:w-auto overflow-auto pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
