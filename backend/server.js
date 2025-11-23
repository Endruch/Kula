// ═══════════════════════════════════════════════════════
// SERVER.JS - ГЛАВНЫЙ ФАЙЛ BACKEND СЕРВЕРА
// ═══════════════════════════════════════════════════════
// Что делает:
// 1. Запускает Express сервер на порту 3000
// 2. Подключает middleware (cors, json)
// 3. Подключает routes (auth, events)
// 4. Обрабатывает ошибки
//
// Endpoints:
// - POST /api/auth/register - регистрация
// - POST /api/auth/login - вход
// - POST /api/events - создать событие
// - GET /api/events - получить все события
// - GET /api/events/:id - получить событие по ID
// ═══════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'KULA API работает! 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events'
    }
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка:', err);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: err.message 
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 KULA Backend запущен!             ║
╠════════════════════════════════════════╣
║   Порт: ${PORT}                           ║
║   URL: http://localhost:${PORT}           ║
║                                        ║
║   Endpoints:                           ║
║   📝 Auth:   /api/auth                 ║
║   🎉 Events: /api/events               ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Останавливаем сервер...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Останавливаем сервер...');
  await prisma.$disconnect();
  process.exit(0);
});