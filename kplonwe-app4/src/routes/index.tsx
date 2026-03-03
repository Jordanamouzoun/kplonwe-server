import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';

// Public
import { LandingPage }  from '@/pages/public/LandingPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

// Auth
import { LoginPage }    from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Legal
import { TermsPage } from '@/pages/legal/TermsPage';
import { PrivacyPage } from '@/pages/legal/PrivacyPage';

// Dashboard
import { DashboardRouter } from '@/pages/dashboard/DashboardRouter';

// Quiz, Wallet, Messages, Settings
import { QuizTakePage }     from '@/pages/quiz/QuizTakePage';
import { QuizResultsPage }  from '@/pages/quiz/QuizResultsPage';
import { QuizCreatePage }   from '@/pages/quiz/QuizCreatePage';
import { WalletPage }       from '@/pages/wallet/WalletPage';
import { AccessibilitySettingsPage } from '@/pages/settings/AccessibilitySettingsPage';
import { MessagesListPage }  from '@/pages/messages/MessagesListPage';
import { ConversationPage }  from '@/pages/messages/ConversationPage';

// Orientation
import { OrientationPage } from '@/pages/orientation/OrientationPage';

// Teacher
import { TeacherProfilePage }     from '@/pages/teacher/TeacherProfilePage';
import { TeacherProfileEditPage } from '@/pages/teacher/TeacherProfileEditPage';
import { TeacherDocumentsPage }   from '@/pages/teacher/TeacherDocumentsPage';
import { TeacherAvatarUploadPage } from '@/pages/teacher/TeacherAvatarUploadPage';
import { TeacherMyProfilePage }   from '@/pages/teacher/TeacherMyProfilePage';
import { TeachersSearchPage }     from '@/pages/teachers/TeachersSearchPage';

// ── ADMIN ──────────────────────────────────────────────────────────────────
import { AdminDashboardPage }    from '@/pages/admin/AdminDashboardPage';
import { AdminTeachersPage }     from '@/pages/admin/AdminTeachersPage';
import { AdminParentsPage }      from '@/pages/admin/AdminParentsPage';
import { AdminSchoolsPage }      from '@/pages/admin/AdminSchoolsPage';
import { AdminManageAdminsPage } from '@/pages/admin/AdminManageAdminsPage';

// ── Composants utilitaires ─────────────────────────────────────────────────

function WalletProtectedRoute() {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-yellow-900 mb-4">Accès non autorisé</h1>
            <p className="text-yellow-800 mb-6">Les comptes élèves n'ont pas accès au portefeuille.</p>
            <a href="/dashboard" className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              Retour au tableau de bord
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }
  return <MainLayout><WalletPage /></MainLayout>;
}

/** Protège toutes les routes /admin/* */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return <AdminLayout>{children}</AdminLayout>;
}

// ── APP ROUTES ─────────────────────────────────────────────────────────────

export function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={
        <MainLayout>{user ? <Navigate to="/dashboard" replace /> : <LandingPage />}</MainLayout>
      } />
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <MainLayout><LoginPage /></MainLayout>} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <MainLayout><RegisterPage /></MainLayout>} />
      
      {/* ── Legal ── */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* ── Dashboard (rôles non-admin) ── */}
      <Route path="/dashboard" element={
        user?.role === 'ADMIN'
          ? <Navigate to="/admin/dashboard" replace />
          : <ProtectedRoute><MainLayout><DashboardRouter /></MainLayout></ProtectedRoute>
      } />

      {/* ── Quiz ── */}
      <Route path="/quiz/:quizId/take"    element={<ProtectedRoute><MainLayout><QuizTakePage /></MainLayout></ProtectedRoute>} />
      <Route path="/quiz/:quizId/results" element={<ProtectedRoute><MainLayout><QuizResultsPage /></MainLayout></ProtectedRoute>} />
      <Route path="/quiz/create"          element={<ProtectedRoute><MainLayout><QuizCreatePage /></MainLayout></ProtectedRoute>} />

      {/* ── Wallet ── */}
      <Route path="/wallet" element={<ProtectedRoute><WalletProtectedRoute /></ProtectedRoute>} />

      {/* ── Messages ── */}
      <Route path="/messages"               element={<ProtectedRoute><MainLayout><MessagesListPage /></MainLayout></ProtectedRoute>} />
      <Route path="/messages/:conversationId" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />

      {/* ── Profil public professeur ── */}
      <Route path="/teacher/:teacherId" element={<MainLayout><TeacherProfilePage /></MainLayout>} />

      {/* ── Recherche professeurs (bloquée aux profs) ── */}
      <Route path="/teachers" element={
        user?.role === 'TEACHER'
          ? <Navigate to="/dashboard" replace />
          : <MainLayout><TeachersSearchPage /></MainLayout>
      } />

      {/* ── Pages privées professeur ── */}
      <Route path="/teacher/profile/edit"   element={<ProtectedRoute><MainLayout><TeacherProfileEditPage /></MainLayout></ProtectedRoute>} />
      <Route path="/teacher/profile/avatar" element={<ProtectedRoute><MainLayout><TeacherAvatarUploadPage /></MainLayout></ProtectedRoute>} />
      <Route path="/teacher/documents"      element={<ProtectedRoute><MainLayout><TeacherDocumentsPage /></MainLayout></ProtectedRoute>} />

      {/* ── Settings ── */}
      <Route path="/settings/accessibility" element={<MainLayout><AccessibilitySettingsPage /></MainLayout>} />

      {/* ── ADMIN ── */}
      <Route path="/admin"              element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard"    element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/teachers"     element={<AdminRoute><AdminTeachersPage /></AdminRoute>} />
      <Route path="/admin/parents"      element={<AdminRoute><AdminParentsPage /></AdminRoute>} />
      <Route path="/admin/schools"      element={<AdminRoute><AdminSchoolsPage /></AdminRoute>} />
      <Route path="/admin/manage-admins" element={<AdminRoute><AdminManageAdminsPage /></AdminRoute>} />

      {/* ── Orientation ── */}
      <Route path="/orientation/:studentId" element={
        <ProtectedRoute><MainLayout><OrientationPage /></MainLayout></ProtectedRoute>
      } />
      <Route path="/orientation" element={
        <ProtectedRoute><MainLayout><OrientationPage /></MainLayout></ProtectedRoute>
      } />

      {/* ── 404 ── */}
      <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
    </Routes>
  );
}
