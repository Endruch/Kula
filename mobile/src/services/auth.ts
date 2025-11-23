// src/services/auth.ts
// ═══════════════════════════════════════════════════════
// СЕРВИС АВТОРИЗАЦИИ
// Управляет токеном и состоянием авторизации
// ═══════════════════════════════════════════════════════

import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключ для хранения токена в AsyncStorage
const TOKEN_KEY = '@mysterymeet_token';
const USER_KEY = '@mysterymeet_user';

// ═══════════════════════════════════════════════════════
// СОХРАНИТЬ ТОКЕН
// Вызывается после успешного логина/регистрации
// ═══════════════════════════════════════════════════════
export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('✅ Token saved');
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// ═══════════════════════════════════════════════════════
// ПОЛУЧИТЬ ТОКЕН
// Вызывается при запуске приложения
// ═══════════════════════════════════════════════════════
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════
// УДАЛИТЬ ТОКЕН
// Вызывается при выходе
// ═══════════════════════════════════════════════════════
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    console.log('✅ Token removed');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// ═══════════════════════════════════════════════════════
// СОХРАНИТЬ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
// ═══════════════════════════════════════════════════════
export const saveUser = async (user: any) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('✅ User data saved');
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// ═══════════════════════════════════════════════════════
// ПОЛУЧИТЬ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
// ═══════════════════════════════════════════════════════
export const getUser = async (): Promise<any | null> => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════
// ПРОВЕРИТЬ АВТОРИЗАЦИЮ
// Возвращает true если пользователь залогинен
// ═══════════════════════════════════════════════════════
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null;
};