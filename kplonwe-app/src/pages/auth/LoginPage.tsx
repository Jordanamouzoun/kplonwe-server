import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LogIn } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  'Email ou mot de passe incorrect': 'L\'email ou le mot de passe que vous avez saisi est incorrect',
  'Network Error': 'Problème de connexion au serveur. Veuillez réessayer',
  'timeout': 'La requête a pris trop de temps. Veuillez réessayer',
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGlobalError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';
      setGlobalError(ERROR_MESSAGES[errorMessage] || errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Connexion</h1>
          <p className="mt-2 text-gray-600">
            Pas encore de compte ?{' '}
            <Link 
              to="/register" 
              className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              Créer un compte
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          {globalError && (
            <div 
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" 
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <p className="font-medium">Erreur de connexion</p>
              <p className="text-sm mt-1">{globalError}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Adresse email"
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              error={errors.email}
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Mot de passe"
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              required
              autoComplete="current-password"
            />
          </div>

          <Button 
            type="submit" 
            loading={loading} 
            fullWidth 
            size="lg"
          >
            <LogIn className="mr-2" size={20} aria-hidden="true" />
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
