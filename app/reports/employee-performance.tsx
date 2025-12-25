// app/reports/employee-performance.tsx
import { reportsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EmployeePerformanceScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: reportData } = await reportsAPI.getEmployeePerformance(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
      setData(reportData);
    } catch (error) {
      console.error('Помилка завантаження ефективності:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ефективність менеджерів</Text>
      </View>

      {/* Загальна статистика */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={32} color="#6366f1" />
          <Text style={styles.statValue}>{data.stats.active_managers}</Text>
          <Text style={styles.statLabel}>Менеджерів</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={32} color="#3b82f6" />
          <Text style={styles.statValue}>{data.stats.total_bookings}</Text>
          <Text style={styles.statLabel}>Бронювань</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={32} color="#10b981" />
          <Text style={styles.statValue}>{Math.round(data.stats.total_revenue)} ₴</Text>
          <Text style={styles.statLabel}>Дохід</Text>
        </View>
      </View>

      {/* Рейтинг менеджерів */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Рейтинг менеджерів</Text>
        {data.managers.length > 0 ? (
          data.managers.map((manager: any, index: number) => (
            <View key={manager.employee_id} style={styles.managerItem}>
              <View style={styles.managerRank}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.managerInfo}>
                <Text style={styles.managerName}>
                  {manager.first_name} {manager.last_name}
                </Text>
                <Text style={styles.managerStats}>
                  {manager.total_bookings} брон. • {Math.round(manager.total_revenue)} ₴
                </Text>
              </View>
              <View style={styles.managerConversion}>
                <Text style={styles.conversionText}>
                  {manager.conversion_rate.toFixed(1)}%
                </Text>
                <Text style={styles.conversionLabel}>конверсія</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Немає даних</Text>
        )}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  section: { backgroundColor: 'white', margin: 12, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  managerItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  managerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: { color: 'white', fontWeight: 'bold' },
  managerInfo: { flex: 1 },
  managerName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  managerStats: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  managerConversion: { alignItems: 'flex-end' },
  conversionText: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  conversionLabel: { fontSize: 10, color: '#6b7280' },
  noData: { textAlign: 'center', color: '#6b7280', paddingVertical: 32 },
  spacer: { height: 40 },
});