import { dashboardAPI, directorAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Stats {
  total_payments: number;
  total_revenue: number;
  today_payments: number;
  average_amount: number;
}

export default function DashboardScreen() {
  const [userRole, setUserRole] = useState<string>('client');
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {
    const role = await AsyncStorage.getItem('userRole');
    setUserRole(role || 'client');
    
    if (role === 'director' || role === 'admin') {
      const { data } = await directorAPI.getDashboard();
      console.log('📊 Dashboard директора:', data);
      setStats(data);
    } else {
      const { data } = await dashboardAPI.getStats();
      console.log('📊 Dashboard клієнта:', data);
      setStats(data);
    }
  } catch (error) {
    console.error('Помилка завантаження:', error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isDirector = userRole === 'director' || userRole === 'admin';

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isDirector ? '👑 Кабінет директора' : '✈️ Мої подорожі'}
        </Text>
        <Text style={styles.subtitle}>
          {isDirector ? 'Перегляд звітів та керування персоналом' : 'Вітаємо у MyTravel!'}
        </Text>
      </View>

      {/* Статистика */}
<View style={styles.statsGrid}>
  {isDirector ? (
    <>
      <StatCard
        title="Всього бронювань"
        value={stats.stats?.total_bookings || stats.total_bookings || 0}
        icon="document-text"
        color="#8b5cf6"
      />
      <StatCard
        title="Підтверджених бронювань"
        value={stats.stats?.active_bookings || stats.active_bookings || 0}
        icon="checkmark-circle"
        color="#10b981"
      />
      <StatCard
        title="Загальний дохід"
        value={`${Math.round(stats.stats?.total_revenue || stats.total_revenue || 0).toLocaleString('uk-UA')} ₴`}
        icon="cash"
        color="#3b82f6"
      />
      <StatCard
        title="Співробітників"
        value={stats.stats?.total_employees || stats.total_employees || 0}
        icon="people"
        color="#f59e0b"
      />
    </>
  ) : (
    <>
      <StatCard
        title="Мої бронювання"
        value={stats.total_bookings || 0}
        icon="calendar"
        color="#3b82f6"
      />
      <StatCard
        title="Активні"
        value={stats.active_bookings || 0}
        icon="checkmark-circle"
        color="#10b981"
      />
      <StatCard
        title="Майбутні"
        value={stats.upcoming_trips || 0}
        icon="time"
        color="#8b5cf6"
      />
      <StatCard
        title="Витрачено"
        value={`${Math.round(stats.total_spent || 0).toLocaleString('uk-UA')} ₴`}
        icon="wallet"
        color="#f59e0b"
      />
    </>
  )}
</View>

      {/* Топ менеджери (тільки для директора) */}
      {isDirector && stats.top_managers?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Топ менеджери</Text>
          {stats.top_managers.slice(0, 5).map((manager: any, index: number) => (
            <View key={manager.employee_id} style={styles.managerCard}>
              <View style={[styles.managerBadge, { 
                backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#d1d5db' 
              }]}>
                <Text style={styles.managerRank}>#{index + 1}</Text>
              </View>
              <View style={styles.managerInfo}>
                <Text style={styles.managerName}>
                  {manager.first_name} {manager.last_name}
                </Text>
                <Text style={styles.managerStats}>
                  {manager.bookings_count} бронювань • {Math.round(manager.revenue)} ₴
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Останні бронювання */}
      {stats.recent_packages && stats.recent_packages.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Останні бронювання</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
              <Text style={styles.seeAllText}>Всі →</Text>
            </TouchableOpacity>
          </View>
          {stats.recent_packages.slice(0, 5).map((pkg: any) => (
            <TouchableOpacity
              key={pkg.package_id}
              style={styles.bookingCard}
              onPress={() => router.push(`/booking/${pkg.package_id}`)}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingId}>#{pkg.package_id}</Text>
                <Text style={styles.bookingPrice}>
                  {Math.round(pkg.total_cost || 0).toLocaleString('uk-UA')} ₴
                </Text>
              </View>
              <Text style={styles.bookingTitle}>{pkg.vacation_name || 'Подорож'}</Text>
              <View style={styles.bookingFooter}>
                <Text style={styles.bookingDate}>
                  {new Date(pkg.start_date).toLocaleDateString('uk-UA')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Швидкі дії */}
      <View style={styles.actionsGrid}>
        {isDirector ? (
          <>
            <ActionButton
              title="Персонал"
              icon="people"
              color="#6d10b9ff"
              onPress={() => router.push('../staff')}
            />
            <ActionButton
              title="Звіти"
              icon="stats-chart"
              color="#1010b9ff"
              onPress={() => router.push('../reports')}
            />
            <ActionButton
              title="Бронювання"
              icon="calendar"
              color="#10b981"
              onPress={() => router.push('/(tabs)/bookings')}
            />
          </>
        ) : (
          <>
            <ActionButton
              title="Пошук турів"
              icon="airplane"
              color="#3b82f6"
              onPress={() => router.push('/(tabs)/tours')}
            />
            <ActionButton
              title="Нове бронювання"
              icon="add-circle"
              color="#10b981"
              onPress={() => router.push('/booking/create')}
            />
            <ActionButton
              title="Мої бронювання"
              icon="list"
              color="#8b5cf6"
              onPress={() => router.push('/(tabs)/bookings')}
            />
            <ActionButton
              title="Профіль"
              icon="person"
              color="#6d10b9ff"
              onPress={() => router.push('/(tabs)/profile')}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Підтверджено':
      return { backgroundColor: '#dcfce7', borderColor: '#10b981' };
    case 'В обробці':
      return { backgroundColor: '#fef3c7', borderColor: '#f59e0b' };
    case 'Очікує координатора':
      return { backgroundColor: '#dbeafe', borderColor: '#3b82f6' };
    case 'Скасовано':
      return { backgroundColor: '#fee2e2', borderColor: '#ef4444' };
    default:
      return { backgroundColor: '#f3f4f6', borderColor: '#9ca3af' };
  }
};

const StatCard = ({ title, value, icon, color }: any) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const ActionButton = ({ title, icon, color, onPress }: any) => (
  <TouchableOpacity style={[styles.actionButton, { backgroundColor: color }]} onPress={onPress}>
    <Ionicons name={icon} size={28} color="white" />
    <Text style={styles.actionText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  seeAllText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  managerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  managerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  managerRank: {
    fontWeight: 'bold',
    color: 'white',
  },
  managerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  managerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  managerStats: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  bookingCard: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bookingId: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  bookingPrice: {
    fontWeight: '600',
    color: '#10b981',
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 8,
  },
});