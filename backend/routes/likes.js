// ═══════════════════════════════════════════════════════
// LIKES ROUTES - API ДЛЯ РАБОТЫ С ЛАЙКАМИ
// ═══════════════════════════════════════════════════════
// Endpoints:
// - POST /api/likes/:eventId - Лайкнуть событие (toggle)
// - GET /api/likes/:eventId - Проверить лайкнул ли пользователь событие
// - GET /api/likes/:eventId/count - Получить количество лайков
// ═══════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware проверки токена
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
};

// POST /api/likes/:eventId - Лайкнуть/убрать лайк (toggle)
router.post('/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    // Проверяем существует ли событие
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Событие не найдено' });
    }

    // Проверяем есть ли уже лайк
    const existingLike = await prisma.like.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: userId,
        },
      },
    });

    if (existingLike) {
      // Убираем лайк
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Получаем новое количество лайков
      const likesCount = await prisma.like.count({
        where: { eventId },
      });

      console.log('❌ Лайк убран:', eventId, 'пользователь:', userId);
      return res.json({ 
        isLiked: false, 
        likesCount,
        message: 'Лайк убран' 
      });
    } else {
      // Добавляем лайк
      await prisma.like.create({
        data: {
          eventId: eventId,
          userId: userId,
        },
      });

      // Получаем новое количество лайков
      const likesCount = await prisma.like.count({
        where: { eventId },
      });

      console.log('❤️ Лайк добавлен:', eventId, 'пользователь:', userId);
      return res.json({ 
        isLiked: true, 
        likesCount,
        message: 'Лайк добавлен' 
      });
    }
  } catch (error) {
    console.error('❌ Ошибка лайка:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      message: error.message 
    });
  }
});

// GET /api/likes/:eventId - Проверить лайкнул ли пользователь
router.get('/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    const like = await prisma.like.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: userId,
        },
      },
    });

    res.json({ isLiked: !!like });
  } catch (error) {
    console.error('❌ Ошибка проверки лайка:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/likes/:eventId/count - Получить количество лайков
router.get('/:eventId/count', async (req, res) => {
  try {
    const { eventId } = req.params;

    const count = await prisma.like.count({
      where: { eventId },
    });

    res.json({ count });
  } catch (error) {
    console.error('❌ Ошибка получения количества лайков:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;