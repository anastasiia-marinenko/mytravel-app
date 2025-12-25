// ===========================================
// app/staff/index.tsx - Список співробітників
// ===========================================
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StaffIndexScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: staffData } = await api.get('/staff');
      setData(staffData);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити список співробітників');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getPositionColor = (positionName: string) => {
    const colors: any = {
      'Менеджер': '#10b981',
      'Бухгалтер': '#8b5cf6',
      'Тур-гід': '#f59e0b',
      'Агент з продажів': '#3b82f6',
      'Операційний координатор': '#f97316',
    };
    return colors[positionName] || '#6b7280';
  };

  if (loading) {
    return <View style={styles.center}><Text>Завантаження...</Text></View>;
  }

  if (!data) {
    return <View style={styles.center}><Text>Немає даних</Text></View>;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Управління персоналом</Text>
          <Text style={styles.headerSubtitle}>Список активних співробітників</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <StatCard label="Всього" value={data.stats.total} icon="people" color="#3b82f6" />
        <StatCard label="Менеджерів" value={data.stats.managers} icon="briefcase" color="#10b981" />
        <StatCard label="Бухгалтерів" value={data.stats.accountants} icon="calculator" color="#8b5cf6" />
        <StatCard label="Координаторів" value={data.stats.coordinators} icon="git-network" color="#f97316" />
      </View>

      {/* Employees List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Співробітники</Text>
        
        {data.employees.map((employee: any) => {
          const position = employee.positions?.[0];
          const phone = employee.person?.phones?.[0];
          
          return (
            <TouchableOpacity
              key={employee.employee_id}
              style={styles.employeeCard}
              onPress={() => router.push(`/staff/${employee.employee_id}` as any)}>
              
              <View style={styles.employeeAvatar}>
                <Text style={styles.employeeAvatarText}>
                  {employee.person.first_name[0]}{employee.person.last_name[0]}
                </Text>
              </View>

              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>
                  {employee.person.last_name} {employee.person.first_name}
                </Text>
                
                {position && (
                  <View style={[styles.positionBadge, { backgroundColor: getPositionColor(position.name) + '20' }]}>
                    <Text style={[styles.positionText, { color: getPositionColor(position.name) }]}>
                      {position.name}
                    </Text>
                  </View>
                )}

                <View style={styles.employeeContacts}>
                  <Ionicons name="mail" size={14} color="#6b7280" />
                  <Text style={styles.contactText}>{employee.person.email}</Text>
                </View>

                {phone && (
                  <View style={styles.employeeContacts}>
                    <Ionicons name="call" size={14} color="#6b7280" />
                    <Text style={styles.contactText}>{phone.phone_number}</Text>
                  </View>
                )}
              </View>

              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

// ===========================================
// Допоміжні компоненти
// ===========================================
const StatCard = ({ label, value, icon, color }: any) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color="#6b7280" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// ===========================================
// Стилі
// ===========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { marginRight: 12 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  section: { backgroundColor: 'white', margin: 12, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  employeeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 8 },
  employeeAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  employeeAvatarText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  employeeInfo: { flex: 1 },
  employeeName: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  positionBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 4 },
  positionText: { fontSize: 12, fontWeight: '600' },
  employeeContacts: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  contactText: { fontSize: 12, color: '#6b7280' },
  profileSection: { alignItems: 'center', padding: 24, backgroundColor: 'white', marginBottom: 12 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginTop: 12 },
  profileId: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  infoLabel: { fontSize: 14, color: '#6b7280', flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444', padding: 16, borderRadius: 12, gap: 8 },
  dangerButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  spacer: { height: 40 },
});