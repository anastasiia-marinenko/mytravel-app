import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

//const API_URL = 'http://10.0.2.2:8000/api/v1'; // Android Emulator
// const API_URL = 'http://localhost:8000/api/v1'; // iOS Simulator
// const API_URL = 'https://yourserver.com/api/v1'; // Production
const API_URL = 'http://127.0.0.1:8000/api/v1'; // Production
//const API_URL = 'http://172.31.144.1:8000/api/v1'; // Production

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Додаємо токен до кожного запиту
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;