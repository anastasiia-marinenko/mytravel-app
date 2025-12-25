// app/reports/clients.tsx
import { reportsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ClientsReportScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: reportData } = await reportsAPI.getClients();
      setData(reportData);
    } catch (error) {
      console.error('Помилка завантаження звіту по клієнтам:', error);
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
        <Text style={styles.headerTitle}>Звіт по клієнтам</Text>
      </View>

      {/* Статистика */}
      <View style={styles.statsGrid}>
        <StatCard label="Всього клієнтів" value={data.stats.total_clients} icon="people" color="#3b82f6" />
        <StatCard label="Активних" value={data.stats.active_clients} icon="person-add" color="#10b981" />
        <StatCard
          label="Середньо бронювань"
          value={data.stats.average_bookings.toFixed(1)}
          icon="bar-chart"
          color="#8b5cf6"
        />
      </View>

      {/* Список клієнтів */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Клієнти</Text>
        {data.clients.length > 0 ? (
          data.clients.map((client: any) => (
            <View key={client.client_id} style={styles.clientCard}>
              <View style={styles.clientAvatar}>
                <Text style={styles.clientAvatarText}>
                  {client.first_name[0]?.toUpperCase()}{client.last_name[0]?.toUpperCase()}
                </Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>
                  {client.first_name} {client.last_name}
                </Text>
                <Text style={styles.clientEmail}>{client.email}</Text>
              </View>
              <View style={styles.clientStats}>
                <Text style={styles.clientBookings}>{client.packages_count}</Text>
                <Text style={styles.clientBookingsLabel}>бронювань</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Немає клієнтів</Text>
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
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  clientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clientAvatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  clientEmail: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  clientStats: { alignItems: 'flex-end' },
  clientBookings: { fontSize: 24, fontWeight: 'bold', color: '#10b981' },
  clientBookingsLabel: { fontSize: 12, color: '#6b7280' },
  noData: { textAlign: 'center', color: '#6b7280', paddingVertical: 32 },
  spacer: { height: 40 },
});