import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DynamicThemeProvider } from './src/contexts/DynamicThemeContext';
import { ImmersiveNotificationSystem } from './src/components/notifications/ImmersiveNotifications';
import { AdvancedDemoScreen } from './src/screens/AdvancedDemoScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <DynamicThemeProvider>
        <ImmersiveNotificationSystem>
          <AdvancedDemoScreen />
          <StatusBar style="light" backgroundColor="transparent" translucent />
        </ImmersiveNotificationSystem>
      </DynamicThemeProvider>
    </SafeAreaProvider>
  );
}