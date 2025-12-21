import apiClient from './client';

export const authAPI = {
  login: (email, password) =>
    apiClient.post('/login', {
      email,
      password,
      device_name: 'mobile-app'
    }),

  register: (data) =>
    apiClient.post('/register', {
      ...data,
      device_name: 'mobile-app'
    }),

  logout: () =>
    apiClient.post('/logout'),

  getUser: () =>
    apiClient.get('/user'),
};

export const bookingsAPI = {
  getAll: () => apiClient.get('/bookings'),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  create: (data) => apiClient.post('/bookings', data),
  cancel: (id) => apiClient.delete(`/bookings/${id}`),
};

export const toursAPI = {
  getAll: () => apiClient.get('/tours'),
  getById: (id) => apiClient.get(`/tours/${id}`),
};

export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard'),
};