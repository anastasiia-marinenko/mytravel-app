// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice'; // Імпортуємо екшн logout
import { authAPI } from '../api/endpoints'; // Імпортуємо API для logout

export default function ProfileScreen() {
  const dispatch = useDispatch(); // Отримуємо dispatch

  const handleLogout = async () => {
    Alert.alert(
      'Вийти',
      'Ви впевнені, що хочете вийти?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Викликаємо API logout (опціонально, якщо сервер підтримує)
              // await authAPI.logout(); // Розкоментуйте, якщо хочете викликати серверний logout

              // 2. Видаляємо токен з AsyncStorage
              await AsyncStorage.removeItem('auth_token');
              await AsyncStorage.removeItem('user'); // Також видаляємо інформацію про користувача

              // 3. Оновлюємо стан Redux
              dispatch(logout()); // Це встановить isAuthenticated: false

            } catch (error) {
              console.error('Помилка виходу:', error);
              Alert.alert('Помилка', 'Не вдалося вийти. Спробуйте ще раз.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профіль користувача</Text>
      {/* Тут можна відобразити інформацію про користувача */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Вийти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#ef4444', // Червоний колір для кнопки виходу
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});