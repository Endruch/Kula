// ═══════════════════════════════════════════════════════
// COMMENTS ROUTES - API ДЛЯ РАБОТЫ С КОММЕНТАРИЯМИ
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

// GET /api/comments/:eventId - Получить комментарии
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { eventId },
      include: {
        user: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(comments);
  } catch (error) {
    console.error('❌ Ошибка получения комментариев:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/comments/:eventId - Добавить комментарий
router.post('/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Текст комментария обязателен' });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId,
        eventId
      },
      include: {
        user: {
          select: { username: true }
        }
      }
    });

    console.log('💬 Комментарий добавлен:', comment.id);
    res.status(201).json(comment);
  } catch (error) {
    console.error('❌ Ошибка создания комментария:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/comments/:commentId - Удалить комментарий
router.delete('/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    // Проверяем что комментарий существует и принадлежит пользователю
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Нет прав на удаление' });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    console.log('🗑️ Комментарий удалён:', commentId);
    res.json({ message: 'Комментарий удалён' });
  } catch (error) {
    console.error('❌ Ошибка удаления комментария:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;