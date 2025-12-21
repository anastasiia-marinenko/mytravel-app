import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TourDetailsScreen({ route }) {
  const { tourId } = route.params || {}; // Отримуємо ID туру з навігації

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Деталі туру {tourId}</Text>
      <Text>Інформація про тур буде тут</Text>
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