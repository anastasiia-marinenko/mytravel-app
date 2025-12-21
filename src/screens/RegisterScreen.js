// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { authAPI } from '../api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
// --- ДОДАНО: Потрібно для оновлення стану аутентифікації ---
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
// --- КІНЕЦЬ ДОДАВАННЯ ---

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    birth_date: '', // формат YYYY-MM-DD
  });
  const [loading, setLoading] = useState(false);

  // --- ДОДАНО: Отримуємо dispatch ---
  const dispatch = useDispatch();
  // --- КІНЕЦЬ ДОДАВАННЯ ---

  const handleRegister = async () => {
    // 1. Перевірка підтвердження пароля (всередині React Native)
    if (formData.password !== formData.password_confirmation) {
      Alert.alert('Помилка', 'Паролі не співпадають');
      return;
    }

    // 2. Перевірка обов'язкових полів (всередині React Native)
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      Alert.alert('Помилка', 'Заповніть всі обов\'язкові поля');
      return;
    }

    setLoading(true);
    try {
      // --- ПРАВИЛЬНО: передаємо весь formData + device_name ---
      // authAPI.register у endpoints.js отримає об'єкт, що містить усі поля з formData плюс device_name
      const response = await authAPI.register({
        ...formData,
        device_name: 'mobile-app' // Додаємо device_name як вимагає Laravel
      });
      // --- КІНЕЦЬ ПРАВИЛЬНОГО СПОСОБУ ---

      Alert.alert('Успіх', response.data.message);

      // --- ОНОВЛЕНО: Зберігаємо токен і ОНОВЛЮЄМО СТАН REDUX ---
      const { token, user } = response.data; // Розгортаємо дані з відповіді
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Оновлюємо стан аутентифікації в Redux
      dispatch(loginSuccess({ token, user }));
      // navigation.replace('Main'); // <- БІЛЬШЕ НЕ ПОТРІБНО!
      // --- КІНЕЦЬ ОНОВЛЕННЯ ---

    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.errors || 'Помилка реєстрації';
      Alert.alert('Помилка', typeof message === 'object' ? JSON.stringify(message) : message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Реєстрація</Text>

      <TextInput
        style={styles.input}
        placeholder="Ім'я"
        value={formData.first_name}
        onChangeText={(value) => updateFormData('first_name', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Прізвище"
        value={formData.last_name}
        onChangeText={(value) => updateFormData('last_name', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => updateFormData('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Телефон"
        value={formData.phone}
        onChangeText={(value) => updateFormData('phone', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Дата народження (YYYY-MM-DD)"
        value={formData.birth_date}
        onChangeText={(value) => updateFormData('birth_date', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        value={formData.password}
        onChangeText={(value) => updateFormData('password', value)}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Підтвердіть пароль"
        value={formData.password_confirmation}
        onChangeText={(value) => updateFormData('password_confirmation', value)}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Завантаження...' : 'Зареєструватись'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Повернутись до входу</Text>
      </TouchableOpacity>
    </View>
  );
}

// Використовуйте ті самі стилі, що й у LoginScreen, або створіть свої
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2563eb',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    color: '#2563eb',
    marginTop: 20,
    fontSize: 14,
  },
});