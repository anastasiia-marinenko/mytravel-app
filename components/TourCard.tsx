import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
// components/TourCard.tsx
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TourCardProps {
  tour: {
    template_id: number;
    name: string;
    description?: string;
    base_price: number;
    calculated_price?: number;
    duration_days: number;
    max_people?: number;
    vacation_type?: {
      name: string;
    };
    featured_image?: string;
    is_active: boolean;
    rooms?: any[];
    transports?: any[];
    insurances?: any[];
  };
}

export default function TourCard({ tour }: TourCardProps) {
  const handlePress = () => {
    router.push(`/tour/${tour.template_id}`);
  };

  const price = tour.calculated_price || tour.base_price || 0;

  return (
    <TouchableOpacity
      style={[styles.card, !tour.is_active && styles.cardInactive]}
      onPress={handlePress}
      activeOpacity={0.7}>
      
      {/* Зображення або іконка */}
      {tour.featured_image ? (
        <Image 
          source={{ uri: tour.featured_image }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="airplane" size={40} color="#3b82f6" />
        </View>
      )}

      {/* Бейдж неактивного туру */}
      {!tour.is_active && (
        <View style={styles.inactiveBadge}>
          <Text style={styles.inactiveBadgeText}>Недоступний</Text>
        </View>
      )}

      {/* Інформація */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {tour.name}
          </Text>
          
          {tour.vacation_type && (
            <View style={styles.typeBadge}>
              <Ionicons name="pricetag-outline" size={12} color="#3b82f6" />
              <Text style={styles.typeBadgeText} numberOfLines={1}>
                {tour.vacation_type.name}
              </Text>
            </View>
          )}
        </View>

        {tour.description && (
          <Text style={styles.description} numberOfLines={2}>
            {tour.description}
          </Text>
        )}
        
        {/* Характеристики */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.featureText}>{tour.duration_days} днів</Text>
          </View>
          
          {tour.max_people && (
            <View style={styles.feature}>
              <Ionicons name="people-outline" size={14} color="#6b7280" />
              <Text style={styles.featureText}>До {tour.max_people} осіб</Text>
            </View>
          )}
        </View>

        {/* Що включено */}
        <View style={styles.included}>
          {tour.rooms && tour.rooms.length > 0 && (
            <View style={styles.includedItem}>
              <Ionicons name="bed-outline" size={12} color="#10b981" />
              <Text style={styles.includedText}>Готель</Text>
            </View>
          )}
          {tour.transports && tour.transports.length > 0 && (
            <View style={styles.includedItem}>
              <Ionicons name="airplane-outline" size={12} color="#10b981" />
              <Text style={styles.includedText}>Транспорт</Text>
            </View>
          )}
          {tour.insurances && tour.insurances.length > 0 && (
            <View style={styles.includedItem}>
              <Ionicons name="shield-checkmark-outline" size={12} color="#10b981" />
              <Text style={styles.includedText}>Страховка</Text>
            </View>
          )}
        </View>

        {/* Ціна та кнопка */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Від</Text>
            <Text style={styles.price}>{Math.round(price)} ₴</Text>
          </View>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardInactive: {
    opacity: 0.6,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e7eb',
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  inactiveBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  features: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  included: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
  },
  includedText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});