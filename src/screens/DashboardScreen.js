import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { dashboardAPI } from '../api/endpoints'; // Потрібно додати до endpoints.js

export default function DashboardScreen() {
  // Тут буде логіка для отримання даних з API

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Інформаційна панель</Text>
      <Text>Останні бронювання та статистика будуть тут</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});