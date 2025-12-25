// app/reports/popular-tours.tsx
import { reportsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PopularToursScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: reportData } = await reportsAPI.getPopularTours(
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
      setData(reportData);
    } catch (error) {
      console.error('Помилка завантаження популярних турів:', error);
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
        <Text style={styles.headerTitle}>Популярні тури</Text>
      </View>

      {/* Популярні типи */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Найпопулярніші типи турів</Text>
        {data.popular_types.length > 0 ? (
          data.popular_types.map((type: any, index: number) => (
            <View key={index} style={styles.tourItem}>
              <View style={styles.tourRank}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.tourInfo}>
                <Text style={styles.tourName}>{type.name}</Text>
                <Text style={styles.tourStats}>
                  {type.bookings_count} бронювань • {Math.round(type.total_revenue)} ₴
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Немає даних</Text>
        )}
      </View>

      {/* Популярні напрямки */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Топ напрямків</Text>
        {data.popular_destinations.length > 0 ? (
          data.popular_destinations.map((dest: any, index: number) => (
            <View key={index} style={styles.destinationItem}>
              <Text style={styles.destinationRank}>#{index + 1}</Text>
              <View style={styles.destinationInfo}>
                <Text style={styles.destinationCity}>{dest.city}</Text>
                <Text style={styles.destinationCountry}>{dest.country}</Text>
              </View>
              <Text style={styles.destinationBookings}>{dest.bookings_count} брон.</Text>
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
  section: { backgroundColor: 'white', margin: 12, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  tourItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tourRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: { color: 'white', fontWeight: 'bold' },
  tourInfo: { flex: 1 },
  tourName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  tourStats: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  destinationItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  destinationRank: { fontSize: 16, fontWeight: 'bold', color: '#ec4899', width: 40 },
  destinationInfo: { flex: 1 },
  destinationCity: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  destinationCountry: { fontSize: 12, color: '#6b7280' },
  destinationBookings: { fontSize: 14, color: '#ec4899', fontWeight: '600' },
  noData: { textAlign: 'center', color: '#6b7280', paddingVertical: 32 },
  spacer: { height: 40 },
});