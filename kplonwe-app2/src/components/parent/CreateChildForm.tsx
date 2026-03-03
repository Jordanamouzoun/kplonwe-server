import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PasswordRequirements } from '@/components/auth/PasswordRequirements';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import { api } from '@/lib/api';
import { UserPlus, X } from 'lucide-react';

interface CreateChildFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (child: any) => void;
}

export function CreateChildForm({ isOpen, onClose, onSuccess }: CreateChildFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPasswordReqs, setShowPasswordReqs] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const passwordValidation = usePasswordValidation(formData.password);

  const grades = [
    'CP', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème', '5ème', '4ème', '3ème',
    '2nde', '1ère', 'Terminale'
  ];

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.grade) {
      newErrors.grade = 'La classe est requise';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (!passwordValidation.isValid) {
      newErrors.password = 'Le mot de passe ne respecte pas tous les critères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Appel API backend pour créer l'enfant
      const response = await api.post('/children', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        grade: formData.grade,
      });

      // Gérer le format de réponse avec success: true
      const childData = response.data.success ? response.data.child : response.data;

      setSuccessMessage(`Le compte de ${formData.firstName} a été créé avec succès !`);
      
      setTimeout(() => {
        onSuccess(childData);
        handleClose();
      }, 1500);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la création du compte';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      grade: '',
    });
    setErrors({});
    setSuccessMessage('');
    setShowPasswordReqs(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Créer un compte enfant" size="lg">
      <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-sm text-blue-900">
          <strong>Information importante :</strong> Vous allez créer un compte pour votre enfant.
          Ce compte sera automatiquement lié à votre compte parent et vous pourrez suivre sa progression.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {successMessage && (
          <div
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
            role="alert"
            aria-live="polite"
          >
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prénom de l'enfant"
            id="child-firstName"
            value={formData.firstName}
            onChange={(e) => {
              setFormData({ ...formData, firstName: e.target.value });
              if (errors.firstName) setErrors({ ...errors, firstName: '' });
            }}
            error={errors.firstName}
            required
            autoFocus
          />

          <Input
            label="Nom de l'enfant"
            id="child-lastName"
            value={formData.lastName}
            onChange={(e) => {
              setFormData({ ...formData, lastName: e.target.value });
              if (errors.lastName) setErrors({ ...errors, lastName: '' });
            }}
            error={errors.lastName}
            required
          />
        </div>

        <div>
          <label htmlFor="child-grade" className="block text-sm font-medium text-gray-700 mb-1">
            Classe <span className="text-red-500" aria-label="requis">*</span>
          </label>
          <select
            id="child-grade"
            value={formData.grade}
            onChange={(e) => {
              setFormData({ ...formData, grade: e.target.value });
              if (errors.grade) setErrors({ ...errors, grade: '' });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.grade ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-label="Sélectionner la classe de l'enfant"
          >
            <option value="">Sélectionner une classe</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          {errors.grade && (
            <p className="text-sm text-red-600 mt-1" role="alert">
              {errors.grade}
            </p>
          )}
        </div>

        <Input
          label="Adresse email de l'enfant"
          id="child-email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          error={errors.email}
          helperText="Cette adresse servira à la connexion de votre enfant"
          required
        />

        <div>
          <Input
            label="Mot de passe pour l'enfant"
            id="child-password"
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            onFocus={() => setShowPasswordReqs(true)}
            error={errors.password}
            helperText="Votre enfant utilisera ce mot de passe pour se connecter"
            required
          />
          <PasswordRequirements
            checks={passwordValidation.checks}
            show={showPasswordReqs && formData.password.length > 0}
          />
        </div>

        <Input
          label="Confirmer le mot de passe"
          id="child-confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => {
            setFormData({ ...formData, confirmPassword: e.target.value });
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
          }}
          error={errors.confirmPassword}
          required
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            fullWidth
            disabled={loading}
          >
            <X size={20} className="mr-2" aria-hidden="true" />
            Annuler
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={
              !formData.firstName ||
              !formData.lastName ||
              !formData.email ||
              !formData.grade ||
              !passwordValidation.isValid ||
              formData.password !== formData.confirmPassword ||
              loading
            }
            fullWidth
          >
            <UserPlus size={20} className="mr-2" aria-hidden="true" />
            Créer le compte
          </Button>
        </div>
      </form>
    </Modal>
  );
}
