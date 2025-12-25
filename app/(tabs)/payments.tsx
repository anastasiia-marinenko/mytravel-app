import { paymentsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
// app/(tabs)/payments.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Payment {
  payment_id: number;
  receipt_number: string;
  amount: number;
  payment_date: string;
  payment_category: string;
  package: {
    package_id: number;
    vacation_type: string;
    booking_status: string;
    payment_status: string;
  };
  method: {
    method_id: number;
    name: string;
    icon: string;
  };
  client?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Stats {
  total_payments: number;
  total_revenue: number;
  today_payments: number;
  average_amount: number;
}

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('client');

  useEffect(() => {
    loadUserRole();
    loadPayments();
  }, []);

  const loadUserRole = async () => {
    const role = await AsyncStorage.getItem('userRole');
    setUserRole(role || 'client');
  };

  const loadPayments = async () => {
    try {
      setError(null);
      const { data } = await paymentsAPI.getAll({ per_page: 50 });

      if (data.success) {
        setPayments(data.payments);
        setStats(data.stats);
      } else {
        setError('Не вдалося завантажити платежі');
      }
    } catch (error: any) {
      console.error('❌ Помилка завантаження платежів:', error);
      setError(error.response?.data?.message || 'Помилка завантаження');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const handlePaymentPress = (paymentId: number) => {
    router.push(`/payment/${paymentId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'card': 'card',
      'cash': 'cash',
      'business': 'business',
      'wallet': 'wallet',
    };
    return iconMap[iconName] || 'wallet';
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => handlePaymentPress(item.payment_id)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentId}>#{item.payment_id}</Text>
          {item.receipt_number && (
            <View style={styles.receiptBadge}>
              <Ionicons name="barcode" size={12} color="#6b7280" />
              <Text style={styles.receiptText}>{item.receipt_number}</Text>
            </View>
          )}
        </View>
        <View style={styles.methodBadge}>
          <Ionicons name={getMethodIcon(item.method.icon)} size={16} color="#3b82f6" />
          <Text style={styles.methodText}>{item.method.name}</Text>
        </View>
      </View>

      {/* Клієнт (тільки для співробітників) */}
      {userRole !== 'client' && item.client && (
        <View style={styles.clientInfo}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientAvatarText}>
              {item.client.first_name[0]}{item.client.last_name[0]}
            </Text>
          </View>
          <Text style={styles.clientName}>
            {item.client.last_name} {item.client.first_name}
          </Text>
        </View>
      )}

      {/* Деталі бронювання */}
      <View style={styles.packageInfo}>
        <View style={styles.packageDetail}>
          <Ionicons name="briefcase" size={16} color="#6b7280" />
          <Text style={styles.packageText}>#{item.package.package_id}</Text>
        </View>
        <View style={styles.packageDetail}>
          <Ionicons name="pricetag" size={16} color="#6b7280" />
          <Text style={styles.packageText}>{item.package.vacation_type}</Text>
        </View>
      </View>

      {/* Сума та дата */}
      <View style={styles.paymentFooter}>
        <View>
          <Text style={styles.amount}>
            {Math.round(item.amount).toLocaleString('uk-UA')} ₴
          </Text>
          {item.payment_category && (
            <Text style={styles.category}>{item.payment_category}</Text>
          )}
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formatDate(item.payment_date)}</Text>
          <Text style={styles.time}>{formatTime(item.payment_date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Завантаження платежів...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPayments}>
          <Text style={styles.retryButtonText}>Спробувати ще раз</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          💳 {userRole === 'client' ? 'Мої платежі' : 'Платежі'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {userRole === 'client'
            ? 'Історія ваших оплат'
            : 'Управління платежами та транзакціями'}
        </Text>
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Ionicons name="receipt" size={24} color="#10b981" />
            <Text style={styles.statValue}>{stats.total_payments}</Text>
            <Text style={styles.statLabel}>Всього</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>
              {Math.round(stats.total_revenue).toLocaleString('uk-UA')} ₴
            </Text>
            <Text style={styles.statLabel}>Сума</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#8b5cf6" />
            <Text style={styles.statValue}>{stats.today_payments}</Text>
            <Text style={styles.statLabel}>Сьогодні</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>
              {Math.round(stats.average_amount).toLocaleString('uk-UA')} ₴
            </Text>
            <Text style={styles.statLabel}>Середня</Text>
          </View>
        </View>
      )}

      {/* Список платежів */}
      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.payment_id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Платежів не знайдено</Text>
            <Text style={styles.emptySubtext}>
              {userRole === 'client'
                ? 'Платежі з\'являться після оплати бронювань'
                : 'Платежі з\'являться після оплати клієнтами'}
            </Text>
          </View>
        }
      />
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
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  list: {
    padding: 12,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptText: {
    fontSize: 11,
    color: '#6b7280',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  packageInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  packageDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packageText: {
    fontSize: 13,
    color: '#4b5563',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  category: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 13,
    color: '#4b5563',
  },
  time: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
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
  retryButton: {
    marginTop: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});