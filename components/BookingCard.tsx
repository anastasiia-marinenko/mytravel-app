// components/BookingCard.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BookingCardProps {
  booking: any;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Підтверджено':
        return { bg: '#dcfce7', text: '#10b981', border: '#10b981' };
      case 'В обробці':
        return { bg: '#fef3c7', text: '#f59e0b', border: '#f59e0b' };
      case 'Очікує координатора':
        return { bg: '#dbeafe', text: '#3b82f6', border: '#3b82f6' };
      case 'Скасовано':
        return { bg: '#fee2e2', text: '#ef4444', border: '#ef4444' };
      case 'Відхилено':
        return { bg: '#f3f4f6', text: '#6b7280', border: '#6b7280' };
      default:
        return { bg: '#f3f4f6', text: '#9ca3af', border: '#9ca3af' };
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Оплачено повністю':
        return { bg: '#dcfce7', text: '#10b981' };
      case 'Оплачено частково':
        return { bg: '#fef3c7', text: '#f59e0b' };
      case 'Очікує оплати':
        return { bg: '#fee2e2', text: '#ef4444' };
      default:
        return { bg: '#f3f4f6', text: '#9ca3af' };
    }
  };

  const statusColors = getStatusColor(booking.booking_status?.name || '');
  const paymentColors = getPaymentColor(booking.payment_status?.name || '');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateDuration = () => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/booking/${booking.package_id}`)}
      activeOpacity={0.7}>
      
      {/* Заголовок */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.bookingId}>#{booking.package_id}</Text>
          <View style={[styles.vacationTypeBadge]}>
            <Text style={styles.vacationTypeText}>
              {booking.vacation_type?.name || 'Подорож'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.price}>{Math.round(booking.total_cost || 0)} ₴</Text>
        </View>
      </View>

      {/* Дати та тривалість */}
      <View style={styles.dateSection}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.dateText}>
            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
          </Text>
        </View>
        <View style={styles.durationBadge}>
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text style={styles.durationText}>{calculateDuration()} днів</Text>
        </View>
      </View>

      {/* Готель (якщо є) */}
      {booking.rooms?.[0]?.hotel && (
        <View style={styles.hotelSection}>
          <Ionicons name="bed-outline" size={16} color="#6b7280" />
          <Text style={styles.hotelText} numberOfLines={1}>
            {booking.rooms[0].hotel.name}
          </Text>
          {booking.rooms[0].hotel.stars && (
            <View style={styles.starsContainer}>
              {[...Array(booking.rooms[0].hotel.stars)].map((_, i) => (
                <Ionicons key={i} name="star" size={12} color="#fbbf24" />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Статуси */}
      <View style={styles.statusSection}>
        <View style={[styles.statusBadge, { 
          backgroundColor: statusColors.bg,
          borderColor: statusColors.border
        }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {booking.booking_status?.name}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { 
          backgroundColor: paymentColors.bg 
        }]}>
          <Ionicons 
            name={
              booking.payment_status?.name === 'Оплачено повністю' ? 'checkmark-circle' :
              booking.payment_status?.name === 'Оплачено частково' ? 'time' :
              'alert-circle'
            }
            size={14}
            color={paymentColors.text}
          />
          <Text style={[styles.statusText, { color: paymentColors.text }]}>
            {booking.payment_status?.name}
          </Text>
        </View>
      </View>

      {/* Кількість людей */}
      {booking.number_of_people > 1 && (
        <View style={styles.peopleSection}>
          <Ionicons name="people-outline" size={16} color="#6b7280" />
          <Text style={styles.peopleText}>
            {booking.number_of_people} {booking.number_of_people === 1 ? 'особа' : 
             booking.number_of_people < 5 ? 'особи' : 'осіб'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  bookingId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  vacationTypeBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vacationTypeText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#4b5563',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  hotelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  hotelText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  statusSection: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  peopleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  peopleText: {
    fontSize: 13,
    color: '#6b7280',
  },
});