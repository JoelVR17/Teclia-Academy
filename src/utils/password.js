export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(password)) {
    return 'La contraseña debe incluir letras';
  }
  if (!/[0-9]/.test(password)) {
    return 'La contraseña debe incluir números';
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
    return 'La contraseña debe incluir al menos un carácter especial';
  }
  return null;
};

export const PASSWORD_HINT = 'Mínimo 8 caracteres, con letras, números y un carácter especial.';

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', level: 'none' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) score += 1;
  if (password.length >= 16) score += 1;
  if (score <= 1) return { score, label: 'Débil', level: 'weak' };
  if (score <= 3) return { score, label: 'Media', level: 'medium' };
  if (score <= 4) return { score, label: 'Fuerte', level: 'strong' };
  return { score, label: 'Muy fuerte', level: 'very-strong' };
};
