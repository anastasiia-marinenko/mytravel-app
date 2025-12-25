// ============================================
// utils/storage.ts - AsyncStorage допоміжні функції
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  TOKEN: 'token',
  USER_ROLE: 'userRole',
  USER_DATA: 'userData',
};

export const storage = {
  // Зберегти токен
  saveToken: async (token: string) => {
    try {
      await AsyncStorage.setItem(StorageKeys.TOKEN, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  // Отримати токен
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(StorageKeys.TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Видалити токен
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(StorageKeys.TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Зберегти роль користувача
  saveUserRole: async (role: string) => {
    try {
      await AsyncStorage.setItem(StorageKeys.USER_ROLE, role);
    } catch (error) {
      console.error('Error saving user role:', error);
    }
  },

  // Отримати роль користувача
  getUserRole: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(StorageKeys.USER_ROLE);
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },

  // Очистити всі дані
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([
        StorageKeys.TOKEN,
        StorageKeys.USER_ROLE,
        StorageKeys.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};