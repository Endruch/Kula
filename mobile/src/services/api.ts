// ═══════════════════════════════════════════════════════
// API SERVICE - ЦЕНТРАЛИЗОВАННАЯ РАБОТА С BACKEND
// ═══════════════════════════════════════════════════════
// Единое место для всех API запросов
// Автоматически подставляет правильный URL для эмулятора/симулятора
// ═══════════════════════════════════════════════════════

import axios from 'axios';
import { Platform } from 'react-native';

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

// API для авторизации
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
};

// API для событий
export const eventsAPI = {
  create: async (token: string, eventData: any) => {
    const response = await apiClient.post('/events', eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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

  getMy: async (token: string) => {
    const response = await apiClient.get('/events/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  delete: async (token: string, id: string) => {
    const response = await apiClient.delete(`/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default apiClient;