import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Home, MessageSquare, Wallet, Settings, LogOut } from 'lucide-react';

function buildAvatarUrl(avatar: string | null | undefined): string | null {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${avatar}`;
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const avatarUrl = buildAvatarUrl(user?.avatar);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 md:h-28">
          
          {/* Logo */}
          <Link
            to={user ? '/dashboard' : '/'}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <img 
              src="/logo-kplonwe.png" 
              alt="KPLONWE" 
              className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain"
            />
          </Link>

          {user ? (
            <>
              {/* Desktop Navigation - visible à partir de md (768px) */}
              <nav className="hidden md:flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Home size={18} />
                  <span>Tableau de bord</span>
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <MessageSquare size={18} />
                  <span>Messages</span>
                </Link>
                {user.role !== 'STUDENT' && (
                  <Link
                    to="/wallet"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Wallet size={18} />
                    <span>Portefeuille</span>
                  </Link>
                )}
              </nav>

              {/* Desktop User Menu - visible à partir de md (768px) */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/settings/accessibility"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Paramètres"
                >
                  <Settings size={20} />
                </Link>
                
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold text-sm">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500 uppercase">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Déconnexion"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button - visible SEULEMENT en dessous de md (< 768px) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
                type="button"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          ) : (
            /* Non connecté */
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/settings/accessibility"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Accessibilité"
              >
                <Settings size={20} />
              </Link>
              <Link
                to="/login"
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 rounded-lg transition-colors hidden sm:block"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="px-3 sm:px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay + Panel - visible SEULEMENT sur mobile quand ouvert */}
      {user && mobileMenuOpen && (
        <>
          {/* Overlay sombre cliquable */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Panel menu slide depuis la droite */}
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white shadow-2xl z-50 md:hidden overflow-y-auto">
            <div className="flex flex-col h-full">
              
              {/* Header du panel */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-bold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm break-words leading-tight">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500 uppercase">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={20} />
                  <span className="font-medium">Tableau de bord</span>
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare size={20} />
                  <span className="font-medium">Messages</span>
                </Link>
                {user.role !== 'STUDENT' && (
                  <Link
                    to="/wallet"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Wallet size={20} />
                    <span className="font-medium">Portefeuille</span>
                  </Link>
                )}
                
                <div className="border-t border-gray-200 my-2" />
                
                <Link
                  to="/settings/accessibility"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings size={20} />
                  <span className="font-medium">Paramètres</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  type="button"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 text-center">
                <img 
                  src="/logo-kplonwe.png" 
                  alt="KPLONWE" 
                  className="h-16 sm:h-20 w-auto mx-auto mb-2 object-contain"
                />
                <p className="text-xs text-gray-500">© 2026</p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
