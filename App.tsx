import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/lib/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import {
  registerForPushNotificationsAsync,
  addNotificationListener,
  addNotificationResponseListener,
} from './src/lib/notifications';

export default function App() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync();

    // Listen for incoming notifications while app is foregrounded
    notificationListener.current = addNotificationListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Listen for user interaction with notifications
    responseListener.current = addNotificationResponseListener((response) => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;

      // Handle navigation based on notification data
      if (data?.returnId) {
        // Navigate to return detail - handled by navigation
        console.log('Navigate to return:', data.returnId);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
