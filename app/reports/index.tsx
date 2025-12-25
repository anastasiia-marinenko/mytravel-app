// app/reports/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReportsIndexScreen() {
  const reports = [
    {
      id: 'financial',
      title: 'Фінансовий звіт',
      description: 'Дохід, витрати та прибуток за період',
      icon: 'cash',
      color: '#10b981',
      route: '/reports/financial'
    },
    {
      id: 'bookings',
      title: 'Звіт по бронюванням',
      description: 'Статистика бронювань та їх статуси',
      icon: 'calendar',
      color: '#3b82f6',
      route: '/reports/bookings'
    },
    {
      id: 'clients',
      title: 'Звіт по клієнтам',
      description: 'База клієнтів та їх активність',
      icon: 'people',
      color: '#8b5cf6',
      route: '/reports/clients'
    },
    {
      id: 'revenue-trend',
      title: 'Тренд доходів',
      description: 'Графік зміни доходів',
      icon: 'trending-up',
      color: '#f59e0b',
      route: '/reports/revenue-trend'
    },
    {
      id: 'popular-tours',
      title: 'Популярні тури',
      description: 'Найбільш затребувані напрямки',
      icon: 'star',
      color: '#ec4899',
      route: '/reports/popular-tours'
    },
    {
      id: 'employee-performance',
      title: 'Ефективність менеджерів',
      description: 'Статистика роботи менеджерів',
      icon: 'briefcase',
      color: '#6366f1',
      route: '/reports/employee-performance'
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Звіти та аналітика</Text>
          <Text style={styles.headerSubtitle}>Фінансові звіти та статистика</Text>
        </View>
      </View>

      {/* Report Cards */}
      <View style={styles.cardsContainer}>
        {reports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            onPress={() => router.push(report.route as any)}
            activeOpacity={0.7}>
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: report.color + '20' }]}>
                <Ionicons name={report.icon as any} size={32} color={report.color} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{report.title}</Text>
                <Text style={styles.cardDescription}>{report.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  cardsContainer: {
    padding: 12,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  spacer: {
    height: 40,
  },
});