import { useMemo } from 'react';

interface PasswordValidation {
  isValid: boolean;
  checks: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  errors: string[];
}

export function usePasswordValidation(password: string): PasswordValidation {
  return useMemo(() => {
    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const errors: string[] = [];
    if (!checks.minLength) errors.push('Le mot de passe doit contenir au moins 8 caractères');
    if (!checks.hasUpperCase) errors.push('Le mot de passe doit contenir au moins une majuscule');
    if (!checks.hasNumber) errors.push('Le mot de passe doit contenir au moins un chiffre');
    if (!checks.hasSpecialChar) errors.push('Le mot de passe doit contenir au moins un caractère spécial');

    return {
      isValid: Object.values(checks).every(Boolean),
      checks,
      errors,
    };
  }, [password]);
}
