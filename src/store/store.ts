import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from './authSlice'; // Припускаємо, що ви додасте тип AuthState до authSlice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Додайте інші редюсери тут
  },
});

// Визначаємо RootState
export type RootState = ReturnType<typeof store.getState>;

// Також можна визначити AppDispatch
export type AppDispatch = typeof store.dispatch;

export default store;