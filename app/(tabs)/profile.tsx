// app/(tabs)/profile.tsx
import { authAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await authAPI.getUser();
      setUser(data.user);
    } catch (error) {
      console.error('Помилка завантаження профілю:', error);
    } finally {
      setLoading(false);
    }
  };

  const performLogout = async () => {
    try {
      // Спробуємо вийти через API
      try {
        await authAPI.logout();
      } catch (apiError) {
        // Ігноруємо помилку API (можливо вже не авторизований)
        console.log('API logout error (ignored):', apiError);
      }

      // Очищаємо локальне сховище
      await AsyncStorage.clear();

      // Редірект на логін
      // У React Native з expo-router використовуємо router.replace
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Помилка', 'Не вдалося вийти. Спробуйте ще раз.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Вихід з акаунту',
      'Ви впевнені, що хочете вийти?',
      [
        {
          text: 'Скасувати',
          style: 'cancel',
        },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: performLogout,
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  const isDirector = user?.role?.role_name === 'director' || user?.role?.role_name === 'admin';

  return (
    <ScrollView style={styles.container}>
      {/* Профіль заголовок */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="white" />
        </View>
        <Text style={styles.name}>{user?.name || 'Користувач'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {isDirector ? '👑 Директор' : '✈️ Клієнт'}
          </Text>
        </View>
      </View>

      {/* Меню */}
      <View style={styles.menu}>
        <MenuItem
          icon="person-outline"
          title="Мій профіль"
          subtitle="Особисті дані"
          onPress={() => Alert.alert('Інфо', 'Редагування профілю в розробці')}
        />

        {isDirector && (
          <>
            <MenuItem
              icon="people-outline"
              title="Співробітники"
              subtitle="Керування персоналом"
              onPress={() => router.push('/staff')}
            />
            <MenuItem
              icon="bar-chart-outline"
              title="Звіти"
              subtitle="Фінансова аналітика"
              onPress={() => router.push('/reports')}
            />
          </>
        )}

        <MenuItem
          icon="help-circle-outline"
          title="Допомога"
          subtitle="Підтримка"
          onPress={() => Alert.alert('Допомога', 'Зверніться: support@mytravel.com')}
        />

        <MenuItem
          icon="settings-outline"
          title="Налаштування"
          subtitle="Мова, сповіщення"
          onPress={() => Alert.alert('Інфо', 'Налаштування в розробці')}
        />
      </View>

      {/* Кнопка виходу */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Вийти з системи</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Версія 1.0.0</Text>
    </ScrollView>
  );
}

const MenuItem = ({ icon, title, subtitle, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIcon}>
      <Ionicons name={icon} size={24} color="#3b82f6" />
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  email: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  roleBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
  menu: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  menuSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
  version: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginVertical: 20 },
});