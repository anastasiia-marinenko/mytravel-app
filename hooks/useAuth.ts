// hooks/useAuth.ts
import { authAPI } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('checkAuth - token exists:', !!token);
      
      if (token) {
        try {
          const { data } = await authAPI.getUser();
          setUser(data.user);
          setIsAuthenticated(true);
          console.log('checkAuth - user loaded:', data.user?.email);
        } catch (error) {
          console.error('checkAuth - failed to get user:', error);
          // Токен невалідний - очищаємо
          await AsyncStorage.clear();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('checkAuth - error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('login - attempting login');
      const { data } = await authAPI.login(email, password, 'mobile');
      
      console.log('login - success, saving token');
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('userRole', data.role);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      console.log('login - redirecting to tabs');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('login - error:', error);
      throw new Error(error.response?.data?.message || 'Помилка входу');
    }
  };

  const logout = async () => {
    try {
      console.log('logout - starting logout process');
      
      // Спробуємо викликати API, але не блокуємо на помилці
      try {
        await authAPI.logout();
        console.log('logout - API logout successful');
      } catch (apiError) {
        console.log('logout - API error (continuing anyway):', apiError);
      }
      
      // Очищаємо локальні дані
      console.log('logout - clearing AsyncStorage');
      await AsyncStorage.clear();
      
      // Оновлюємо стан
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('logout - state cleared, redirecting');
      
      // Використовуємо setTimeout щоб забезпечити завершення очищення
      setTimeout(() => {
        router.replace('/login');
        console.log('logout - redirected to login');
      }, 100);
      
    } catch (error) {
      console.error('logout - critical error:', error);
      // Навіть при помилці намагаємося перейти на логін
      try {
        await AsyncStorage.clear();
        router.replace('/login');
      } catch (finalError) {
        console.error('logout - final error:', finalError);
      }
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
};