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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- ДОДАНО: Отримуємо dispatch НА ВЕРХНЬОМУ РІВНІ КОМПОНЕНТА ---
  const dispatch = useDispatch();
  // --- КІНЕЦЬ ДОДАВАННЯ ---

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Помилка', 'Заповніть всі поля');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);

      // --- ОНОВЛЕНО: Зберігаємо токен і ОНОВЛЮЄМО СТАН REDUX ---
      const { token, user } = response.data; // Розгортаємо дані з відповіді
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Оновлюємо стан аутентифікації в Redux
      // --- ВИКЛИКАЄМО DISPATCH ТУТ ---
      dispatch(loginSuccess({ token, user }));
      // --- КІНЕЦЬ ВИКЛИКУ DISPATCH ---
      // navigation.replace('Main'); // <- БІЛЬШЕ НЕ ПОТРІБНО!
      // --- КІНЕЦЬ ОНОВЛЕННЯ ---

    } catch (error) {
      // --- ВАЖЛИВО: Обробляємо помилки, але НЕ ВИКЛИКАЄМО dispatch ТУТ ---
      Alert.alert(
        'Помилка входу',
        error.response?.data?.message || 'Невірний email або пароль'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyTravel</Text>
      <Text style={styles.subtitle}>Вхід в систему</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Завантаження...' : 'Увійти'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.linkText}>Немає акаунту? Зареєструватись</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2563eb',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
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