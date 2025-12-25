import { toursAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TourDetails {
  template_id: number;
  name: string;
  description: string;
  base_price: number;
  calculated_price: number;
  duration_days: number;
  max_people: number;
  vacation_type?: {
    vacation_type_id: number;
    name: string;
  };
  season?: {
    name: string;
  };
  featured_image?: string;
  highlights?: string[];
  included_items?: string[];
  excluded_items?: string[];
  rooms?: {
    room_id: number;
    room_number: string;
    category_name: string;
    price_per_night: number;
    max_occupancy: number;
    hotel: {
      name: string;
      stars: number;
    };
  }[];
  transports?: {
    transport_id: number;
    transport_type: string;
    transport_number: string;
    price: number;
    direction: string;
    departure_city?: {
      name: string;
    };
    arrival_city?: {
      name: string;
    };
  }[];
  insurances?: {
    insurance_id: number;
    provider: string;
    policy_number: string;
    coverage: number;
    price: number;
  }[];
  services?: {
    service_id: number;
    name: string;
    price: number;
  }[];
  hotels?: {
    hotel_id: number;
    name: string;
    stars: number;
    city: string;
    country: string;
    rooms_count: number;
  }[];
}

export default function TourDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [userRole, setUserRole] = useState<string>('client');
  const [tour, setTour] = useState<TourDetails | null>(null);
  const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const initialize = async () => {
    setLoading(true);
    setError(null);

    try {
      // Запускаємо обидва запити паралельно
      const [tourResponse, roleFromStorage] = await Promise.all([
        toursAPI.getById(Number(id)),
        AsyncStorage.getItem('userRole'),
      ]);

      // Встановлюємо роль
      setUserRole(roleFromStorage || 'client');

      // Обробляємо тур
      const { data } = tourResponse;
      console.log('Завантажений тур:', data);

      if (data.success && data.type === 'tour_package' && data.tour) {
        setTour(data.tour);
      } else {
        setError('Це не готовий тур або тур не знайдено');
      }
    } catch (error: any) {
      console.error('Помилка:', error);
      setError(error.response?.data?.message || 'Не вдалося завантажити тур');
    } finally {
      setLoading(false);
    }
  };

  initialize();
}, [id]);


  const isClient = userRole === 'client';

  const handleRefresh = async () => {
  setRefreshing(true);
  // Повторюємо ту саму логіку
  try {
    const [tourResponse, roleFromStorage] = await Promise.all([
      toursAPI.getById(Number(id)),
      AsyncStorage.getItem('userRole'),
    ]);

    setUserRole(roleFromStorage || 'client');

    const { data } = tourResponse;
    if (data.success && data.type === 'tour_package' && data.tour) {
      setTour(data.tour);
      setError(null);
    } else {
      setError('Тур не знайдено');
    }
  } catch (error: any) {
    setError('Не вдалося оновити дані');
  } finally {
    setRefreshing(false);
  }
};

  const handleBook = () => {
  if (!tour) return;
  
  console.log('📦 Дані туру для бронювання:', {
    template_id: tour.template_id,
    vacation_type_id: tour.vacation_type?.vacation_type_id,
  });
  
  router.push({
    pathname: '/booking/create',
    params: {
      tour_id: String(tour.template_id),
    }
  });
};

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  }

  if (error || !tour) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error || 'Тур не знайдено'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Назад до каталогу</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{tour.name}</Text>
      </View>

      <ScrollView style={styles.scrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        {/* Зображення */}
        {tour.featured_image ? (
          <Image 
            source={{ uri: tour.featured_image }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroSection}>
            <Ionicons name="airplane" size={64} color="#3b82f6" />
          </View>
        )}

        {/* Основна інформація */}
        <View style={styles.titleSection}>
          <View style={styles.titleContent}>
            <Text style={styles.tourTitle}>{tour.name}</Text>
            {tour.vacation_type && (
              <View style={styles.badge}>
                <Ionicons name="pricetag" size={14} color="#3b82f6" />
                <Text style={styles.badgeText}>{tour.vacation_type.name}</Text>
              </View>
            )}
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Від</Text>
            <Text style={styles.price}>
              {Math.round(tour.calculated_price).toLocaleString('uk-UA')} ₴
            </Text>
          </View>
        </View>

        {/* Швидка інформація */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Інформація</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={styles.infoText}>{tour.duration_days} днів</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={20} color="#6b7280" />
              <Text style={styles.infoText}>До {tour.max_people} осіб</Text>
            </View>
            {tour.season && (
              <View style={styles.infoItem}>
                <Ionicons name="sunny-outline" size={20} color="#6b7280" />
                <Text style={styles.infoText}>{tour.season.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Опис */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Опис</Text>
          <Text style={styles.description}>{tour.description}</Text>
        </View>

        {/* Основні моменти */}
        {tour.highlights && tour.highlights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Основні переваги</Text>
            {tour.highlights.map((highlight, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.listItemText}>{highlight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Що включено */}
        {tour.included_items && tour.included_items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Що включено</Text>
            {tour.included_items.map((item, index) => (
              <View key={index} style={styles.includedItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.includedText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ✅ ДОДАНО: Готелі з деталями номерів */}
        {tour.rooms && tour.rooms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏨 Готелі та номери</Text>
            
            {/* Групуємо номери за готелями */}
            {Object.entries(
              tour.rooms.reduce((acc: any, room) => {
                const hotelName = room.hotel.name;
                if (!acc[hotelName]) {
                  acc[hotelName] = {
                    hotel: room.hotel,
                    rooms: []
                  };
                }
                acc[hotelName].rooms.push(room);
                return acc;
              }, {})
            ).map(([hotelName, data]: [string, any]) => (
              <View key={hotelName} style={styles.hotelBlock}>
                {/* Назва готелю */}
                <View style={styles.hotelHeader}>
                  <Text style={styles.hotelName}>{data.hotel.name}</Text>
                  <Text style={styles.hotelStars}>
                    {'⭐'.repeat(data.hotel.stars)}
                  </Text>
                </View>

                {/* Список номерів */}
                <View style={styles.roomsList}>
                  {data.rooms.map((room: any, idx: number) => (
                    <View key={idx} style={styles.roomCard}>
                      <View style={styles.roomHeader}>
                        <Text style={styles.roomCategory}>{room.category_name}</Text>
                        {room.room_number && (
                          <Text style={styles.roomNumber}>№ {room.room_number}</Text>
                        )}
                      </View>
                      <View style={styles.roomDetails}>
                        <View style={styles.roomDetail}>
                          <Ionicons name="cash-outline" size={14} color="#6b7280" />
                          <Text style={styles.roomDetailText}>
                            {Math.round(room.price_per_night).toLocaleString('uk-UA')} ₴/ніч
                          </Text>
                        </View>
                        <View style={styles.roomDetail}>
                          <Ionicons name="people-outline" size={14} color="#6b7280" />
                          <Text style={styles.roomDetailText}>
                            До {room.max_occupancy} осіб
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ✅ ДОДАНО: Транспорт */}
        {tour.transports && tour.transports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✈️ Транспорт</Text>
            
            {tour.transports
              .sort((a, b) => a.direction === 'outbound' ? -1 : 1)
              .map((transport, index) => (
                <View key={index} style={styles.transportCard}>
                  <View style={styles.transportHeader}>
                    <View style={styles.transportType}>
                      <Ionicons 
                        name={transport.transport_type === 'flight' ? 'airplane' : 'bus'} 
                        size={20} 
                        color="#3b82f6" 
                      />
                      <Text style={styles.transportTypeText}>
                        {transport.transport_type.toUpperCase()} {transport.transport_number}
                      </Text>
                    </View>
                    <View style={[
                      styles.directionBadge,
                      transport.direction === 'outbound' ? styles.outboundBadge : styles.returnBadge
                    ]}>
                      <Text style={styles.directionText}>
                        {transport.direction === 'outbound' ? 'Туди' : 'Назад'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.transportRoute}>
                    <Text style={styles.cityText}>
                      {transport.departure_city?.name || 'N/A'}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
                    <Text style={styles.cityText}>
                      {transport.arrival_city?.name || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.transportPrice}>
                    <Text style={styles.priceAmount}>
                      {Math.round(transport.price).toLocaleString('uk-UA')} ₴
                    </Text>
                    <Text style={styles.pricePerPerson}>за особу</Text>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* ✅ ДОДАНО: Страхування */}
        {tour.insurances && tour.insurances.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡️ Страхування</Text>
            
            {tour.insurances.map((insurance, index) => (
              <View key={index} style={styles.insuranceCard}>
                <View style={styles.insuranceHeader}>
                  <Text style={styles.insuranceProvider}>{insurance.provider}</Text>
                  <Text style={styles.insurancePrice}>
                    {Math.round(insurance.price).toLocaleString('uk-UA')} ₴
                  </Text>
                </View>

                <View style={styles.insuranceDetails}>
                  <View style={styles.insuranceDetail}>
                    <Ionicons name="document-text-outline" size={14} color="#6b7280" />
                    <Text style={styles.insuranceDetailText}>
                      Поліс: {insurance.policy_number}
                    </Text>
                  </View>
                  <View style={styles.insuranceDetail}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#6b7280" />
                    <Text style={styles.insuranceDetailText}>
                      Покриття до {Math.round(insurance.coverage).toLocaleString('uk-UA')} ₴
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ✅ ДОДАНО: Додаткові послуги */}
        {tour.services && tour.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Додаткові послуги</Text>
            
            {tour.services.map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                <View style={styles.serviceInfo}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                  <Text style={styles.serviceName}>{service.name}</Text>
                </View>
                <Text style={styles.servicePrice}>
                  {Math.round(service.price).toLocaleString('uk-UA')} ₴
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Що НЕ включено */}
        {tour.excluded_items && tour.excluded_items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❌ Що НЕ включено</Text>
            {tour.excluded_items.map((item, index) => (
              <View key={index} style={styles.excludedItem}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
                <Text style={styles.excludedText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Кнопка бронювання */}
      {isClient && tour && (
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Ionicons name="calendar" size={20} color="white" />
          <Text style={styles.bookButtonText}>Забронювати тур</Text>
        </TouchableOpacity>
      </View>
    )}
    </View>
  );
}

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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBackButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e5e7eb',
  },
  heroSection: {
    backgroundColor: '#eff6ff',
    padding: 48,
    alignItems: 'center',
    height: 250,
    justifyContent: 'center',
  },
  titleSection: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleContent: {
    flex: 1,
    paddingRight: 12,
  },
  tourTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  section: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 6,
  },
  listItemText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  includedText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  excludedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  excludedText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  // ✅ НОВІ СТИЛІ: Готелі з номерами
  hotelBlock: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  hotelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  hotelStars: {
    fontSize: 14,
  },
  roomsList: {
    gap: 8,
  },
  roomCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  roomNumber: {
    fontSize: 13,
    color: '#6b7280',
  },
  roomDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  roomDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomDetailText: {
    fontSize: 13,
    color: '#4b5563',
  },
  // ✅ НОВІ СТИЛІ: Транспорт
  transportCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transportType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transportTypeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  directionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  outboundBadge: {
    backgroundColor: '#dbeafe',
  },
  returnBadge: {
    backgroundColor: '#fef3c7',
  },
  directionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  transportRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cityText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  transportPrice: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  pricePerPerson: {
    fontSize: 12,
    color: '#6b7280',
  },
  // ✅ НОВІ СТИЛІ: Страхування
  insuranceCard: {
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  insuranceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insuranceProvider: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  insurancePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  insuranceDetails: {
    gap: 8,
  },
  insuranceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insuranceDetailText: {
    fontSize: 13,
    color: '#4b5563',
  },
  // ✅ НОВІ СТИЛІ: Додаткові послуги
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10b981',
  },
  bookButtonContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});