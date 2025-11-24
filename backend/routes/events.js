// ═══════════════════════════════════════════════════════
// EVENTS ROUTES - API ДЛЯ РАБОТЫ С СОБЫТИЯМИ
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

// POST /api/events - Создать событие
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Получен запрос на создание события');
    
    const {
      title,
      description,
      location,
      latitude,
      longitude,
      dateTime,
      endDate,
      category,
      maxParticipants,
      videoUrl,
    } = req.body;

    // Валидация обязательных полей
    if (!title || !location || !dateTime || !endDate || !category || !videoUrl) {
      return res.status(400).json({ 
        error: 'Заполните все обязательные поля' 
      });
    }

    // Валидация координат
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        error: 'Необходимо указать координаты события' 
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Неверные координаты' 
      });
    }

    // Парсим даты
    let parsedStartDate, parsedEndDate;
    try {
      parsedStartDate = new Date(dateTime);
      parsedEndDate = new Date(endDate);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid date');
      }

      if (parsedEndDate <= parsedStartDate) {
        return res.status(400).json({ 
          error: 'Дата окончания должна быть после даты начала' 
        });
      }
    } catch (err) {
      return res.status(400).json({ 
        error: 'Неверный формат даты' 
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || '',
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        dateTime: parsedStartDate,
        endDate: parsedEndDate,
        category,
        maxParticipants: maxParticipants || 10,
        videoUrl,
        creatorId: req.userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    console.log('✅ Событие создано:', event.id, '-', event.title, `(${latitude}, ${longitude})`);
    res.status(201).json(event);
  } catch (error) {
    console.error('❌ Ошибка создания события:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      message: error.message 
    });
  }
});

// GET /api/events/my - МОИ события
router.get('/my', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Загрузка событий пользователя:', req.userId);
    
    const events = await prisma.event.findMany({
      where: {
        creatorId: req.userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            participants: true,
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const eventsWithCounts = events.map(event => ({
      ...event,
      participants: event._count.participants,
      likes: event._count.likes,
      comments: event._count.comments,
    }));

    console.log('✅ Мои события загружены:', eventsWithCounts.length);
    res.json(eventsWithCounts);
  } catch (error) {
    console.error('❌ Ошибка получения моих событий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/events - Все события
router.get('/', async (req, res) => {
  try {
    console.log('📋 Загрузка всех событий');
    
    // Проверяем есть ли токен (опционально для публичного доступа)
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Игнорируем ошибку - просто не авторизован
      }
    }
    
    const events = await prisma.event.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        likes: userId ? {
          where: { userId }
        } : false,
        _count: {
          select: {
            participants: true,
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const eventsWithCounts = events.map(event => ({
      ...event,
      participants: event._count.participants,
      likes: event._count.likes,
      comments: event._count.comments,
      isLiked: userId ? event.likes.length > 0 : false,
    }));

    console.log('✅ События загружены:', eventsWithCounts.length);
    res.json(eventsWithCounts);
  } catch (error) {
    console.error('❌ Ошибка получения событий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/events/:id - Событие по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            participants: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Событие не найдено' });
    }

    const eventWithCounts = {
      ...event,
      participants: event._count.participants,
      likes: event._count.likes,
      comments: event._count.comments,
    };

    res.json(eventWithCounts);
  } catch (error) {
    console.error('❌ Ошибка получения события:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/events/:id - Удалить событие
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Событие не найдено' });
    }

    if (event.creatorId !== req.userId) {
      return res.status(403).json({ error: 'Нет прав для удаления' });
    }

    await prisma.event.delete({
      where: { id },
    });

    console.log('✅ Событие удалено:', id);
    res.json({ message: 'Событие удалено' });
  } catch (error) {
    console.error('❌ Ошибка удаления события:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;