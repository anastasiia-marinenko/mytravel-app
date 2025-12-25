//app\booking\[id].tsx
import { bookingsAPI, ratingsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('client');
  const [loading, setLoading] = useState(true);
  
  // Модалки
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  // const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  
  // Форма відгуку
  const [ratingType, setRatingType] = useState('hotel');
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  
  // Форма оплати
  // const [paymentAmount, setPaymentAmount] = useState('');
  // const [paymentMethod, setPaymentMethod] = useState('1');
  
  // Форма відхилення
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role || 'client');
      
      const { data } = await bookingsAPI.getById(Number(id));
      setBooking(data.booking);
      
      try {
        const ratingsData = await ratingsAPI.getByPackage(Number(id));
        setRatings(ratingsData.data.ratings || []);
      } catch (err) {
        console.log('Відгуків поки немає');
      }
    } catch (error) {
      console.error('Помилка завантаження:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Скасування',
      'Ви впевнені, що хочете скасувати це бронювання?',
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingsAPI.cancel(Number(id));
              Alert.alert('Успіх', 'Бронювання скасовано');
              router.back();
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося скасувати');
            }
          },
        },
      ]
    );
  };

  const handleSubmitRating = async () => {
    if (!ratingComment.trim()) {
      Alert.alert('Помилка', 'Будь ласка, додайте коментар');
      return;
    }
    
    try {
      await ratingsAPI.create(Number(id), {
        rating_type: ratingType,
        rating: ratingValue,
        comments: ratingComment
      });
      
      Alert.alert('Успіх', 'Відгук додано');
      setRatingModalVisible(false);
      loadData();
    } catch (error: any) {
      Alert.alert('Помилка', error.response?.data?.message || 'Не вдалося додати відгук');
    }
  };

  // const handleSubmitPayment = async () => {
  //   const amount = parseFloat(paymentAmount);
    
  //   if (isNaN(amount) || amount <= 0) {
  //     Alert.alert('Помилка', 'Введіть коректну суму');
  //     return;
  //   }
    
  //   try {
  //     await paymentsAPI.create(Number(id), {
  //       package_id: Number(id),
  //       method_id: paymentMethod,
  //       amount: amount
  //     });
      
  //     Alert.alert('Успіх', 'Платіж проведено');
  //     setPaymentModalVisible(false);
  //     loadData();
  //   } catch (error: any) {
  //     Alert.alert('Помилка', error.response?.data?.message || 'Не вдалося провести платіж');
  //   }
  // };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Помилка', 'Вкажіть причину відхилення');
      return;
    }
    
    try {
      await bookingsAPI.reject(Number(id), rejectionReason);
      Alert.alert('Успіх', 'Бронювання відхилено');
      setRejectModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося відхилити');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text>Бронювання не знайдено</Text>
      </View>
    );
  }

  const canCancel = booking.booking_status?.name !== 'Скасовано' && 
                    booking.booking_status?.name !== 'Завершено';
  
  const canPay = userRole === 'client' && 
                 booking.booking_status?.name === 'Підтверджено' &&
                 booking.payment_status?.name !== 'Оплачено повністю';
  
  const canRate = userRole === 'client' && 
                  new Date(booking.end_date) < new Date();
  
  const isManager = userRole === 'manager' || userRole === 'director' || userRole === 'admin';
  const isCoordinator = userRole === 'coordinator' || userRole === 'director' || userRole === 'admin';

  return (
    <ScrollView style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Бронювання #{booking.package_id}</Text>
      </View>

      {/* Статус */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Статус бронювання</Text>
        <Text style={styles.statusValue}>{booking.booking_status?.name || 'N/A'}</Text>
        <Text style={styles.paymentLabel}>Статус оплати</Text>
        <Text style={styles.paymentValue}>{booking.payment_status?.name || 'N/A'}</Text>
      </View>

      {/* Інформація про тур */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Деталі туру</Text>
        <InfoRow icon="airplane" label="Тип" value={booking.vacation_type?.name || 'N/A'} />
        <InfoRow
          icon="calendar"
          label="Дати"
          value={`${new Date(booking.start_date).toLocaleDateString('uk-UA')} - ${new Date(booking.end_date).toLocaleDateString('uk-UA')}`}
        />
        <InfoRow
          icon="time"
          label="Тривалість"
          value={`${Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24))} днів`}
        />
        <InfoRow icon="people" label="Осіб" value={booking.number_of_people || '1'} />
      </View>

      {/* Готелі */}
      {booking.rooms?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏨 Готелі</Text>
          {booking.rooms.map((room: any, index: number) => (
            <View key={index} style={styles.resourceCard}>
              <Text style={styles.resourceName}>{room.hotel?.name || 'Готель'}</Text>
              <Text style={styles.resourceDetail}>
                Номер {room.room_number} • {room.price_per_night} ₴/ніч
              </Text>
              {room.hotel?.address?.city && (
                <Text style={styles.resourceDetail}>📍 {room.hotel.address.city.name}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Транспорт */}
      {booking.transports?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✈️ Транспорт</Text>
          {booking.transports.map((transport: any, index: number) => (
            <View key={index} style={styles.resourceCard}>
              <View style={styles.transportHeader}>
                <Ionicons 
                  name={transport.transport_type === 'flight' ? 'airplane' : 'bus'} 
                  size={24} 
                  color="#3b82f6" 
                />
                <Text style={styles.resourceName}>
                  {transport.transport_type?.toUpperCase()} {transport.transport_number}
                </Text>
              </View>
              <Text style={styles.resourceDetail}>
                {transport.departure_city?.name || 'N/A'} → {transport.arrival_city?.name || 'N/A'}
              </Text>
              <View style={styles.transportFooter}>
                <Text style={styles.transportPrice}>{transport.price} ₴</Text>
                <Text style={styles.transportPassengers}>
                  {transport.passenger_count || 1} пас.
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Страхування */}
      {booking.insurances?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Страхування</Text>
          {booking.insurances.map((insurance: any, index: number) => (
            <View key={index} style={styles.resourceCard}>
              <Text style={styles.resourceName}>{insurance.provider}</Text>
              <Text style={styles.resourceDetail}>
                Поліс: {insurance.policy_number}
              </Text>
              <Text style={styles.resourceDetail}>
                Покриття: {Math.round(insurance.coverage)} ₴
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Маршрут подорожі */}
      {booking.itineraries?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Маршрут подорожі</Text>
          {Object.entries(booking.itineraries_grouped || {}).map(([dayNumber, activities]: [string, any]) => (
            <View key={dayNumber} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>День {dayNumber}</Text>
                </View>
              </View>
              
              {activities.map((itinerary: any, idx: number) => (
                <View key={idx} style={styles.activityCard}>
                  <Text style={styles.activityTitle}>{itinerary.title}</Text>
                  
                  {itinerary.start_time && itinerary.end_time && (
                    <View style={styles.activityTime}>
                      <Ionicons name="time-outline" size={14} color="#6b7280" />
                      <Text style={styles.activityTimeText}>
                        {itinerary.start_time.substring(0, 5)} - {itinerary.end_time.substring(0, 5)}
                      </Text>
                    </View>
                  )}
                  
                  {itinerary.description && (
                    <Text style={styles.activityDescription}>{itinerary.description}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Вартість */}
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Базова вартість</Text>
          <Text style={styles.priceValue}>{Math.round(booking.base_cost || 0)} ₴</Text>
        </View>
        
        {booking.discount_amount > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Знижка</Text>
            <Text style={[styles.priceValue, { color: '#10b981' }]}>
              -{Math.round(booking.discount_amount)} ₴
            </Text>
          </View>
        )}
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Маржа агентства ({booking.agency_margin_percent || 15}%)</Text>
          <Text style={styles.priceValue}>{Math.round(booking.margin_amount || 0)} ₴</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Сервісний збір</Text>
          <Text style={styles.priceValue}>{Math.round(booking.service_fee_amount || booking.service_fee || 0)} ₴</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>До сплати</Text>
          <Text style={styles.totalValue}>{Math.round(booking.total_cost || 0)} ₴</Text>
        </View>
      </View>

      {/* Кнопки дій */}
      <View style={styles.actionsContainer}>
        {/* {canPay && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
            onPress={() => {
              setPaymentAmount(String(Math.round(booking.total_cost || 0)));
              setPaymentModalVisible(true);
            }}>
            <Ionicons name="card" size={20} color="white" />
            <Text style={styles.actionBtnText}>Оплатити</Text>
          </TouchableOpacity>
        )} */}
{canPay && (
  <TouchableOpacity 
    style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
    onPress={() => router.push(`/payment/create/${booking.package_id}`)}>
    <Ionicons name="card" size={20} color="white" />
    <Text style={styles.actionBtnText}>Оплатити</Text>
  </TouchableOpacity>
)}
        
        {canRate && ratings.length < 3 && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}
            onPress={() => setRatingModalVisible(true)}>
            <Ionicons name="star" size={20} color="white" />
            <Text style={styles.actionBtnText}>Залишити відгук</Text>
          </TouchableOpacity>
        )}
        
        {canCancel && userRole === 'client' && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
            onPress={handleCancel}>
            <Ionicons name="close-circle" size={20} color="white" />
            <Text style={styles.actionBtnText}>Скасувати</Text>
          </TouchableOpacity>
        )}
        
        {isCoordinator && booking.booking_status?.name === 'Очікує координатора' && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
            onPress={() => setRejectModalVisible(true)}>
            <Ionicons name="close" size={20} color="white" />
            <Text style={styles.actionBtnText}>Відхилити</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Модалка відгуку */}
      <Modal visible={ratingModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Залишити відгук</Text>
            
            <Text style={styles.inputLabel}>Категорія</Text>
            <View style={styles.ratingTypeContainer}>
              {['hotel', 'vacation_type', 'transport'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.ratingTypeBtn, ratingType === type && styles.ratingTypeBtnActive]}
                  onPress={() => setRatingType(type)}>
                  <Text style={[styles.ratingTypeText, ratingType === type && styles.ratingTypeTextActive]}>
                    {type === 'hotel' ? 'Готель' : type === 'vacation_type' ? 'Тип туру' : 'Транспорт'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Оцінка</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRatingValue(star)}>
                  <Ionicons 
                    name={star <= ratingValue ? 'star' : 'star-outline'} 
                    size={40} 
                    color="#f59e0b" 
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Коментар</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={ratingComment}
              onChangeText={setRatingComment}
              placeholder="Поділіться враженнями..."
              maxLength={200}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#6b7280' }]}
                onPress={() => setRatingModalVisible(false)}>
                <Text style={styles.modalBtnText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#f59e0b' }]}
                onPress={handleSubmitRating}>
                <Text style={styles.modalBtnText}>Відправити</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модалка оплати
      <Modal visible={paymentModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Оплата бронювання</Text>
            
            <Text style={styles.inputLabel}>Сума до оплати: {Math.round(booking.total_cost || 0)} ₴</Text>
            
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="Введіть суму"
            />
            
            <Text style={styles.inputLabel}>Спосіб оплати</Text>
            <View style={styles.paymentMethodContainer}>
              {[{ id: '1', name: 'Картка' }, { id: '2', name: 'Готівка' }, { id: '3', name: 'Банківський переказ' }].map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.paymentMethodBtn, paymentMethod === method.id && styles.paymentMethodBtnActive]}
                  onPress={() => setPaymentMethod(method.id)}>
                  <Text style={[styles.paymentMethodText, paymentMethod === method.id && styles.paymentMethodTextActive]}>
                    {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#6b7280' }]}
                onPress={() => setPaymentModalVisible(false)}>
                <Text style={styles.modalBtnText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#10b981' }]}
                onPress={handleSubmitPayment}>
                <Text style={styles.modalBtnText}>Оплатити</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}

      {/* Модалка відхилення */}
      <Modal visible={rejectModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Відхилити бронювання</Text>
            
            <Text style={styles.inputLabel}>Причина відхилення</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Вкажіть причину..."
              maxLength={500}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#6b7280' }]}
                onPress={() => setRejectModalVisible(false)}>
                <Text style={styles.modalBtnText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#ef4444' }]}
                onPress={handleReject}>
                <Text style={styles.modalBtnText}>Відхилити</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color="#6b7280" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  statusCard: { backgroundColor: 'white', margin: 12, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  statusLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  statusValue: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6', marginBottom: 12 },
  paymentLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  paymentValue: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  section: { backgroundColor: 'white', margin: 12, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  infoLabel: { fontSize: 14, color: '#6b7280', flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  resourceCard: { padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 8 },
  resourceName: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  resourceDetail: { fontSize: 14, color: '#6b7280' },
  transportHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  transportFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  transportPrice: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6' },
  transportPassengers: { fontSize: 12, color: '#6b7280' },
  dayCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  dayHeader: { marginBottom: 12 },
  dayBadge: { backgroundColor: '#8b5cf6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start' },
  dayBadgeText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  activityCard: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#8b5cf6' },
  activityTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  activityTime: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  activityTimeText: { fontSize: 12, color: '#6b7280' },
  activityDescription: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  priceCard: { backgroundColor: 'white', margin: 12, padding: 16, borderRadius: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  priceLabel: { fontSize: 14, color: '#6b7280' },
  priceValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
  actionsContainer: { padding: 12, gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  actionBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  textArea: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, minHeight: 100, textAlignVertical: 'top' },
  ratingTypeContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  ratingTypeBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  ratingTypeBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  ratingTypeText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
  ratingTypeTextActive: { color: 'white' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  paymentMethodContainer: { flexDirection: 'column', gap: 8, marginBottom: 16 },
  paymentMethodBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  paymentMethodBtnActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  paymentMethodText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
  paymentMethodTextActive: { color: 'white' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  modalBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  spacer: { height: 40 },
});