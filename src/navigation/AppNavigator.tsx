import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';
import { Colors } from '../constants/theme';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Customer Screens
import { DashboardScreen } from '../screens/customer/DashboardScreen';
import { NewReturnScreen } from '../screens/customer/NewReturnScreen';
import { ScanQRScreen } from '../screens/customer/ScanQRScreen';
import { HistoryScreen } from '../screens/customer/HistoryScreen';

// Driver Screens
import { DriverDashboardScreen } from '../screens/driver/DriverDashboardScreen';

// Placeholder screens
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PlaceholderScreen = ({ title }: { title: string }) => (
  <SafeAreaView style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
  </SafeAreaView>
);

const SettingsScreen = () => <PlaceholderScreen title="Settings" />;
const ProfileScreen = () => <PlaceholderScreen title="Profile" />;
const ReturnDetailScreen = () => <PlaceholderScreen title="Return Details" />;
const PickupsScreen = () => <PlaceholderScreen title="All Pickups" />;
const PickupDetailScreen = () => <PlaceholderScreen title="Pickup Details" />;
const EarningsScreen = () => <PlaceholderScreen title="Earnings" />;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedForeground,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Driver Tab Navigator
function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'DriverDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Pickups') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedForeground,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="DriverDashboard"
        component={DriverDashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen name="Pickups" component={PickupsScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Customer Stack
function CustomerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CustomerTabs"
        component={CustomerTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewReturn"
        component={NewReturnScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ScanQR"
        component={ScanQRScreen}
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="ReturnDetail"
        component={ReturnDetailScreen}
        options={{ title: 'Return Details' }}
      />
    </Stack.Navigator>
  );
}

// Driver Stack
function DriverStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DriverTabs"
        component={DriverTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PickupDetail"
        component={PickupDetailScreen}
        options={{ title: 'Pickup Details' }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        user.role === 'DRIVER' ? (
          <DriverStack />
        ) : (
          <CustomerStack />
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  placeholderText: {
    fontSize: 18,
    color: Colors.mutedForeground,
  },
});
