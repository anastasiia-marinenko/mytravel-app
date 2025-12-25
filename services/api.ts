// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://192.168.1.105:8000/api/v1';
// const API_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor для додавання токену
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (email: string, password: string, device_name: string) =>
    api.post('/login', { email, password, device_name }),
  
  register: (data: any) =>
    api.post('/register', data),
  
  logout: () =>
    api.post('/logout'),
  
  getUser: () =>
    api.get('/user'),
};

export interface TourFilters {
  vacation_type_id?: number;
  season_id?: number;
  min_price?: number;
  max_price?: number;
  hotel_stars?: 3 | 4 | 5;
  duration?: '3-5' | '5-7' | '7-14' | '14+';
  sort?: 'price' | 'duration' | 'name';
}

// Tours
export const toursAPI = {
  getAll: (params?: any) =>
    api.get('/tours', { params }),
  
  getById: (id: number) =>
    api.get(`/tours/${id}`),
  
  getTourPackages: (params?: TourFilters) =>
    api.get('/tour-packages', { params }),
  
  getVacationTypes: () =>
    api.get('/vacation-types'),
  
  getHotelsByCity: (cityId: number) =>
    api.get(`/hotels/city/${cityId}`),
  
  getTransports: (params?: { arrival_city_id?: number; departure_city_id?: number }) =>
    api.get('/transports', { params }),
};

// Bookings
export const bookingsAPI = {
  getAll: () =>
    api.get('/bookings'),
  
  getById: (id: number) =>
    api.get(`/bookings/${id}`),
  
  create: (data: any) =>
    api.post('/bookings', data),
  
  cancel: (id: number) =>
    api.delete(`/bookings/${id}`),
  
  process: (id: number) =>
    api.post(`/bookings/${id}/process`),
  
  approve: (id: number) =>
    api.post(`/bookings/${id}/approve`),
  
  reject: (id: number, reason: string) =>
    api.post(`/bookings/${id}/reject`, { rejection_reason: reason }),
};

// Ratings
export const ratingsAPI = {
  create: (packageId: number, data: any) =>
    api.post(`/bookings/${packageId}/ratings`, data),
  
  getByPackage: (packageId: number) =>
    api.get(`/bookings/${packageId}/ratings`),
};

// Payments
// Payments
export const paymentsAPI = {
  getAll: (params?: { date?: string; method_id?: number; per_page?: number }) =>
    api.get('/payments', { params }),
  
  getById: (id: number) =>
    api.get(`/payments/${id}`),
  
  getPaymentForm: (packageId: number) =>
    api.get(`/payments/form/${packageId}`),
  
  // ✅ ВИПРАВЛЕНО: Правильна передача даних
  create: (data: {
    package_id: number;
    method_id: number;
    amount: number;
    notes?: string;
  }) => {
    console.log('📤 paymentsAPI.create викликано з:', data);
    console.log('📋 Тип data:', typeof data);
    console.log('📋 JSON.stringify:', JSON.stringify(data));
    return api.post('/payments', data);
  },
  
  getByPackage: (packageId: number) =>
    api.get(`/payments/package/${packageId}`),
};

// Після створення api
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ ДОДАТИ ЛОГУВАННЯ
    console.log('🌐 Axios Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Director
export const directorAPI = {
  getDashboard: () =>
    api.get('/director/dashboard'),
  
  getEmployees: () =>
    api.get('/director/employees'),
  
  getFinancialReport: () =>
    api.get('/director/financial-report'),
};

// Dashboard
export const dashboardAPI = {
  getStats: () =>
    api.get('/dashboard'),
};

// Reports
export const reportsAPI = {
  getFinancial: (startDate: string, endDate: string) =>
    api.get('/reports/financial', { params: { start_date: startDate, end_date: endDate } }),
  
  getBookings: (status?: string) =>
    api.get('/reports/bookings', { params: { status } }),
  
  getClients: () =>
    api.get('/reports/clients'),
  
  getRevenueTrend: (months: number) =>
    api.get('/reports/revenue-trend', { params: { months } }),
  
  getPopularTours: (startDate: string, endDate: string) =>
    api.get('/reports/popular-tours', { params: { start_date: startDate, end_date: endDate } }),
  
  getEmployeePerformance: (startDate: string, endDate: string) =>
    api.get('/reports/employee-performance', { params: { start_date: startDate, end_date: endDate } }),
};

// Staff
export const staffAPI = {
  getAll: () =>
    api.get('/staff'),
  
  getById: (id: number) =>
    api.get(`/staff/${id}`),
  
  create: (data: any) =>
    api.post('/staff', data),
  
  update: (id: number, data: any) =>
    api.patch(`/staff/${id}`, data),
  
  dismiss: (id: number) =>
    api.post(`/staff/${id}/dismiss`),
  
  getPositions: () =>
    api.get('/staff/positions'),
  
  getRoles: () =>
    api.get('/staff/roles'),
};

// ✅ ВИПРАВЛЕНО: AJAX ендпоінти
export const ajaxAPI = {
  getVacationTypes: () =>
    api.get('/ajax/vacation-types'),
  
  getCountries: () =>
    api.get('/ajax/countries'),

  getCities: (countryId: number) =>
    api.get(`/ajax/cities/${countryId}`),
  
  getHotels: (cityId: number) =>
    api.get(`/ajax/hotels/${cityId}`),
  
  getRooms: (hotelId: number) =>
    api.get(`/ajax/rooms/${hotelId}`),

  getTransportsOutbound: (cityId: number) =>
    api.get(`/ajax/transports/outbound/${cityId}`),

  getTransportsReturn: (cityId: number) =>
    api.get(`/ajax/transports/return/${cityId}`),

  getInsurances: () =>
    api.get('/ajax/insurances'),

  getAdditionalServices: () =>
    api.get('/ajax/services'),
};

export default api;