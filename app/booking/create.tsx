// app/booking/create.tsx
import { ajaxAPI, bookingsAPI, toursAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateBookingScreen() {
  const params = useLocalSearchParams();
  const tour_id = params.tour_id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState<any>(null);

  // Основні поля
  const [startDate, setStartDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [numberOfPeople, setNumberOfPeople] = useState('1');
  const [notes, setNotes] = useState('');

  // Дані для конструктора
  const [vacationTypes, setVacationTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [transportsOutbound, setTransportsOutbound] = useState<any[]>([]);
  const [transportsReturn, setTransportsReturn] = useState<any[]>([]);
  const [insurances, setInsurances] = useState<any[]>([]);
  const [additionalServices, setAdditionalServices] = useState<any[]>([]);

  // Обрані значення
  const [selectedVacationType, setSelectedVacationType] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedTransportOutbound, setSelectedTransportOutbound] = useState('');
  const [selectedTransportReturn, setSelectedTransportReturn] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceQuantities, setServiceQuantities] = useState<{ [key: string]: string }>({});

  // Пікери дат
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Модалки вибору
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showOutboundModal, setShowOutboundModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

  useEffect(() => {
    if (tour_id) {
      loadTourData();
    } else {
      loadConstructorData();
    }
  }, [tour_id]);

  const loadTourData = async () => {
  try {
    setLoading(true);
    const { data } = await toursAPI.getById(Number(tour_id));
    
    console.log('📦 Отримані дані туру:', data); // для дебагу
    
    if (data.success && data.type === 'tour_package' && data.tour) {
      setSelectedTour(data.tour);
      
      // ✅ Встановлюємо vacation_type_id з туру
      if (data.tour.vacation_type?.vacation_type_id) {
        setSelectedVacationType(data.tour.vacation_type.vacation_type_id);
      }
      
      setStartDate(new Date());
      const end = new Date();
      end.setDate(end.getDate() + data.tour.duration_days);
      setEndDate(end);
      
      // Завантажити insurances/services
      const [ins, serv] = await Promise.all([
        ajaxAPI.getInsurances(),
        ajaxAPI.getAdditionalServices(),
      ]);
      setInsurances(ins.data);
      setAdditionalServices(serv.data);
    } else {
      Alert.alert('Помилка', 'Невірний тур');
      router.back();
    }
  } catch (error) {
    console.error('❌ Помилка завантаження туру:', error);
    Alert.alert('Помилка', 'Не вдалося завантажити тур');
    router.back();
  } finally {
    setLoading(false);
  }
};

  const loadConstructorData = async () => {
    try {
      setLoading(true);
      // ✅ ВИПРАВЛЕНО: Завантажити всі необхідні дані
      const [vt, cnt, ins, serv] = await Promise.all([
        ajaxAPI.getVacationTypes(),
        ajaxAPI.getCountries(),
        ajaxAPI.getInsurances(),
        ajaxAPI.getAdditionalServices(),
      ]);
      setVacationTypes(vt.data);
      setCountries(cnt.data);
      setInsurances(ins.data);
      setAdditionalServices(serv.data);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити дані');
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (countryId: string) => {
    try {
      const { data } = await ajaxAPI.getCities(Number(countryId));
      setCities(data);
    } catch {
      Alert.alert('Помилка', 'Не вдалося завантажити міста');
    }
  };

  const loadHotels = async (cityId: string) => {
    try {
      const { data } = await ajaxAPI.getHotels(Number(cityId));
      setHotels(data);
    } catch {
      Alert.alert('Помилка', 'Не вдалося завантажити готелі');
    }
  };

  const loadRooms = async (hotelId: string) => {
    try {
      const { data } = await ajaxAPI.getRooms(Number(hotelId));
      setRooms(data);
    } catch {
      Alert.alert('Помилка', 'Не вдалося завантажити номери');
    }
  };

  const loadTransportsOutbound = async (cityId: string) => {
    try {
      const { data } = await ajaxAPI.getTransportsOutbound(Number(cityId));
      setTransportsOutbound(data);
    } catch {
      Alert.alert('Помилка', 'Не вдалося завантажити транспорт туди');
    }
  };

  const loadTransportsReturn = async (cityId: string) => {
    try {
      const { data } = await ajaxAPI.getTransportsReturn(Number(cityId));
      setTransportsReturn(data);
    } catch {
      Alert.alert('Помилка', 'Не вдалося завантажити транспорт назад');
    }
  };

  const handleSubmit = async () => {
  if (loading) return;

  // ✅ ВИПРАВЛЕНО: Правильний шлях до vacation_type_id
  const vacationTypeId = selectedTour 
    ? selectedTour.vacation_type?.vacation_type_id 
    : selectedVacationType;

  // Валідація
  if (!vacationTypeId) {
    Alert.alert('Помилка', 'Не вказано тип відпочинку');
    return;
  }

  const data: any = {
    vacation_type_id: vacationTypeId,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    number_of_people: parseInt(numberOfPeople),
    notes: notes || null,
  };

  if (selectedTour) {
    data.tour_id = selectedTour.template_id;
  } else {
    data.room_ids = selectedRoom ? [selectedRoom] : [];
    data.transport_ids = [];
    if (selectedTransportOutbound) data.transport_ids.push(selectedTransportOutbound);
    if (selectedTransportReturn) data.transport_ids.push(selectedTransportReturn);
    data.insurance_ids = selectedInsurance ? [selectedInsurance] : [];
    data.service_ids = selectedServices;
    
    if (Object.keys(serviceQuantities).length > 0) {
      data.service_quantities = serviceQuantities;
    }
  }

  console.log('📤 Відправка бронювання:', data);

  try {
    setLoading(true);
    const response = await bookingsAPI.create(data);
    Alert.alert('Успіх', 'Бронювання створено!', [
      { text: 'OK', onPress: () => router.replace(`/booking/${response.data.booking.package_id}`) },
    ]);
  } catch (error: any) {
    console.error('❌ Помилка створення:', error);
    const msg = error.response?.data?.message || 'Не вдалося створити бронювання';
    Alert.alert('Помилка', msg);
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedTour ? 'Забронювати тур' : 'Створити бронювання'}
        </Text>
      </View>

      {/* Картка туру */}
      {selectedTour && (
        <View style={styles.tourCard}>
          <Text style={styles.tourName}>{selectedTour.name}</Text>
          <Text style={styles.tourPrice}>
            Від {Math.round(selectedTour.calculated_price || selectedTour.base_price || 0)} ₴
          </Text>
          <Text style={styles.sectionTitle}>Включено в тур:</Text>
          {selectedTour.rooms?.length > 0 && (
            <View style={styles.includedItem}>
              <Ionicons name="bed" size={20} color="#fff" />
              <Text style={styles.includedText}>Готелі ({selectedTour.rooms.length} номерів)</Text>
            </View>
          )}
          {selectedTour.transports?.length > 0 && (
            <View style={styles.includedItem}>
              <Ionicons name="airplane" size={20} color="#fff" />
              <Text style={styles.includedText}>Транспорт туди і назад</Text>
            </View>
          )}
          {selectedTour.insurances?.length > 0 && (
            <View style={styles.includedItem}>
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
              <Text style={styles.includedText}>Страхування</Text>
            </View>
          )}
          {selectedTour.services?.length > 0 && (
            <View style={styles.includedItem}>
              <Ionicons name="star" size={20} color="#fff" />
              <Text style={styles.includedText}>{selectedTour.services.length} додаткових послуг</Text>
            </View>
          )}
        </View>
      )}

      {/* Тип відпочинку (тільки конструктор) */}
      {!selectedTour && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Тип відпочинку *</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setShowVacationModal(true)}>
            <Text style={styles.selectText}>
              {selectedVacationType
                ? vacationTypes.find((v) => v.id === selectedVacationType)?.name || 'Оберіть'
                : 'Оберіть тип відпочинку'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Дати та кількість осіб */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Дати та кількість осіб</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Дата початку *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
            <Ionicons name="calendar" size={20} color="#6b7280" />
            <Text style={styles.dateText}>{startDate.toLocaleDateString('uk-UA')}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (date) {
                  setStartDate(date);
                  if (selectedTour) {
                    const newEnd = new Date(date);
                    newEnd.setDate(newEnd.getDate() + selectedTour.duration_days);
                    setEndDate(newEnd);
                  }
                }
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Дата закінчення *</Text>
          <TouchableOpacity
            style={[styles.dateButton, selectedTour && styles.disabledButton]}
            onPress={() => !selectedTour && setShowEndPicker(true)}
            disabled={!!selectedTour}
          >
            <Ionicons name="calendar" size={20} color="#6b7280" />
            <Text style={styles.dateText}>{endDate.toLocaleDateString('uk-UA')}</Text>
          </TouchableOpacity>
          {selectedTour && (
            <Text style={styles.helperText}>Автоматично ({selectedTour.duration_days} днів)</Text>
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
              onChange={(event, date) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Кількість осіб *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={numberOfPeople}
            onChangeText={setNumberOfPeople}
            placeholder="1"
          />
          {selectedTour && (
            <Text style={styles.helperText}>Максимум: {selectedTour.max_people} осіб</Text>
          )}
        </View>
      </View>

      {/* Конструктор — готель, транспорт, страхування, послуги */}
      {!selectedTour && (
        <>
          {/* Готель */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Готель та номер *</Text>

            <TouchableOpacity style={styles.selectButton} onPress={() => setShowCountryModal(true)}>
              <Text style={styles.selectText}>
                {selectedCountry ? countries.find((c) => c.id === selectedCountry)?.name : 'Оберіть країну'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>

            {selectedCountry && (
              <TouchableOpacity style={styles.selectButton} onPress={() => setShowCityModal(true)}>
                <Text style={styles.selectText}>
                  {selectedCity ? cities.find((c) => c.id === selectedCity)?.name : 'Оберіть місто'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}

            {selectedCity && (
              <TouchableOpacity style={styles.selectButton} onPress={() => setShowHotelModal(true)}>
                <Text style={styles.selectText}>
                  {selectedHotel ? hotels.find((h) => h.id === selectedHotel)?.name : 'Оберіть готель'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}

            {selectedHotel && (
              <TouchableOpacity style={styles.selectButton} onPress={() => setShowRoomModal(true)}>
                <Text style={styles.selectText}>
                  {selectedRoom
                    ? (() => {
                        const room = rooms.find((r) => r.id === selectedRoom);
                        return room ? `${room.name} (${room.price_per_night} ₴/ніч)` : 'Оберіть номер';
                      })()
                    : 'Оберіть номер'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Транспорт */}
          {selectedCity && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Транспорт</Text>

              <TouchableOpacity style={styles.selectButton} onPress={() => setShowOutboundModal(true)}>
                <Text style={styles.selectText}>
                  {selectedTransportOutbound
                    ? transportsOutbound.find((t) => t.id === selectedTransportOutbound)?.transport_number || 'Туди'
                    : 'Транспорт туди (не обов\'язково)'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.selectButton} onPress={() => setShowReturnModal(true)}>
                <Text style={styles.selectText}>
                  {selectedTransportReturn
                    ? transportsReturn.find((t) => t.id === selectedTransportReturn)?.transport_number || 'Назад'
                    : 'Транспорт назад (не обов\'язково)'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}

          {/* Страхування */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Страхування (не обов'язково)</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setShowInsuranceModal(true)}>
              <Text style={styles.selectText}>
                {selectedInsurance
                  ? insurances.find((i) => i.id === selectedInsurance)?.provider || 'Оберіть'
                  : 'Оберіть страхування'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Додаткові послуги */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Додаткові послуги (не обов'язково)</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setShowServicesModal(true)}>
              <Text style={styles.selectText}>
                Обрано {selectedServices.length} послуг
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Примітки */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Примітки</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Додаткові побажання..."
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {/* Кнопка створення */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Ionicons name="checkmark-circle" size={20} color="white" />
        <Text style={styles.submitButtonText}>
          {loading ? 'Створення...' : selectedTour ? 'Забронювати тур' : 'Створити бронювання'}
        </Text>
      </TouchableOpacity>

      {/* Модалки вибору */}
      {/* Тип відпочинку */}
      <Modal visible={showVacationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Оберіть тип відпочинку</Text>
            <ScrollView>
              {vacationTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedVacationType(type.id);
                    setShowVacationModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowVacationModal(false)}>
              <Text style={styles.modalCloseText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Країна */}
      <Modal visible={showCountryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Оберіть країну</Text>
            <ScrollView>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCountry(country.id);
                    setSelectedCity('');
                    setSelectedHotel('');
                    setSelectedRoom('');
                    setTransportsOutbound([]);
                    setTransportsReturn([]);
                    loadCities(country.id);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{country.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCountryModal(false)}>
              <Text style={styles.modalCloseText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Місто */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Оберіть місто</Text>
            <ScrollView>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCity(city.id);
                    setSelectedHotel('');
                    setSelectedRoom('');
                    loadHotels(city.id);
                    // ✅ ВИПРАВЛЕНО: Автоматично завантажити транспорт
                    loadTransportsOutbound(city.id);
                    loadTransportsReturn(city.id);
                    setShowCityModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{city.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCityModal(false)}>
              <Text style={styles.modalCloseText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Готель */}
      <Modal visible={showHotelModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Оберіть готель</Text>
            <ScrollView>
              {hotels.map((hotel) => (
                <TouchableOpacity
                  key={hotel.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedHotel(hotel.id);
                    setSelectedRoom('');
                    loadRooms(hotel.id);
                    setShowHotelModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{hotel.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowHotelModal(false)}>
              <Text style={styles.modalCloseText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Номер */}
      <Modal visible={showRoomModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Оберіть номер</Text>
            <ScrollView>
              {rooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedRoom(room.id);
                    setShowRoomModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>
                    {room.name} ({room.price_per_night} ₴/ніч)
                  </Text>
                  <Text style={styles.modalSubtext}>До {room.max_occupancy} осіб</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowRoomModal(false)}>
              <Text style={styles.modalCloseText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Транспорт туди */}
      <Modal visible={showOutboundModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Транспорт туди</Text>
            <ScrollView>
              <TouchableOpacity style={styles.modalItem} onPress={() => {
                setSelectedTransportOutbound('');
                setShowOutboundModal(false);
              }}>
                <Text style={styles.modalItemText}>Без транспорту</Text>
              </TouchableOpacity>
              {transportsOutbound.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedTransportOutbound(t.id);
                    setShowOutboundModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>
                    {t.transport_type} {t.transport_number} ({t.price} ₴)
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowOutboundModal(false)}>
              <Text style={styles.modalCloseText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Транспорт назад */}
      <Modal visible={showReturnModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Транспорт назад</Text>
            <ScrollView>
              <TouchableOpacity style={styles.modalItem} onPress={() => {
                setSelectedTransportReturn('');
                setShowReturnModal(false);
              }}>
                <Text style={styles.modalItemText}>Без транспорту</Text>
              </TouchableOpacity>
              {transportsReturn.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedTransportReturn(t.id);
                    setShowReturnModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>
                    {t.transport_type} {t.transport_number} ({t.price} ₴)
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowReturnModal(false)}>
              <Text style={styles.modalCloseText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Страхування */}
      <Modal visible={showInsuranceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Страхування</Text>
            <ScrollView>
              <TouchableOpacity style={styles.modalItem} onPress={() => {
                setSelectedInsurance('');
                setShowInsuranceModal(false);
              }}>
                <Text style={styles.modalItemText}>Без страхування</Text>
              </TouchableOpacity>
              {insurances.map((ins) => (
                <TouchableOpacity
                  key={ins.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedInsurance(ins.id);
                    setShowInsuranceModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{ins.provider}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowInsuranceModal(false)}>
              <Text style={styles.modalCloseText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Додаткові послуги */}
      <Modal visible={showServicesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Додаткові послуги</Text>
            <ScrollView>
              {additionalServices.map((service) => (
                <View key={service.id} style={styles.serviceModalItem}>
                  <TouchableOpacity
                    style={styles.serviceCheckbox}
                    onPress={() => {
                      if (selectedServices.includes(service.id)) {
                        setSelectedServices(selectedServices.filter((id) => id !== service.id));
                      } else {
                        setSelectedServices([...selectedServices, service.id]);
                        if (!serviceQuantities[service.id]) {
                          setServiceQuantities({ ...serviceQuantities, [service.id]: '1' });
                        }
                      }
                    }}
                  >
                    <Ionicons
                      name={selectedServices.includes(service.id) ? 'checkbox' : 'square-outline'}
                      size={24}
                      color="#3b82f6"
                    />
                  </TouchableOpacity>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.modalItemText}>{service.name}</Text>
                    <Text style={styles.modalSubtext}>{service.price} ₴</Text>
                  </View>
                  {selectedServices.includes(service.id) && (
                    <TextInput
                      style={styles.quantityInput}
                      keyboardType="numeric"
                      value={serviceQuantities[service.id] || '1'}
                      onChangeText={(val) => setServiceQuantities({ ...serviceQuantities, [service.id]: val })}
                    />
                  )}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowServicesModal(false)}>
              <Text style={styles.modalCloseText}>Готово</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  tourCard: { backgroundColor: '#3b82f6', margin: 12, padding: 16, borderRadius: 12 },
  tourName: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  tourPrice: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 8 },
  includedItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  includedText: { color: 'white' },
  section: { backgroundColor: 'white', margin: 12, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12 },
  disabledButton: { backgroundColor: '#f3f4f6' },
  dateText: { fontSize: 16, color: '#1f2937' },
  selectButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginTop: 8 },
  selectText: { fontSize: 16, color: '#1f2937' },
  helperText: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  textArea: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#3b82f6', margin: 12, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalItemText: { fontSize: 16, color: '#1f2937' },
  modalSubtext: { fontSize: 12, color: '#6b7280' },
  modalCloseButton: { marginTop: 16, padding: 12, backgroundColor: '#e5e7eb', borderRadius: 8, alignItems: 'center' },
  modalCloseText: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  serviceModalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  serviceCheckbox: { marginRight: 12 },
  serviceInfo: { flex: 1 },
  quantityInput: { width: 60, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 8, textAlign: 'center' },
  spacer: { height: 40 },
});