import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store'; // Або визначте RootState тут, якщо зручніше

// Визначаємо інтерфейс для стану аутентифікації
export interface AuthState {
  isAuthenticated: boolean;
  user: any; // Типізуйте краще, коли знатимете структуру користувача
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;

// Експортуємо тип AuthState, щоб використовувати в App.tsx
export type { AuthState };