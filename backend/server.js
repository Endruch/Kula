// backend/server.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      message: 'MysteryMeet Backend is running! 🚀',
      database: 'connected ✅',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════
// РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ
// POST /api/auth/register
// ═══════════════════════════════════════════════════════
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Валидация
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Заполните все поля',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Некорректный email',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Пароль должен быть минимум 6 символов',
      });
    }

    // Проверяем что email уникальный
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Пользователь с таким email уже существует',
      });
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаём пользователя
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        dateOfBirth: new Date('2000-01-01'),
        city: 'Не указано',
      },
    });

// ─────────────────────────────────────────────────────
    // СОЗДАЁМ JWT ТОКЕН
    // ─────────────────────────────────────────────────────
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Регистрация успешна!',
      token: token, // ← ОТПРАВЛЯЕМ ТОКЕН!
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Ошибка при регистрации',
      message: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════
// ЛОГИН (ВХОД)
// POST /api/auth/login
// ═══════════════════════════════════════════════════════
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📥 Login request:', email);

    // Валидация
    if (!email || !password) {
      return res.status(400).json({
        error: 'Заполните все поля',
      });
    }

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Неверный email или пароль',
      });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Неверный email или пароль',
      });
    }

    // Успех!
// ─────────────────────────────────────────────────────
    // СОЗДАЁМ JWT ТОКЕН
    // ─────────────────────────────────────────────────────
    // Токен содержит: id и email пользователя
    // expiresIn: '7d' = токен действителен 7 дней
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', user.email);

    res.json({
      message: 'Вход успешен!',
      token: token, // ← ОТПРАВЛЯЕМ ТОКЕН!
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Ошибка при входе',
      message: error.message,
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Hello from MysteryMeet API!',
    version: '0.1.0',
  });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        createdAt: true,
      }
    });
    
    res.json({
      count: users.length,
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message,
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('🚀 MysteryMeet Backend Started!');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Server:    http://localhost:${PORT}`);
  console.log(`🏥 Health:    http://localhost:${PORT}/health`);
  console.log(`🧪 Test API:  http://localhost:${PORT}/api/test`);
  console.log(`👥 Users:     http://localhost:${PORT}/api/users`);
  console.log('═══════════════════════════════════════');
});