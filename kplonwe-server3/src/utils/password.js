import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const validatePasswordStrength = (password) => {
  const errors = [];
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Mot de passe requis'] };
  }
  if (password.length < 8) {
    errors.push('Minimum 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Au moins un chiffre');
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/\`~]/.test(password)) {
    errors.push('Au moins un caractère spécial');
  }
  return { isValid: errors.length === 0, errors };
};

export default { hashPassword, comparePassword, validatePasswordStrength };
