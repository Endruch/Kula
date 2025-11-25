// ═══════════════════════════════════════════════════════
// AUTH ROUTES - API ДЛЯ АВТОРИЗАЦИИ
// ═══════════════════════════════════════════════════════
// SECURITY FEATURES:
// ✅ Email/Password validation
// ✅ Username sanitization
// ✅ Stronger bcrypt (12 rounds)
// ✅ Refresh tokens
// ✅ No JWT_SECRET fallback
// ✅ Timing-attack protection
//
// TODO для продакшена:
// ⏳ Email verification (требует SMTP)
// ⏳ 2FA (требует SMS/Authenticator)
// ⏳ Account lockout after N failed attempts
// ⏳ Password reset flow
// ═══════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { 
  isValidEmail, 
  isValidPassword, 
  isValidUsername,
  sanitizeString 
} = require('../utils/validation');

const prisma = new PrismaClient();

// JWT Secrets - БЕЗ FALLBACK! Если нет в .env - сервер упадёт (так и надо)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '30d';

// Проверка что секреты установлены
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET или JWT_REFRESH_SECRET не установлены в .env');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * Генерация access и refresh токенов
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRATION,
  });

  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION,
  });

  return { accessToken, refreshToken };
};

/**
 * Форматирование данных пользователя (без пароля!)
 */
const formatUser = (user) => {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    accountType: user.accountType,
    createdAt: user.createdAt,
  };
};

// ═══════════════════════════════════════════════════════
// POST /api/auth/register - Регистрация
// ═══════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // 1. Валидация наличия полей
    if (!email || !username || !password) {
      return res.status(400).json({ 
        error: 'Все поля обязательны' 
      });
    }

    // 2. Валидация email
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Некорректный email адрес' 
      });
    }

    // 3. Валидация username
    if (!isValidUsername(username)) {
      return res.status(400).json({ 
        error: 'Username должен быть от 3 до 30 символов и содержать только буквы, цифры и подчёркивание' 
      });
    }

    // 4. Валидация пароля
    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        error: 'Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, и цифры' 
      });
    }

    // 5. Санитизация username (защита от XSS)
    const sanitizedUsername = sanitizeString(username);

    // 6. Проверяем существует ли пользователь
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() }, // email в lowercase
          { username: sanitizedUsername }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email или username уже используется' 
      });
    }

    // 7. Хэшируем пароль (12 rounds вместо 10)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 8. Создаём пользователя
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(), // Храним email в lowercase
        username: sanitizedUsername,
        password: hashedPassword,
      },
    });

    // 9. Генерируем токены
    const { accessToken, refreshToken } = generateTokens(user.id);

    console.log('✅ Пользователь зарегистрирован:', user.username);

    // 10. Отправляем ответ
    res.status(201).json({
      accessToken,
      refreshToken,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ═══════════════════════════════════════════════════════
// POST /api/auth/login - Вход
// ═══════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Валидация наличия полей
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email и пароль обязательны' 
      });
    }

    // 2. Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // 3. Timing-attack protection: всегда проверяем пароль
    // Даже если пользователь не найден, делаем фейковую проверку
    const hashedPassword = user 
      ? user.password 
      : await bcrypt.hash('fake_password', 12);

    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    // 4. Проверяем результат (одинаковое сообщение для обоих случаев)
    if (!user || !isPasswordValid) {
      return res.status(400).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // TODO: Проверка на бан
    // if (user.isBanned) {
    //   return res.status(403).json({ 
    //     error: 'Аккаунт заблокирован',
    //     reason: user.banReason 
    //   });
    // }

    // 5. Генерируем токены
    const { accessToken, refreshToken } = generateTokens(user.id);

    console.log('✅ Пользователь вошёл:', user.username);

    // 6. Отправляем ответ
    res.json({
      accessToken,
      refreshToken,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ═══════════════════════════════════════════════════════
// POST /api/auth/refresh - Обновление access token
// ═══════════════════════════════════════════════════════
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token обязателен' 
      });
    }

    // Проверяем refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({ 
        error: 'Невалидный refresh token' 
      });
    }

    // Проверяем существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Пользователь не найден' 
      });
    }

    // Генерируем новые токены
    const tokens = generateTokens(user.id);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('❌ Ошибка обновления токена:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ═══════════════════════════════════════════════════════
// POST /api/auth/logout - Выход (опционально)
// ═══════════════════════════════════════════════════════
// TODO: В будущем можно добавить blacklist для токенов в Redis
router.post('/logout', async (req, res) => {
  // На клиенте просто удалить токены из AsyncStorage
  res.json({ message: 'Выход выполнен успешно' });
});

module.exports = router;