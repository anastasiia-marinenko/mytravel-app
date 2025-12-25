import { TourFilters, toursAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Tour {
  template_id: number;
  name: string;
  description: string;
  base_price: number;
  calculated_price: number;
  duration_days: number;
  max_people: number;
  vacation_type?: { name: string };
  season?: { name: string };
  featured_image?: string;
  is_active: boolean;
  rooms_count: number;
  transports_count: number;
  insurances_count: number;
  services_count: number;
}

export default function ToursScreen() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Фільтри
  const [filters, setFilters] = useState<TourFilters>({
    sort: 'price',
    min_price: 0,
    max_price: 1000000,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTours();
  }, [filters]); // ✅ Завантажуємо при зміні фільтрів

  const loadTours = async () => {
    try {
      setError(null);
      setLoading(!tours.length); // показуємо лоадер лише при першому завантаженні
      setRefreshing(true);
      
      const { data } = await toursAPI.getTourPackages(filters);
      
      if (data.success && Array.isArray(data.tours)) {
        setTours(data.tours);
      } else {
        throw new Error('Неправильний формат даних');
      }
    } catch (err: any) {
      console.error('❌ Помилка:', err);
      setError(err.response?.data?.message || 'Не вдалося завантажити тури');
      setTours([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    // ✅ Завантаження відбудеться автоматично через useEffect([filters])
  };

  const clearFilters = () => {
    setFilters({
      sort: 'price',
      min_price: 0,
      max_price: 1000000,
    });
    setShowFilters(false);
  };

  const handleTourPress = (tourId: number) => {
    router.push(`/tour/${tourId}`);
  };

  const renderTour = ({ item }: { item: Tour }) => (
    <TouchableOpacity 
      style={styles.tourCard}
      onPress={() => handleTourPress(item.template_id)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.featured_image ? (
          <Image 
            source={{ uri: item.featured_image }}
            style={styles.tourImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="airplane" size={64} color="#93c5fd" />
          </View>
        )}
        {item.vacation_type && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.vacation_type.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.tourInfo}>
        <Text style={styles.tourName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.tourDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.features}>
          {item.rooms_count > 0 && (
            <View style={styles.feature}>
              <Ionicons name="bed" size={16} color="#10b981" />
              <Text style={styles.featureText}>{item.rooms_count}</Text>
            </View>
          )}
          {item.transports_count > 0 && (
            <View style={styles.feature}>
              <Ionicons name="airplane" size={16} color="#3b82f6" />
              <Text style={styles.featureText}>{item.transports_count}</Text>
            </View>
          )}
          {item.insurances_count > 0 && (
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={16} color="#8b5cf6" />
              <Text style={styles.featureText}>Стр.</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Від</Text>
            <Text style={styles.price}>
              {Math.round(item.calculated_price).toLocaleString('uk-UA')} ₴
            </Text>
          </View>
          <View style={styles.duration}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.durationText}>{item.duration_days} днів</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ✅ Показуємо лоадер лише при першому завантаженні
  if (loading && tours.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Завантаження турів...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>✈️ Каталог турів</Text>
          <Text style={styles.headerSubtitle}>Оберіть готовий турпакет</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          <Ionicons name="filter" size={20} color="#4f46e5" />
          <Text style={styles.filterText}>Фільтри</Text>
        </TouchableOpacity>
      </View>

      {/* Основний список */}
      <FlatList
        data={tours}
        renderItem={renderTour}
        keyExtractor={(item) => item.template_id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={loadTours}
            colors={['#4f46e5']}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {error ? (
              <>
                <Ionicons name="alert-circle" size={64} color="#ef4444" />
                <Text style={styles.emptyText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadTours}>
                  <Text style={styles.retryButtonText}>Спробувати ще раз</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="airplane-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>Турів поки немає</Text>
              </>
            )}
          </View>
        }
      />

      {/* Модальне вікно фільтрів */}
      <Modal visible={showFilters} animationType="slide">
        <View style={styles.modalContainer}>
          {/* Header модалі */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Фільтри та сортування</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Сортування */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Сортувати за</Text>
              {(['price', 'duration', 'name'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setFilters({ ...filters, sort: opt })}
                  style={[
                    styles.filterOption,
                    filters.sort === opt && styles.filterOptionActive
                  ]}
                >
                  <Text style={filters.sort === opt ? styles.filterOptionTextActive : {}}>
                    {opt === 'price' ? 'Ціною ↑' : 
                     opt === 'duration' ? 'Тривалістю' : 'Назвою'}
                  </Text>
                  {filters.sort === opt && (
                    <Ionicons name="checkmark" size={18} color="#4f46e5" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Ціна */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Ціна: {filters.min_price.toLocaleString()} – {filters.max_price.toLocaleString()} ₴
              </Text>
              <View style={styles.priceInputs}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Мін.</Text>
                  <TextInput
                    style={styles.input}
                    value={filters.min_price?.toString()}
                    onChangeText={(v) => {
                      const val = v === '' ? 0 : parseInt(v) || 0;
                      setFilters({ ...filters, min_price: val });
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Макс.</Text>
                  <TextInput
                    style={styles.input}
                    value={filters.max_price?.toString()}
                    onChangeText={(v) => {
                      const val = v === '' ? 1000000 : parseInt(v) || 1000000;
                      setFilters({ ...filters, max_price: val });
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Тривалість */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Тривалість</Text>
              {(['3-5', '5-7', '7-14', '14+'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setFilters({ 
                    ...filters, 
                    duration: filters.duration === opt ? undefined : opt 
                  })}
                  style={[
                    styles.filterOption,
                    filters.duration === opt && styles.filterOptionActive
                  ]}
                >
                  <Text style={filters.duration === opt ? styles.filterOptionTextActive : {}}>
                    {opt === '3-5' ? '3–5 днів' :
                     opt === '5-7' ? '5–7 днів' :
                     opt === '7-14' ? '7–14 днів' : '14+ днів'}
                  </Text>
                  {filters.duration === opt && (
                    <Ionicons name="checkmark" size={18} color="#4f46e5" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Кнопки */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Скинути</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Застосувати</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  list: {
    padding: 12,
  },
  tourCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  tourImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tourInfo: {
    padding: 16,
  },
  tourName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  tourDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  features: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d4ed8',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#6b7280',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  filterOptionTextActive: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});