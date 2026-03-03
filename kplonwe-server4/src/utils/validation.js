import validator from 'validator';

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email);
};

export const isValidBeninPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const patterns = [/^\+229\d{8}$/, /^229\d{8}$/, /^0\d{8}$/, /^\d{8}$/];
  return patterns.some(pattern => pattern.test(cleaned));
};

export const formatBeninPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('0')) return `+229${cleaned.substring(1)}`;
  if (cleaned.startsWith('229')) return `+${cleaned}`;
  if (cleaned.startsWith('+229')) return cleaned;
  if (/^\d{8}$/.test(cleaned)) return `+229${cleaned}`;
  return phone;
};

export default { isValidEmail, isValidBeninPhone, formatBeninPhone };
