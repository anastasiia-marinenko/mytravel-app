// app/reports/bookings.tsx
import { reportsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BookingsReportScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: reportData } = await reportsAPI.getBookings();
      setData(reportData);
    } catch (error) {
      console.error('Помилка завантаження звіту по бронюванням:', error);
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

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Немає даних</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Звіт по бронюванням</Text>
      </View>

      {/* Статистика */}
      <View style={styles.statsGrid}>
        <StatCard label="Всього" value={data.stats.total} icon="list" color="#3b82f6" />
        <StatCard label="Підтверджені" value={data.stats.confirmed} icon="checkmark-circle" color="#10b981" />
        <StatCard label="Скасовані" value={data.stats.cancelled} icon="close-circle" color="#ef4444" />
        <StatCard
          label="Конверсія"
          value={`${data.stats.conversion_rate.toFixed(1)}%`}
          icon="trending-up"
          color="#8b5cf6"
        />
      </View>

      {/* Список бронювань */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Останні бронювання</Text>
        {data.packages.data.length > 0 ? (
          data.packages.data.map((pkg: any) => (
            <TouchableOpacity
              key={pkg.package_id}
              style={styles.bookingCard}
              onPress={() => router.push(`/booking/${pkg.package_id}`)}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingId}>#{pkg.package_id}</Text>
                <Text style={styles.bookingPrice}>{Math.round(pkg.total_cost || pkg.service_fee || 0)} ₴</Text>
              </View>
              <Text style={styles.bookingClient}>
                {pkg.client?.person?.first_name} {pkg.client?.person?.last_name}
              </Text>
              <Text style={styles.bookingType}>{pkg.vacation_type?.name || 'Тур'}</Text>
              <View style={styles.bookingStatusBadge}>
                <Text style={styles.bookingStatusText}>{pkg.booking_status?.name}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noData}>Немає бронювань</Text>
        )}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const StatCard = ({ label, value, icon, color }: any) => (
  <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
    <Ionicons name={icon} size={32} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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
    minWidth: '45%',
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
  bookingCard: { padding: 16, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 12 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingId: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6' },
  bookingPrice: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  bookingClient: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  bookingType: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  bookingStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bookingStatusText: { fontSize: 12, fontWeight: '600', color: '#3b82f6' },
  noData: { textAlign: 'center', color: '#6b7280', paddingVertical: 32 },
  spacer: { height: 40 },
});