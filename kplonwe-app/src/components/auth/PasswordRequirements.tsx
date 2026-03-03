import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
  checks: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  show: boolean;
}

export function PasswordRequirements({ checks, show }: PasswordRequirementsProps) {
  if (!show) return null;

  const requirements = [
    { label: 'Au moins 8 caractères', met: checks.minLength },
    { label: 'Au moins une majuscule', met: checks.hasUpperCase },
    { label: 'Au moins un chiffre', met: checks.hasNumber },
    { label: 'Au moins un caractère spécial (!@#$%...)', met: checks.hasSpecialChar },
  ];

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm font-medium text-gray-700 mb-2">Le mot de passe doit contenir :</p>
      <ul className="space-y-1" role="list">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <Check size={16} className="text-green-600 flex-shrink-0" aria-hidden="true" />
            ) : (
              <X size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
            )}
            <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
