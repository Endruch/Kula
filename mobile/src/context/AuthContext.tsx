// src/context/AuthContext.tsx
// ═══════════════════════════════════════════════════════
// КОНТЕКСТ АВТОРИЗАЦИИ
// Управляет состоянием авторизации во всём приложении
// ═══════════════════════════════════════════════════════

import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  getAccessToken, 
  getUser, 
  saveTokens,
  saveUser as saveAuthUser, 
  removeTokens 
} from '../services/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  userData: any | null;
  login: (accessToken: string, refreshToken: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any | null>(null);

  // Проверяем авторизацию при запуске
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication...');
      const token = await getAccessToken();
      const user = await getUser();

      if (token && user) {
        console.log('✅ User is authenticated:', user.email);
        setIsLoggedIn(true);
        setUserData(user);
      } else {
        console.log('❌ User is not authenticated');
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (accessToken: string, refreshToken: string, user: any) => {
    await saveTokens(accessToken, refreshToken);
    await saveAuthUser(user);
    setIsLoggedIn(true);
    setUserData(user);
  };

  const logout = async () => {
    await removeTokens();
    setIsLoggedIn(false);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        userData,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};