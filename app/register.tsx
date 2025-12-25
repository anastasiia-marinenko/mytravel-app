// app/register.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { authAPI } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    birth_date: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (formData.password !== formData.password_confirmation) {
      Alert.alert('Помилка', 'Паролі не співпадають');
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      Alert.alert('Помилка', "Заповніть всі обов'язкові поля");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        ...formData,
        device_name: 'mobile-app',
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userRole', 'client');
      await AsyncStorage.setItem('user', JSON.stringify(user));

      Alert.alert('Успіх', 'Реєстрація успішна!');
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Помилка реєстрації';
      Alert.alert('Помилка', message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          keyboardType="phone-pad"
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
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Завантаження...' : 'Зареєструватись'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Повернутись до входу</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
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
    backgroundColor: '#f9fafb',
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