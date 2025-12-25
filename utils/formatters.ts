// ============================================
// utils/formatters.ts - Форматування даних
// ============================================

import { COLORS, STATUS_COLORS } from "./constants";

export const formatCurrency = (amount: number): string => {
  return `${Math.round(amount).toLocaleString('uk-UA')} ₴`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] || COLORS.gray[400];
};