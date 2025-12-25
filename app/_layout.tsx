import { useColorScheme } from '@/hooks/use-color-scheme';
// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="booking/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="booking/create" options={{ headerShown: false }} />
        <Stack.Screen name="tour/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="reports/index" options={{ headerShown: false }} />
        <Stack.Screen name="reports/financial" options={{ headerShown: false }} />
        <Stack.Screen name="reports/bookings" options={{ headerShown: false }} />
        <Stack.Screen name="reports/clients" options={{ headerShown: false }} />
        <Stack.Screen name="reports/revenue-trend" options={{ headerShown: false }} />
        <Stack.Screen name="reports/popular-tours" options={{ headerShown: false }} />
        <Stack.Screen name="reports/employee-performance" options={{ headerShown: false }} />
        <Stack.Screen name="staff/index" options={{ headerShown: false }} />
        <Stack.Screen name="staff/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="payment/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="payment/create/[packageId]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}