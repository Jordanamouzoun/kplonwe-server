import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserAvatar: (avatarPath: string) => void;   // ← mise à jour instantanée
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isParent: boolean;
  isStudent: boolean;
  isSchool: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Parse un champ qui peut être soit un Array JS, soit une string JSON.
 * Retourne toujours un vrai tableau — jamais une string.
 */
function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Normalise l'objet user reçu du backend.
 * - subjects / levels / certifications : toujours des tableaux JS
 * - Préserve tous les autres champs dont `avatar`
 */
function normalizeUser(raw: User | null): User | null {
  if (!raw) return null;
  if (!raw.teacherProfile) return raw;
  return {
    ...raw,
    teacherProfile: {
      ...raw.teacherProfile,
      subjects:       parseJsonArray((raw.teacherProfile as any).subjects),
      levels:         parseJsonArray((raw.teacherProfile as any).levels),
      certifications: parseJsonArray((raw.teacherProfile as any).certifications),
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    try {
      if (authService.isAuthenticated()) {
        // 1. Charger immédiatement depuis le cache (instant)
        const cachedUser = authService.getCurrentUser();
        if (cachedUser) setUser(normalizeUser(cachedUser));

        // 2. Rafraîchir depuis le serveur en arrière-plan
        try {
          const freshUser = await authService.getProfile();
          setUser(normalizeUser(freshUser));
        } catch {
          // token expiré ou réseau — on garde le cache
        }
      }
    } catch {
      // session invalide
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials: LoginCredentials) {
    const authResponse = await authService.login(credentials);
    setUser(normalizeUser(authResponse.user));
  }

  async function register(userData: RegisterData) {
    const authResponse = await authService.register(userData);
    setUser(normalizeUser(authResponse.user));
  }

  async function logout() {
    await authService.logout();
    setUser(null);
    window.location.href = '/login';
  }

  async function refreshProfile() {
    if (!authService.isAuthenticated()) return;
    const freshUser = await authService.getProfile();
    setUser(normalizeUser(freshUser));
  }

  /**
   * Met à jour l'avatar dans le state ET dans localStorage immédiatement,
   * sans attendre un round-trip vers le serveur.
   * Appeler après un upload réussi pour un affichage instantané.
   */
  function updateUserAvatar(avatarPath: string) {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: avatarPath };
      // Synchroniser localStorage pour la persistance après F5
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem('user', JSON.stringify({ ...parsed, avatar: avatarPath }));
        }
      } catch { /* ignore */ }
      return updated;
    });
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    updateUserAvatar,
    isAuthenticated: !!user,
    isAdmin:   user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
    isParent:  user?.role === 'PARENT',
    isStudent: user?.role === 'STUDENT',
    isSchool:  user?.role === 'SCHOOL',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
