// ═══════════════════════════════════════════════════════
// SERVER.JS - ГЛАВНЫЙ ФАЙЛ BACKEND СЕРВЕРА
// ═══════════════════════════════════════════════════════
// SECURITY FEATURES:
// ✅ Helmet.js - защита HTTP заголовков
// ✅ Rate Limiting - защита от DDoS и bruteforce
// ✅ CORS настроен правильно
// ✅ Input validation
// ✅ Error handling
//
// TODO для продакшена:
// ⏳ HTTPS/SSL (AWS)
// ⏳ Email verification (требует SMTP)
// ⏳ 2FA (требует SMS/Authenticator)
// ⏳ WAF (AWS)
// ═══════════════════════════════════════════════════════

require('dotenv').config(); // Загружаем .env в самом начале!

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════════

// 1. Helmet - защита HTTP заголовков
app.use(helmet());

// 2. CORS - настроенный правильно
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:19006', 'http://localhost:8081'], // Expo dev URLs
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. Rate Limiting - общий лимит для всех запросов
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Максимум 100 запросов за 15 минут
  message: 'Слишком много запросов с этого IP, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// 4. Rate Limiting для auth endpoints (более строгий)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // Максимум 5 попыток за 15 минут
  message: 'Слишком много попыток входа, попробуйте через 15 минут',
  skipSuccessfulRequests: true, // Не считать успешные попытки
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. JSON parsing с лимитом размера (защита от JSON bomb)
app.use(express.json({ limit: '10mb' }));

// ═══════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const likesRoutes = require('./routes/likes');
const commentsRoutes = require('./routes/comments');

// Auth routes с rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Остальные routes
app.use('/api/events', eventsRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/comments', commentsRoutes);

// ═══════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.json({ 
    message: 'KULA API работает! 🚀',
    version: '1.0.0',
    security: {
      helmet: '✅',
      rateLimit: '✅',
      cors: '✅',
      validation: '✅'
    },
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      likes: '/api/likes',
      comments: '/api/comments'
    }
  });
});

// ═══════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint не найден',
    path: req.path 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Ошибка:', err);
  
  // Не раскрываем детали ошибок в production
  const isDev = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({ 
    error: 'Внутренняя ошибка сервера',
    ...(isDev && { message: err.message, stack: err.stack })
  });
});

// ═══════════════════════════════════════════════════════
// SERVER START
// ═══════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 KULA Backend запущен!             ║
╠════════════════════════════════════════╣
║   Порт: ${PORT}                        ║
║   URL: http://localhost:${PORT}        ║
║                                        ║
║   🔐 Security:                         ║
║   ✅ Helmet.js                         ║
║   ✅ Rate Limiting                     ║
║   ✅ CORS                              ║
║   ✅ Input Validation                  ║
║                                        ║
║   📋 TODO для продакшена:              ║
║   ⏳ HTTPS/SSL                         ║
║   ⏳ Email Verification                ║
║   ⏳ 2FA                               ║
╚════════════════════════════════════════╝
  `);
});

// ═══════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════

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