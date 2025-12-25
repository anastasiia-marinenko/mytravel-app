import BookingCard from '@/components/BookingCard';
import { bookingsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('client');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [selectedFilter, bookings]);

  const loadData = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role || 'client');
      await loadBookings();
    } catch (error) {
      console.error('Помилка завантаження:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const { data } = await bookingsAPI.getAll();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Помилка завантаження бронювань:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити бронювання');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = () => {
    if (selectedFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter((b: any) => {
        if (selectedFilter === 'pending') return b.booking_status?.name === 'В обробці';
        if (selectedFilter === 'coordinator') return b.booking_status?.name === 'Очікує координатора';
        if (selectedFilter === 'confirmed') return b.booking_status?.name === 'Підтверджено';
        if (selectedFilter === 'cancelled') return b.booking_status?.name === 'Скасовано';
        if (selectedFilter === 'rejected') return b.booking_status?.name === 'Відхилено';
        if (selectedFilter === 'payment_pending') return b.payment_status?.name === 'Очікує оплати';
        if (selectedFilter === 'payment_partial') return b.payment_status?.name === 'Оплачено частково';
        if (selectedFilter === 'payment_full') return b.payment_status?.name === 'Оплачено повністю';
        return true;
      });
      setFilteredBookings(filtered);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleProcess = async (id: number) => {
    Alert.alert(
      'Відправити на перевірку?',
      'Це бронювання буде передано координатору для підтвердження.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Відправити',
          onPress: async () => {
            try {
              await bookingsAPI.process(id);
              Alert.alert('Успіх', 'Бронювання відправлено координатору');
              loadBookings();
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося відправити бронювання');
            }
          },
        },
      ]
    );
  };

  const handleApprove = async (id: number) => {
    Alert.alert(
      'Підтвердити бронювання?',
      'Ви впевнені, що хочете підтвердити це бронювання?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Підтвердити',
          onPress: async () => {
            try {
              await bookingsAPI.approve(id);
              Alert.alert('Успіх', 'Бронювання підтверджено');
              loadBookings();
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося підтвердити');
            }
          },
        },
      ]
    );
  };

  const isDirector = userRole === 'director' || userRole === 'admin';
  const isManager = userRole === 'manager';
  const isCoordinator = userRole === 'coordinator';

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Заголовок — як на сторінці турів */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            📋 {isDirector ? 'Всі бронювання' : 'Мої бронювання'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {filteredBookings.length} {filteredBookings.length === 1 ? 'бронювання' : 'бронювань'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#4f46e5" />
          <Text style={styles.filterText}>Фільтри</Text>
          {selectedFilter !== 'all' && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {/* Список бронювань */}
      <FlatList
        data={filteredBookings}
        renderItem={({ item }) => (
          <View style={styles.bookingWrapper}>
            <BookingCard booking={item} />

            {/* Дії для персоналу */}
            {isManager && item.booking_status?.name === 'В обробці' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleProcess(item.package_id)}
              >
                <Ionicons name="paper-plane" size={16} color="white" />
                <Text style={styles.actionButtonText}>Відправити координатору</Text>
              </TouchableOpacity>
            )}

            {isCoordinator && item.booking_status?.name === 'Очікує координатора' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={() => handleApprove(item.package_id)}
              >
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text style={styles.actionButtonText}>Підтвердити</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        keyExtractor={(item) => item.package_id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {selectedFilter === 'all'
                ? (isDirector ? 'Бронювань немає' : 'У вас поки немає бронювань')
                : 'Немає бронювань з таким статусом'}
            </Text>
            {selectedFilter !== 'all' && (
              <TouchableOpacity
                style={styles.resetFilterButton}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={styles.resetFilterText}>Скинути фільтр</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Модальне вікно фільтрів */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Фільтри</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>Статус бронювання</Text>
            <FilterOption label="Всі бронювання" value="all" selected={selectedFilter === 'all'} onSelect={() => { setSelectedFilter('all'); setFilterModalVisible(false); }} />
            <FilterOption label="В обробці" value="pending" selected={selectedFilter === 'pending'} onSelect={() => { setSelectedFilter('pending'); setFilterModalVisible(false); }} color="#f59e0b" />
            <FilterOption label="Очікує координатора" value="coordinator" selected={selectedFilter === 'coordinator'} onSelect={() => { setSelectedFilter('coordinator'); setFilterModalVisible(false); }} color="#3b82f6" />
            <FilterOption label="Підтверджено" value="confirmed" selected={selectedFilter === 'confirmed'} onSelect={() => { setSelectedFilter('confirmed'); setFilterModalVisible(false); }} color="#10b981" />
            <FilterOption label="Скасовано" value="cancelled" selected={selectedFilter === 'cancelled'} onSelect={() => { setSelectedFilter('cancelled'); setFilterModalVisible(false); }} color="#ef4444" />
            <FilterOption label="Відхилено" value="rejected" selected={selectedFilter === 'rejected'} onSelect={() => { setSelectedFilter('rejected'); setFilterModalVisible(false); }} color="#6b7280" />

            <Text style={styles.filterSectionTitle}>Статус оплати</Text>
            <FilterOption label="Очікує оплати" value="payment_pending" selected={selectedFilter === 'payment_pending'} onSelect={() => { setSelectedFilter('payment_pending'); setFilterModalVisible(false); }} color="#f97316" />
            <FilterOption label="Оплачено частково" value="payment_partial" selected={selectedFilter === 'payment_partial'} onSelect={() => { setSelectedFilter('payment_partial'); setFilterModalVisible(false); }} color="#eab308" />
            <FilterOption label="Оплачено повністю" value="payment_full" selected={selectedFilter === 'payment_full'} onSelect={() => { setSelectedFilter('payment_full'); setFilterModalVisible(false); }} color="#10b981" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const FilterOption = ({ label, value, selected, onSelect, color }: any) => (
  <TouchableOpacity
    style={[styles.filterOption, selected && styles.filterOptionSelected]}
    onPress={onSelect}
  >
    <View style={[styles.filterDot, color && { backgroundColor: color }]} />
    <Text style={[styles.filterOptionText, selected && styles.filterOptionTextSelected]}>
      {label}
    </Text>
    {selected && <Ionicons name="checkmark" size={20} color="#3b82f6" />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Новий заголовок — як на сторінці турів
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  // Кнопка фільтрів — як на сторінці турів
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  filterText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  list: {
    padding: 12,
  },
  bookingWrapper: {
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  resetFilterButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    gap: 12,
  },
  filterOptionSelected: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  filterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#d1d5db',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  filterOptionTextSelected: {
    fontWeight: '600',
    color: '#3b82f6',
  },
});