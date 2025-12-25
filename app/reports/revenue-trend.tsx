// app/reports/revenue-trend.tsx
import { reportsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width - 48;

export default function RevenueTrendScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: reportData } = await reportsAPI.getRevenueTrend(12);
      setData(reportData);
    } catch (error) {
      console.error('Помилка завантаження тренду доходів:', error);
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

  if (!data || data.data.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Немає даних за період</Text>
      </View>
    );
  }

  const lineData = data.data.map((item: any) => ({
    value: Math.round(item.total),
    label: new Date(item.month + '-01').toLocaleDateString('uk-UA', { month: 'short' }),
    dataPointLabelComponent: () => (
      <View style={{ backgroundColor: '#10b981', padding: 6, borderRadius: 8 }}>
        <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
          {(Math.round(item.total) / 1000).toFixed(0)}k ₴
        </Text>
      </View>
    ),
  }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Тренд доходів</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Динаміка за {data.months} місяців</Text>
        <LineChart
          data={lineData}
          width={screenWidth}
          height={320}
          thickness={4}
          color="#10b981"
          curved
          startFillColor="#10b981"
          endFillColor="#10b98122"
          startOpacity={0.8}
          endOpacity={0.1}
          hideDataPoints={false}
          dataPointsColor="#10b981"
          dataPointsRadius={6}
          textColor="#1f2937"
          textFontSize={12}
          yAxisTextStyle={{ color: '#6b7280' }}
          xAxisTextStyle={{ color: '#6b7280' }}
          rulesColor="#e5e7eb"
          backgroundColor="#fff"
          initialSpacing={30}
          spacing={60}
          animationDuration={1200}
          yAxisLabelSuffix=" ₴"
          formatYLabel={(value) => `${(Number(value) / 1000).toFixed(0)}k`}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Деталі по місяцях</Text>
        {data.data.map((item: any, index: number) => {
          const change = item.change;
          const isPositive = change !== null && change >= 0;
          const isNegative = change !== null && change < 0;

          return (
            <View key={index} style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendMonth}>{item.month}</Text>
                <View style={styles.trendRight}>
                  <Text style={styles.trendAmount}>{Math.round(item.total)} ₴</Text>
                  {change !== null && (
                    <View
                      style={[
                        styles.trendChange,
                        isPositive ? styles.positive : styles.negative,
                      ]}>
                      <Ionicons
                        name={isPositive ? 'trending-up' : 'trending-down'}
                        size={16}
                        color="white"
                      />
                      <Text style={styles.trendChangeText}>
                        {Math.abs(change).toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  trendItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendMonth: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  trendRight: { alignItems: 'flex-end' },
  trendAmount: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  positive: { backgroundColor: '#10b981' },
  negative: { backgroundColor: '#ef4444' },
  trendChangeText: { color: 'white', fontSize: 12, fontWeight: '600' },
  spacer: { height: 40 },
});