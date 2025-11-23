// mobile/src/services/api.ts
// ═══════════════════════════════════════════════════════
// API CLIENT - подключение к backend
// ═══════════════════════════════════════════════════════

import axios from 'axios';

// ═══════════════════════════════════════════════════════
// КОНФИГУРАЦИЯ API
// Замени localhost на IP твоего Mac если тестируешь на реальном устройстве
// ═══════════════════════════════════════════════════════
const API_URL = 'http://10.0.2.2:3000/api';

// ═══════════════════════════════════════════════════════
// СОЗДАЁМ AXIOS CLIENT
// Это как "почтальон" который отправляет запросы на backend
// ═══════════════════════════════════════════════════════
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════════════════════
// ОСНОВНЫЕ API ФУНКЦИИ
// ═══════════════════════════════════════════════════════

export const api = {
  // Health check
  healthCheck: async () => {
    const response = await axios.get('http://10.0.2.2:3000/health');
    return response.data;
  },

  // Test endpoint
  test: async () => {
    const response = await apiClient.get('/test');
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════
// AUTH API - регистрация и логин
// ═══════════════════════════════════════════════════════
export const authAPI = {
  // Регистрация
  register: async (name: string, email: string, password: string) => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Логин (← ДОБАВЬ ЭТО!)
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};

export default apiClient;
