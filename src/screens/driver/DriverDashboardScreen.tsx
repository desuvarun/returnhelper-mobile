import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { Pickup } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const mockPickups: Pickup[] = [
  {
    id: '1',
    customerName: 'John Smith',
    address: {
      id: '1',
      label: 'Home',
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      isDefault: true,
    },
    scheduledDate: 'Today',
    timeWindow: '9 AM - 12 PM',
    status: 'DRIVER_ASSIGNED',
    items: [
      { id: '1', retailer: 'Amazon', productName: 'Headphones', status: 'DRIVER_ASSIGNED', size: 'SMALL', fragile: false },
      { id: '2', retailer: 'Amazon', productName: 'Phone Case', status: 'DRIVER_ASSIGNED', size: 'SMALL', fragile: false },
    ],
    distance: '2.3 mi',
    estimatedEarnings: 8.50,
  },
  {
    id: '2',
    customerName: 'Sarah Johnson',
    address: {
      id: '2',
      label: 'Office',
      street: '456 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      isDefault: false,
    },
    scheduledDate: 'Today',
    timeWindow: '12 PM - 5 PM',
    status: 'SCHEDULED',
    items: [
      { id: '3', retailer: 'Target', productName: 'Kitchen Set', status: 'SCHEDULED', size: 'LARGE', fragile: true },
    ],
    distance: '3.1 mi',
    estimatedEarnings: 12.00,
  },
];

export function DriverDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const todayEarnings = 45.50;
  const completedToday = 4;
  const pendingPickups = mockPickups.length;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.subGreeting}>
              {isOnline ? 'You\'re online and receiving pickups' : 'You\'re currently offline'}
            </Text>
          </View>
          <View style={styles.onlineToggle}>
            <Text style={[styles.onlineText, isOnline && styles.onlineTextActive]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: Colors.muted, true: Colors.success }}
              thumbColor={Colors.background}
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.earningsCard]}>
            <Ionicons name="wallet-outline" size={24} color={Colors.success} />
            <Text style={styles.statValue}>${todayEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={Colors.info} />
            <Text style={styles.statValue}>{completedToday}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{pendingPickups}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Upcoming Pickups */}
        <Card style={styles.pickupsCard}>
          <CardHeader
            title="Upcoming Pickups"
            subtitle="Your scheduled pickups for today"
            action={
              <TouchableOpacity onPress={() => navigation.navigate('Pickups')}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            }
          />
          <CardContent style={styles.pickupsList}>
            {mockPickups.map((pickup) => (
              <TouchableOpacity
                key={pickup.id}
                style={styles.pickupItem}
                onPress={() => navigation.navigate('PickupDetail', { id: pickup.id })}
              >
                <View style={styles.pickupHeader}>
                  <View>
                    <Text style={styles.customerName}>{pickup.customerName}</Text>
                    <Text style={styles.pickupAddress}>
                      {pickup.address.street}
                    </Text>
                  </View>
                  <Badge
                    label={pickup.status === 'DRIVER_ASSIGNED' ? 'Assigned' : 'Pending'}
                    variant={pickup.status === 'DRIVER_ASSIGNED' ? 'info' : 'warning'}
                  />
                </View>
                <View style={styles.pickupMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color={Colors.mutedForeground} />
                    <Text style={styles.metaText}>{pickup.timeWindow}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={16} color={Colors.mutedForeground} />
                    <Text style={styles.metaText}>{pickup.distance}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="cube-outline" size={16} color={Colors.mutedForeground} />
                    <Text style={styles.metaText}>{pickup.items.length} items</Text>
                  </View>
                </View>
                <View style={styles.pickupFooter}>
                  <Text style={styles.earningsText}>
                    Est. ${pickup.estimatedEarnings.toFixed(2)}
                  </Text>
                  <Button
                    title={pickup.status === 'DRIVER_ASSIGNED' ? 'Start' : 'Accept'}
                    size="sm"
                    onPress={() => navigation.navigate('PickupDetail', { id: pickup.id })}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Earnings')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="stats-chart" size={24} color={Colors.success} />
            </View>
            <Text style={styles.quickActionText}>Earnings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('History')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="time" size={24} color={Colors.info} />
            </View>
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.muted }]}>
              <Ionicons name="settings" size={24} color={Colors.mutedForeground} />
            </View>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.muted,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.foreground,
  },
  subGreeting: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  onlineText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    fontWeight: '500',
  },
  onlineTextActive: {
    color: Colors.success,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  earningsCard: {
    flex: 1.5,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.foreground,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  pickupsCard: {
    marginBottom: Spacing.lg,
  },
  pickupsList: {
    padding: 0,
  },
  pickupItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  customerName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.foreground,
  },
  pickupAddress: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  pickupMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  pickupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.success,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    fontSize: FontSizes.sm,
    color: Colors.foreground,
    fontWeight: '500',
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
});
