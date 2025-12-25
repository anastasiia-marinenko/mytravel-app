// app/staff/[id].tsx
import { staffAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StaffDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const { data } = await staffAPI.getById(Number(id));
      setEmployee(data.employee);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити дані');
      console.error('Error loading employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    Alert.alert(
      'Звільнити співробітника?',
      'Ця дія встановить дату звільнення на сьогодні. Продовжити?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Звільнити',
          style: 'destructive',
          onPress: async () => {
            try {
              await staffAPI.dismiss(Number(id));
              Alert.alert('Успіх', 'Співробітника звільнено', [
                {
                  text: 'OK',
                  onPress: () => router.back()
                }
              ]);
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося звільнити');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Співробітника не знайдено</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const position = employee.positions?.[0];
  const phone = employee.person?.phones?.[0];
  const passport = employee.person?.passport;
  const city = employee.person?.address?.city;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Деталі співробітника</Text>
      </View>

      {/* Avatar & Name */}
      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {employee.person.first_name[0]}{employee.person.last_name[0]}
          </Text>
        </View>
        <Text style={styles.profileName}>
          {employee.person.last_name} {employee.person.first_name}
          {employee.person.middle_name && ` ${employee.person.middle_name}`}
        </Text>
        <Text style={styles.profileId}>ID: #{employee.employee_id}</Text>
      </View>

      {/* Position */}
      {position && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💼 Посада</Text>
          <InfoRow icon="briefcase" label="Посада" value={position.name} />
          <InfoRow icon="cash" label="Зарплата" value={`${Math.round(position.salary)} ₴`} />
          <InfoRow 
            icon="calendar" 
            label="Дата прийняття" 
            value={new Date(employee.hire_date).toLocaleDateString('uk-UA')} 
          />
        </View>
      )}

      {/* Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Контакти</Text>
        <InfoRow icon="mail" label="Email" value={employee.person.email} />
        {phone && <InfoRow icon="call" label="Телефон" value={phone.phone_number} />}
        {city && <InfoRow icon="location" label="Місто" value={city.name} />}
      </View>

      {/* Passport */}
      {passport && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🆔 Паспорт</Text>
          <InfoRow icon="card" label="Номер" value={passport.number} />
          <InfoRow icon="business" label="Ким виданий" value={passport.issued_by} />
          <InfoRow 
            icon="calendar" 
            label="Дата видачі" 
            value={new Date(passport.issue_date).toLocaleDateString('uk-UA')} 
          />
          {passport.expiry_date && (
            <InfoRow 
              icon="time" 
              label="Дійсний до" 
              value={new Date(passport.expiry_date).toLocaleDateString('uk-UA')} 
            />
          )}
        </View>
      )}

      {/* Personal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Особисті дані</Text>
        <InfoRow 
          icon="calendar" 
          label="Дата народження" 
          value={new Date(employee.person.birth_date).toLocaleDateString('uk-UA')} 
        />
        <InfoRow 
          icon="person" 
          label="Стать" 
          value={employee.person.gender === 'M' ? 'Чоловік' : 'Жінка'} 
        />
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>⚠️ Небезпечна зона</Text>
        <Text style={styles.dangerDescription}>
          Звільнення співробітника встановить дату звільнення на сьогодні і закриє всі активні посади.
        </Text>
        <TouchableOpacity 
          style={styles.dangerButton} 
          onPress={handleDismiss}>
          <Ionicons name="person-remove" size={20} color="white" />
          <Text style={styles.dangerButtonText}>Звільнити співробітника</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

// Допоміжний компонент для рядків інформації
const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color="#6b7280" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
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
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  headerEditButton: {
    padding: 4,
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  profileId: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'right',
    flex: 1,
  },
  dangerSection: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});