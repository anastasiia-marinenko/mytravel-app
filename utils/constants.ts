// ============================================
// utils/constants.ts - Константи
// ============================================

export const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  success: '#10b981',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

export const STATUS_COLORS: { [key: string]: string } = {
  'В обробці': COLORS.warning,
  'Підтверджено': COLORS.success,
  'Очікує координатора': COLORS.info,
  'Скасовано': COLORS.danger,
  'Завершено': COLORS.gray[500],
  'Оплачено': COLORS.success,
  'Очікує оплати': COLORS.warning,
};

export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};