import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DynamicThemeProvider } from './src/contexts/DynamicThemeContext';
import { ImmersiveNotificationSystem } from './src/components/notifications/ImmersiveNotifications';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <DynamicThemeProvider>
            <AuthProvider>
              <ImmersiveNotificationSystem>
                <AppNavigator />
                <StatusBar style="light" backgroundColor="transparent" translucent />
              </ImmersiveNotificationSystem>
            </AuthProvider>
          </DynamicThemeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}