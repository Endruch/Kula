// ═══════════════════════════════════════════════════════
// API SERVICE - ЦЕНТРАЛИЗОВАННАЯ РАБОТА С BACKEND
// ═══════════════════════════════════════════════════════
// Единое место для всех API запросов
// Автоматически подставляет правильный URL для эмулятора/симулятора
// Автоматически обновляет токены при истечении
// ═══════════════════════════════════════════════════════

import axios from 'axios';
import { Platform } from 'react-native';
import { 
  getAccessToken, 
  getRefreshToken, 
  saveAccessToken,
  removeTokens 
} from './auth';

// Автоматическое определение API URL
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    // Android эмулятор
    return 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'ios') {
    // iOS симулятор
    return 'http://localhost:3000/api';
  } else {
    // Web
    return 'http://localhost:3000/api';
  }
};

export const API_URL = getApiUrl();

console.log('📡 API URL:', API_URL);

// Axios instance с базовыми настройками
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════════════════════
// INTERCEPTOR: АВТОМАТИЧЕСКОЕ ДОБАВЛЕНИЕ ACCESS TOKEN
// ═══════════════════════════════════════════════════════
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ═══════════════════════════════════════════════════════
// INTERCEPTOR: АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ ТОКЕНА
// ═══════════════════════════════════════════════════════
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Если уже обновляем токен - добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Обновляем токен
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        await saveAccessToken(accessToken);

        // Обновляем заголовок
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await removeTokens();
        
        // Здесь можно добавить редирект на логин
        // Но в React Native это сложнее чем в web
        // Поэтому просто очищаем токены
        
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════
// API ДЛЯ АВТОРИЗАЦИИ
// ═══════════════════════════════════════════════════════
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string) => {
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════
// API ДЛЯ СОБЫТИЙ
// ═══════════════════════════════════════════════════════
export const eventsAPI = {
  create: async (eventData: any) => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get('/events');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  getMy: async () => {
    const response = await apiClient.get('/events/my');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════
// API ДЛЯ ЛАЙКОВ
// ═══════════════════════════════════════════════════════
export const likesAPI = {
  toggle: async (eventId: string) => {
    const response = await apiClient.post(`/likes/${eventId}`);
    return response.data;
  },

  check: async (eventId: string) => {
    const response = await apiClient.get(`/likes/${eventId}`);
    return response.data;
  },

  getCount: async (eventId: string) => {
    const response = await apiClient.get(`/likes/${eventId}/count`);
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════
// API ДЛЯ КОММЕНТАРИЕВ
// ═══════════════════════════════════════════════════════
export const commentsAPI = {
  add: async (eventId: string, text: string) => {
    const response = await apiClient.post(`/comments/${eventId}`, { text });
    return response.data;
  },

  getAll: async (eventId: string) => {
    const response = await apiClient.get(`/comments/${eventId}`);
    return response.data;
  },

  delete: async (commentId: string) => {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  },

  getCount: async (eventId: string) => {
    const response = await apiClient.get(`/comments/${eventId}/count`);
    return response.data;
  },
};

export default apiClient;