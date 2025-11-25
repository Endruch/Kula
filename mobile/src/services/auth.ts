// src/services/auth.ts
// ═══════════════════════════════════════════════════════
// СЕРВИС АВТОРИЗАЦИИ
// Управляет токенами (access + refresh) и состоянием авторизации
// ═══════════════════════════════════════════════════════

import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключи для хранения в AsyncStorage
const ACCESS_TOKEN_KEY = '@mysterymeet_access_token';
const REFRESH_TOKEN_KEY = '@mysterymeet_refresh_token';
const USER_KEY = '@mysterymeet_user';

// ═══════════════════════════════════════════════════════
// СОХРАНИТЬ ACCESS TOKEN
// Короткий токен (15 минут) для обычных запросов
// ═══════════════════════════════════════════════════════
export const saveAccessToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    console.log('✅ Access token saved');
  } catch (error) {
    console.error('Error saving access token:', error);
  }
};

// ═══════════════════════════════════════════════════════
// СОХРАНИТЬ REFRESH TOKEN
// Долгий токен (30 дней) для обновления access token
// ═══════════════════════════════════════════════════════
export const saveRefreshToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    console.log('✅ Refresh token saved');
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
};

// ═══════════════════════════════════════════════════════
// СОХРАНИТЬ ОБА ТОКЕНА СРАЗУ
// Удобная функция для логина/регистрации
// ═══════════════════════════════════════════════════════
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await saveAccessToken(accessToken);
  await saveRefreshToken(refreshToken);
};

// ═══════════════════════════════════════════════════════
// ПОЛУЧИТЬ ACCESS TOKEN
// ═══════════════════════════════════════════════════════
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════
// ПОЛУЧИТЬ REFRESH TOKEN
// ═══════════════════════════════════════════════════════
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════
// УДАЛИТЬ ВСЕ ТОКЕНЫ
// Вызывается при выходе
// ═══════════════════════════════════════════════════════
export const removeTokens = async () => {
  try {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_KEY,
    ]);
    console.log('✅ All tokens removed');
  } catch (error) {
    console.error('Error removing tokens:', error);
  }
};

// ═══════════════════════════════════════════════════════
// ОБРАТНАЯ СОВМЕСТИМОСТЬ
// Старые функции для плавной миграции
// ═══════════════════════════════════════════════════════
export const saveToken = saveAccessToken; // Алиас для старого кода
export const getToken = getAccessToken; // Алиас для старого кода
export const removeToken = removeTokens; // Алиас для старого кода

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
  const token = await getAccessToken();
  return token !== null;
};