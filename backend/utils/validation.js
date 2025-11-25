// ═══════════════════════════════════════════════════════
// VALIDATION UTILITIES - Валидация входных данных
// ═══════════════════════════════════════════════════════

const validator = require('validator');

/**
 * Валидация email
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Валидация пароля
 * Требования:
 * - Минимум 8 символов
 * - Минимум 1 заглавная буква
 * - Минимум 1 строчная буква
 * - Минимум 1 цифра
 */
const isValidPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false; // Заглавная буква
  if (!/[a-z]/.test(password)) return false; // Строчная буква
  if (!/[0-9]/.test(password)) return false; // Цифра
  return true;
};

/**
 * Валидация username
 * Требования:
 * - От 3 до 30 символов
 * - Только буквы, цифры, подчёркивание
 */
const isValidUsername = (username) => {
  if (username.length < 3 || username.length > 30) return false;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;
  return true;
};

/**
 * Санитизация строк (защита от XSS)
 */
const sanitizeString = (str) => {
  return validator.escape(str.trim());
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  sanitizeString,
};