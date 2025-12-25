// app/payment/create/[packageId].tsx
import { paymentsAPI } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PaymentMethod {
  method_id: number;
  name: string;
  description: string;
  icon: string;
}

interface PackageInfo {
  package_id: number;
  vacation_type: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  discount?: {
    name: string;
    discount_percent: number;
  };
  total_price: number;
}

export default function PaymentFormScreen() {
  const { packageId } = useLocalSearchParams();
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentForm();
  }, [packageId]);

  const loadPaymentForm = async () => {
    try {
      setError(null);
      const { data } = await paymentsAPI.getPaymentForm(Number(packageId));

      if (data.success) {
        setPackageInfo(data.package);
        setPaymentMethods(data.payment_methods);
        if (data.payment_methods.length > 0) {
          setSelectedMethod(data.payment_methods[0].method_id);
        }
      } else {
        setError(data.message || 'Не вдалося завантажити форму');
      }
    } catch (error: any) {
      console.error('❌ Помилка завантаження форми:', error);
      setError(error.response?.data?.message || 'Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Валідація
    if (!selectedMethod) {
      Alert.alert('Помилка', 'Оберіть спосіб оплати');
      return;
    }

    if (!packageInfo) {
      Alert.alert('Помилка', 'Немає даних про бронювання');
      return;
    }

    if (!packageId) {
      Alert.alert('Помилка', 'Невірний ID бронювання');
      return;
    }

    // ✅ Створюємо об'єкт з даними ДО Alert
    const paymentData = {
      package_id: parseInt(packageId as string, 10),
      method_id: selectedMethod,
      amount: parseFloat(packageInfo.total_price.toFixed(2)),
    };

    // Додаємо notes якщо є
    if (notes && notes.trim().length > 0) {
      paymentData.notes = notes.trim();
    }

    console.log('🔍 Готові дані для відправки:', paymentData);

    Alert.alert(
      'Підтвердження оплати',
      `Ви впевнені, що хочете оплатити ${Math.round(packageInfo.total_price).toLocaleString('uk-UA')} ₴?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Оплатити',
          onPress: async () => {
            setSubmitting(true);
            try {
              console.log('📤 Викликаємо paymentsAPI.create з:', paymentData);
              
              // ✅ ПРАВИЛЬНО: Передаємо paymentData (об'єкт), а НЕ packageId (число)
              const response = await paymentsAPI.create(paymentData);
              
              console.log('✅ Отримали відповідь:', response.data);

              if (response.data.success) {
                Alert.alert(
                  'Успіх!',
                  `Оплату успішно проведено!\nНомер чека: ${response.data.payment.receipt_number}`,
                  [
                    {
                      text: 'Переглянути чек',
                      onPress: () => router.replace(`/payment/${response.data.payment.payment_id}`),
                    },
                  ]
                );
              } else {
                Alert.alert('Помилка', response.data.message || 'Не вдалося провести оплату');
              }
            } catch (error: any) {
              console.error('❌ Повна помилка:', error);
              console.error('❌ error.response:', error.response);
              
              let errorMessage = 'Помилка обробки оплати';
              
              if (error.response?.data) {
                if (error.response.data.errors) {
                  const errors = Object.values(error.response.data.errors).flat();
                  errorMessage = errors.join('\n');
                } else if (error.response.data.message) {
                  errorMessage = error.response.data.message;
                }
              }
              
              Alert.alert('Помилка', errorMessage);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getMethodIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      card: 'card',
      cash: 'cash',
      business: 'business',
      wallet: 'wallet',
    };
    return iconMap[iconName] || 'wallet';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  }

  if (error || !packageInfo) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error || 'Не вдалося завантажити дані'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Назад до бронювання</Text>
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
        <Text style={styles.headerTitle}>Оплата бронювання</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Інформація про бронювання */}
        <View style={styles.packageCard}>
          <Text style={styles.sectionTitle}>Деталі бронювання</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Тип туру:</Text>
              <Text style={styles.detailValue}>{packageInfo.vacation_type}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Дати:</Text>
              <Text style={styles.detailValue}>
                {formatDate(packageInfo.start_date)} - {formatDate(packageInfo.end_date)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Тривалість:</Text>
              <Text style={styles.detailValue}>{packageInfo.duration_days} днів</Text>
            </View>

            {packageInfo.discount && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, styles.discountText]}>Знижка:</Text>
                <Text style={[styles.detailValue, styles.discountText]}>
                  -{packageInfo.discount.discount_percent}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>До сплати:</Text>
            <Text style={styles.totalAmount}>
              {Math.round(packageInfo.total_price).toLocaleString('uk-UA')} ₴
            </Text>
          </View>
        </View>

        {/* Вибір методу оплати */}
        <View style={styles.methodsCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="wallet" size={18} color="#1f2937" /> Оберіть спосіб оплати
          </Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.method_id}
              style={[
                styles.methodOption,
                selectedMethod === method.method_id && styles.methodOptionSelected,
              ]}
              onPress={() => setSelectedMethod(method.method_id)}
            >
              <View style={styles.methodRadio}>
                {selectedMethod === method.method_id && <View style={styles.methodRadioInner} />}
              </View>

              <View style={styles.methodIconContainer}>
                <Ionicons name={getMethodIcon(method.icon)} size={24} color="#3b82f6" />
              </View>

              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Примітки */}
        <View style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Примітки (необов'язково)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Додаткові коментарі до оплати..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Інформаційне повідомлення */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#f59e0b" />
          <Text style={styles.infoText}>
            <Text style={styles.infoTextBold}>Увага!</Text> Це демонстраційна версія системи.
            Реальна оплата не відбувається. При натисканні "Оплатити" бронювання буде позначено як
            оплачене в системі.
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Кнопки дій */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={submitting}
        >
          <Ionicons name="close" size={20} color="#4b5563" />
          <Text style={styles.cancelButtonText}>Скасувати</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.submitButtonText}>
                Оплатити {Math.round(packageInfo.total_price).toLocaleString('uk-UA')} ₴
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  },
  packageCard: {
    backgroundColor: 'white',
    margin: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  discountText: {
    color: '#10b981',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  methodsCard: {
    backgroundColor: 'white',
    margin: 12,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  methodOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  methodRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  methodDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  notesCard: {
    backgroundColor: 'white',
    margin: 12,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    margin: 12,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
  },
  infoTextBold: {
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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