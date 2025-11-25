// ═══════════════════════════════════════════════════════
// EVENTS ROUTES - API ДЛЯ РАБОТЫ С СОБЫТИЯМИ
// ═══════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// ═══════════════════════════════════════════════════════
// ПРОВЕРКА СЕКРЕТОВ
// ═══════════════════════════════════════════════════════
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET не установлен!');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════
// MIDDLEWARE ПРОВЕРКИ ТОКЕНА
// ═══════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════
// ФУНКЦИИ ОБРАБОТКИ КООРДИНАТ
// ═══════════════════════════════════════════════════════

// Функция добавления случайной погрешности (~700м)
function addRandomOffset(coord, maxOffset = 0.007) {
  return coord + (Math.random() - 0.5) * maxOffset * 2;
}

// Функция извлечения района из адреса
function extractLocationArea(fullAddress) {
  const parts = fullAddress.split(',');
  return parts.length > 1 ? parts.slice(0, 2).join(',').trim() : fullAddress;
}

// ═══════════════════════════════════════════════════════
// POST /api/events - Создать событие
// ═══════════════════════════════════════════════════════
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

    // Извлекаем район из полного адреса
    const locationArea = extractLocationArea(location);

    const event = await prisma.event.create({
      data: {
        title,
        description: description || '',
        location,
        locationArea,
        latitude: addRandomOffset(parseFloat(latitude)),
        longitude: addRandomOffset(parseFloat(longitude)),
        exactLatitude: parseFloat(latitude),
        exactLongitude: parseFloat(longitude),
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

    console.log('✅ Событие создано:', event.id, '-', event.title);
    res.status(201).json(event);
  } catch (error) {
    console.error('❌ Ошибка создания события:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      message: error.message 
    });
  }
});

// ═══════════════════════════════════════════════════════
// GET /api/events - Все события (с приблизительной геолокацией)
// ═══════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    console.log('📋 Загрузка всех событий');
    
    // Проверяем есть ли токен
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Игнорируем ошибку
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
        participants: userId ? {
          where: { userId }
        } : false,
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

    const eventsWithCounts = events.map(event => {
      const isParticipant = userId && event.participants && event.participants.length > 0;
      
      return {
        ...event,
        location: isParticipant ? event.location : event.locationArea,
        latitude: isParticipant ? event.exactLatitude : event.latitude,
        longitude: isParticipant ? event.exactLongitude : event.longitude,
        exactLatitude: undefined,
        exactLongitude: undefined,
        participants: event._count.participants,
        likes: event._count.likes,
        comments: event._count.comments,
        isLiked: userId ? event.likes.length > 0 : false,
        isParticipant: !!isParticipant,
      };
    });

    console.log('✅ События загружены:', eventsWithCounts.length);
    res.json(eventsWithCounts);
  } catch (error) {
    console.error('❌ Ошибка получения событий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ═══════════════════════════════════════════════════════
// GET /api/events/my - МОИ события
// ⚠️ ВАЖНО: Этот роут ДОЛЖЕН быть ПЕРЕД GET /:id
// ═══════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════
// GET /api/events/:id - Событие по ID (с проверкой участия)
// ═══════════════════════════════════════════════════════
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем токен
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Игнорируем
      }
    }
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        participants: userId ? {
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
    });

    if (!event) {
      return res.status(404).json({ error: 'Событие не найдено' });
    }

    const isParticipant = userId && event.participants && event.participants.length > 0;

    const eventWithCounts = {
      ...event,
      location: isParticipant ? event.location : event.locationArea,
      latitude: isParticipant ? event.exactLatitude : event.latitude,
      longitude: isParticipant ? event.exactLongitude : event.longitude,
      exactLatitude: undefined,
      exactLongitude: undefined,
      participants: event._count.participants,
      likes: event._count.likes,
      comments: event._count.comments,
      isParticipant: !!isParticipant,
    };

    res.json(eventWithCounts);
  } catch (error) {
    console.error('❌ Ошибка получения события:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ═══════════════════════════════════════════════════════
// POST /api/events/:id/participate - Записаться на событие
// ═══════════════════════════════════════════════════════
router.post('/:id/participate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Событие не найдено' });
    }

    if (event._count.participants >= event.maxParticipants) {
      return res.status(400).json({ error: 'Мест больше нет' });
    }

    const existing = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: userId,
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Вы уже записаны' });
    }

    await prisma.eventParticipant.create({
      data: {
        eventId: id,
        userId: userId,
      }
    });

    console.log('✅ Пользователь записан на событие:', userId, '→', id);
    res.json({ 
      success: true,
      message: 'Вы записаны! Точный адрес теперь доступен'
    });
  } catch (error) {
    console.error('❌ Ошибка записи на событие:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ═══════════════════════════════════════════════════════
// DELETE /api/events/:id - Удалить событие
// ═══════════════════════════════════════════════════════
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