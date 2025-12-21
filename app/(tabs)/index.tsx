// App.tsx
import 'react-native-gesture-handler'; // ← ОБОВ’ЯЗКОВО НАЙПЕРШЕ!
import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from '../../src/store/store';
import LoginScreen from '../../src/screens/LoginScreen';
import RegisterScreen from '../../src/screens/RegisterScreen';
import MainTabNavigator from '../../src/navigation/AppNavigator'; // Потрібно створити
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// --- Компонент навігації, який отримує isAuthenticated як проп ---
function AppNavigator({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Якщо авторизований, показуємо основну навігацію
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// --- Компонент, який отримує стан з Redux і передає його в AppNavigator ---
function AppNavigatorWithState() {
  const { isAuthenticated } = useSelector<RootState, RootState['auth']>(
    (state) => state.auth
  );
  return <AppNavigator isAuthenticated={isAuthenticated} />;
}

// --- Головний компонент ---
export default function App() {
  return (
    <Provider store={store}>
      {/* ❌ Прибрано NavigationContainer, бо Expo Router вже його додає */}
      <AppNavigatorWithState />
    </Provider>
  );
}