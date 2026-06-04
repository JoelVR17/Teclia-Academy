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
  return null;
};

export const PASSWORD_HINT = 'Mínimo 8 caracteres, con letras y números.';
