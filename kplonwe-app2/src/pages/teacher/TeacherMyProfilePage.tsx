import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeacherProfilePage } from './TeacherProfilePage';
import { api } from '@/lib/api';

/**
 * Page pour afficher le profil public du professeur connecté
 * Charge l'ID du profil puis redirige vers TeacherProfilePage
 */
export function TeacherMyProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyProfile();
  }, []);

  async function loadMyProfile() {
    try {
      setLoading(true);
      const response = await api.get('/teachers/me/profile');
      if (response.data.success && response.data.profile) {
        // Rediriger vers la page profil avec l'ID
        navigate(`/teachers/${response.data.profile.id}`, { replace: true });
      }
    } catch (error) {
      // Si erreur, retourner au dashboard
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Chargement de votre profil...</p>
      </div>
    );
  }

  return null;
}
