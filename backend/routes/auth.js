// ═══════════════════════════════════════════════════════
// AUTH ROUTES - API ДЛЯ АВТОРИЗАЦИИ
// ═══════════════════════════════════════════════════════
// Endpoints:
// POST /api/auth/register - регистрация нового пользователя
// POST /api/auth/login - вход существующего пользователя
// ═══════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/auth/register - Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Валидация
    if (!email || !username || !password) {
      return res.status(400).json({ 
        error: 'Все поля обязательны' 
      });
    }

    // Проверяем существует ли пользователь
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email или username уже используется' 
      });
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём пользователя
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // Создаём JWT токен
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '30d',
    });

    console.log('✅ Пользователь зарегистрирован:', user.username);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/auth/login - Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валидация
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email и пароль обязательны' 
      });
    }

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // Создаём JWT токен
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '30d',
    });

    console.log('✅ Пользователь вошёл:', user.username);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;