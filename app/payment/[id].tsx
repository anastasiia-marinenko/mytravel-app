import { paymentsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
// app/payment/[id].tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaymentDetails {
  payment_id: number;
  receipt_number: string;
  amount: number;
  payment_date: string;
  payment_category: string;
  notes?: string;
  method: {
    method_id: number;
    name: string;
    description: string;
    icon: string;
  };
  package: {
    package_id: number;
    vacation_type: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    booking_status: string;
    payment_status: string;
  };
  client: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function PaymentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayment();
  }, [id]);

  const loadPayment = async () => {
    try {
      setError(null);
      const { data } = await paymentsAPI.getById(Number(id));

      if (data.success) {
        setPayment(data.payment);
      } else {
        setError('Не вдалося завантажити платіж');
      }
    } catch (error: any) {
      console.error('❌ Помилка завантаження платежу:', error);
      setError(error.response?.data?.message || 'Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      card: 'card',
      cash: 'cash',
      business: 'business',
      wallet: 'wallet',
    };
    return iconMap[iconName] || 'wallet';
  };

  const handleViewBooking = () => {
    if (payment) {
      router.push(`/booking/${payment.package.package_id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  }

  if (error || !payment) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error || 'Платіж не знайдено'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Назад до списку</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Деталі оплати</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Чек оплати */}
        <View style={styles.receiptCard}>
          {/* Шапка */}
          <View style={styles.receiptHeader}>
            <View>
              <Text style={styles.receiptTitle}>💳 Чек оплати</Text>
              <Text style={styles.agencyName}>MyTravel - Туристичне агентство</Text>
            </View>
            <View style={styles.receiptNumberBox}>
              <Text style={styles.receiptNumberLabel}>Номер чека</Text>
              <Text style={styles.receiptNumber}>{payment.receipt_number}</Text>
            </View>
          </View>

          {/* Статус */}
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <View style={styles.successTextContainer}>
              <Text style={styles.successTitle}>Оплату успішно проведено</Text>
              <Text style={styles.successDate}>{formatDateTime(payment.payment_date)}</Text>
            </View>
          </View>

          {/* Деталі оплати */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Дата оплати</Text>
              <Text style={styles.detailValue}>{formatDateTime(payment.payment_date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Спосіб оплати</Text>
              <View style={styles.methodContainer}>
                <Ionicons name={getMethodIcon(payment.method.icon)} size={20} color="#3b82f6" />
                <Text style={styles.detailValue}>{payment.method.name}</Text>
              </View>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Сума оплати:</Text>
              <Text style={styles.amount}>
                {Math.round(payment.amount).toLocaleString('uk-UA')} ₴
              </Text>
            </View>

            {payment.payment_category && (
              <Text style={styles.categoryText}>Категорія: {payment.payment_category}</Text>
            )}
          </View>

          {/* Примітки */}
          {payment.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesSectionTitle}>Примітки</Text>
              <Text style={styles.notesText}>{payment.notes}</Text>
            </View>
          )}
        </View>

        {/* Інформація про бронювання */}
        <View style={styles.bookingCard}>
          <Text style={styles.sectionTitle}>🧳 Деталі бронювання</Text>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Номер бронювання</Text>
              <TouchableOpacity onPress={handleViewBooking}>
                <Text style={styles.bookingLink}>#{payment.package.package_id}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Тип туру</Text>
              <Text style={styles.detailValue}>{payment.package.vacation_type}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Клієнт</Text>
              <Text style={styles.detailValue}>
                {payment.client.last_name} {payment.client.first_name}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{payment.client.email}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Період подорожі</Text>
              <Text style={styles.detailValue}>
                {formatDate(payment.package.start_date)} — {formatDate(payment.package.end_date)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Тривалість</Text>
              <Text style={styles.detailValue}>{payment.package.duration_days} днів</Text>
            </View>
          </View>

          {/* Статуси */}
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{payment.package.booking_status}</Text>
            </View>
            <View style={[styles.statusBadge, styles.statusBadgePaid]}>
              <Text style={styles.statusText}>{payment.package.payment_status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Кнопки дій */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.backActionButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#4b5563" />
          <Text style={styles.backActionText}>Назад</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.viewBookingButton} onPress={handleViewBooking}>
          <Ionicons name="eye" size={20} color="white" />
          <Text style={styles.viewBookingText}>Бронювання</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBackButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  receiptCard: {
    backgroundColor: 'white',
    margin: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  agencyName: {
    fontSize: 14,
    color: '#6b7280',
  },
  receiptNumberBox: {
    alignItems: 'flex-end',
  },
  receiptNumberLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  receiptNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    marginBottom: 20,
    gap: 12,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
  },
  successDate: {
    fontSize: 13,
    color: '#047857',
    marginTop: 2,
  },
  detailsSection: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  amountLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  notesSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  notesSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#1f2937',
  },
  bookingCard: {
    backgroundColor: 'white',
    margin: 12,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  bookingLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#10b981',
    borderRadius: 16,
  },
  statusBadgePaid: {
    backgroundColor: '#3b82f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  backActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  backActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  viewBookingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewBookingText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  spacer: {
    height: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});