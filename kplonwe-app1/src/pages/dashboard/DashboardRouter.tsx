import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StudentDashboard } from './StudentDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { SchoolDashboard } from './SchoolDashboard';
import { ParentDashboard } from './ParentDashboard';

export function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'STUDENT': return <StudentDashboard />;
    case 'TEACHER': return <TeacherDashboard />;
    case 'SCHOOL':  return <SchoolDashboard />;
    case 'PARENT':  return <ParentDashboard />;
    case 'ADMIN':   return <Navigate to="/admin/dashboard" replace />;
    default:        return <Navigate to="/" replace />;
  }
}
