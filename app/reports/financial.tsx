// app/reports/financial.tsx
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FinancialReportScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: reportData } = await api.get('/reports/financial', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        }
      });
      setData(reportData);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити звіт');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadData();
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
        <Text style={styles.headerTitle}>Фінансовий звіт</Text>
      </View>

      {/* Date Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Період</Text>
        
        <View style={styles.dateRow}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Від</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}>
              <Ionicons name="calendar" size={20} color="#6b7280" />
              <Text style={styles.dateText}>{startDate.toLocaleDateString('uk-UA')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>До</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}>
              <Ionicons name="calendar" size={20} color="#6b7280" />
              <Text style={styles.dateText}>{endDate.toLocaleDateString('uk-UA')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (date) setStartDate(date);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (date) setEndDate(date);
            }}
          />
        )}

        <TouchableOpacity style={styles.filterButton} onPress={handleFilter}>
          <Ionicons name="filter" size={20} color="white" />
          <Text style={styles.filterButtonText}>Застосувати</Text>
        </TouchableOpacity>
      </View>

      {/* Main Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="arrow-up" size={32} color="white" />
          </View>
          <Text style={styles.statLabel}>Загальний дохід</Text>
          <Text style={styles.statValue}>{Math.round(data.income)} ₴</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="arrow-down" size={32} color="white" />
          </View>
          <Text style={styles.statLabel}>Загальні витрати</Text>
          <Text style={styles.statValue}>{Math.round(data.expenses)} ₴</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="wallet" size={32} color="white" />
          </View>
          <Text style={styles.statLabel}>Чистий прибуток</Text>
          <Text style={styles.statValue}>{Math.round(data.profit)} ₴</Text>
          <Text style={styles.statSubtext}>
            Рентабельність: {data.profitability.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Income Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Структура доходів</Text>
        {data.income_by_type.length > 0 ? (
          data.income_by_type.map((item: any, index: number) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>{item.income_type}</Text>
                <Text style={styles.breakdownValue}>{Math.round(item.total)} ₴</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(item.total / data.income) * 100}%`,
                      backgroundColor: getColorForType(item.income_type)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.breakdownPercentage}>
                {((item.total / data.income) * 100).toFixed(1)}%
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Немає даних</Text>
        )}
      </View>

      {/* Expenses Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Структура витрат</Text>
        {data.expenses_by_type.length > 0 ? (
          data.expenses_by_type.map((item: any, index: number) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>{item.expense_type}</Text>
                <Text style={styles.breakdownValue}>{Math.round(item.total)} ₴</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(item.total / data.expenses) * 100}%`,
                      backgroundColor: '#ef4444'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.breakdownPercentage}>
                {((item.total / data.expenses) * 100).toFixed(1)}%
              </Text>
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

const getColorForType = (type: string) => {
  const colors: any = {
    'Payment': '#3b82f6',
    'Commission': '#10b981',
    'Margin': '#8b5cf6',
    'Service Fee': '#f59e0b',
    'Cancellation Fee': '#ef4444',
  };
  return colors[type] || '#6b7280';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  section: { backgroundColor: 'white', margin: 12, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  dateContainer: { flex: 1 },
  dateLabel: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12 },
  dateText: { fontSize: 14, color: '#1f2937' },
  filterButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3b82f6', padding: 12, borderRadius: 8 },
  filterButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  statsContainer: { padding: 12, gap: 12 },
  statCard: { borderRadius: 12, padding: 16 },
  statIconContainer: { width: 64, height: 64, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statLabel: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, marginBottom: 4 },
  statValue: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  statSubtext: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 12, marginTop: 4 },
  breakdownItem: { marginBottom: 16 },
  breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  breakdownLabel: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  breakdownValue: { fontSize: 14, fontWeight: 'bold', color: '#10b981' },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  breakdownPercentage: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  noData: { textAlign: 'center', color: '#6b7280', paddingVertical: 32 },
  spacer: { height: 40 },
});