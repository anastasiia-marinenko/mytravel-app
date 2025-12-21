import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Потрібно встановити

import DashboardScreen from '../screens/DashboardScreen'; // Потрібно створити
import BookingsScreen from '../screens/BookingsScreen'; // Потрібно створити
import ProfileScreen from '../screens/ProfileScreen'; // Потрібно створити
import TourDetailsScreen from '../screens/TourDetailsScreen'; // Потрібно створити

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Стек для Dashboard (може бути екран деталей туру)
function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Головна' }} />
      <Stack.Screen name="TourDetails" component={TourDetailsScreen} options={{ title: 'Деталі туру' }} />
    </Stack.Navigator>
  );
}

// Стек для Bookings (може бути екран деталей бронювання)
function BookingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BookingsMain" component={BookingsScreen} options={{ title: 'Бронювання' }} />
      {/* Додайте інші екрани, якщо потрібно */}
    </Stack.Navigator>
  );
}

// Стек для Profile (може бути екран редагування)
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Профіль' }} />
      {/* Додайте інші екрани, якщо потрібно */}
    </Stack.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'event-note' : 'event-note';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Використовуємо react-native-vector-icons
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ headerShown: false }} />
      <Tab.Screen name="Bookings" component={BookingsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}