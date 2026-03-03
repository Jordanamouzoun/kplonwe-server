import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordRequirements } from '@/components/auth/PasswordRequirements';
import { UserPlus, AlertCircle, Eye, EyeOff, Check, Users, GraduationCap, Building2 } from 'lucide-react';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    role: 'PARENT' as 'PARENT' | 'TEACHER' | 'SCHOOL',
    termsAccepted: false,
    schoolName: '',
    location: '',
  });

  const { isValid, checks } = usePasswordValidation(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValid) {
      setError('Le mot de passe ne respecte pas les critères requis');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    setLoading(true);
    try {
      await registerUser(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { 
      value: 'PARENT', 
      label: 'Parent', 
      icon: Users,
      description: 'Suivez la progression de vos enfants',
      color: 'bg-blue-50 border-blue-500 text-blue-700'
    },
    { 
      value: 'TEACHER', 
      label: 'Enseignant', 
      icon: GraduationCap,
      description: 'Proposez vos services d\'enseignement',
      color: 'bg-green-50 border-green-500 text-green-700'
    },
    { 
      value: 'SCHOOL', 
      label: 'École', 
      icon: Building2,
      description: 'Gérez vos quiz et vos enseignants',
      color: 'bg-purple-50 border-purple-500 text-purple-700'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="text-primary-600">KPL</span>
              <span className="text-[#FDB32A]">O</span>
              <span className="text-primary-600">NWE</span>
            </h1>
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Créer un compte</h2>
          <p className="text-sm sm:text-base text-gray-600">Rejoignez des centaines d'utilisateurs</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
          
          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Je suis...
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.value;
                  return (
                    <label
                      key={role.value}
                      className={`
                        relative cursor-pointer rounded-xl border-2 p-4 transition-all
                        ${isSelected 
                          ? `${role.color} border-current` 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={isSelected}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center text-center gap-2">
                        <Icon size={32} className={isSelected ? 'text-current' : 'text-gray-400'} />
                        <div>
                          <div className="font-bold text-gray-900 mb-1">{role.label}</div>
                          <div className="text-xs text-gray-600">{role.description}</div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check size={20} className="text-current" />
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  {formData.role === 'SCHOOL' ? 'Nom de l\'école *' : 'Prénom *'}
                </label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder={formData.role === 'SCHOOL' ? 'Collège Saint-Jean' : 'Jean'}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  {formData.role === 'SCHOOL' ? 'Ville/Commune *' : 'Nom *'}
                </label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder={formData.role === 'SCHOOL' ? 'Cotonou' : 'Dupont'}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vous@exemple.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone (optionnel)
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+229 XX XX XX XX"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-3">
                  <PasswordRequirements checks={checks} show={true} />
                </div>
              )}
            </div>

            {/* Password Confirm */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <Input
                  id="passwordConfirm"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  placeholder="••••••••"
                  required
                  className={`pr-12 ${
                    formData.passwordConfirm && formData.password !== formData.passwordConfirm
                      ? 'border-red-500 focus:ring-red-500'
                      : formData.passwordConfirm && formData.password === formData.passwordConfirm
                      ? 'border-green-500 focus:ring-green-500'
                      : ''
                  }`}
                />
                {formData.passwordConfirm && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {formData.password === formData.passwordConfirm ? (
                      <Check className="text-green-500" size={18} />
                    ) : (
                      <AlertCircle className="text-red-500" size={18} />
                    )}
                  </div>
                )}
              </div>
              {formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                <p className="text-xs text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded border-gray-300 mt-0.5 flex-shrink-0"
                  required
                />
                <span className="text-sm text-gray-700">
                  J'accepte les{' '}
                  <Link to="/terms" target="_blank" className="text-primary-600 hover:text-primary-700 font-medium underline">
                    conditions d'utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link to="/privacy" target="_blank" className="text-primary-600 hover:text-primary-700 font-medium underline">
                    politique de confidentialité
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              disabled={loading || !isValid}
              className="h-12 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Inscription...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus size={20} />
                  Créer mon compte
                </span>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
