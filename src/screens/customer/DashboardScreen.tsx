import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { ReturnStatus } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const mockReturns = [
  {
    id: '1',
    retailer: 'Amazon',
    items: 2,
    date: 'Dec 29, 2025',
    status: 'SCHEDULED' as ReturnStatus,
  },
  {
    id: '2',
    retailer: 'Target',
    items: 1,
    date: 'Dec 28, 2025',
    status: 'PICKED_UP' as ReturnStatus,
  },
  {
    id: '3',
    retailer: 'Walmart',
    items: 3,
    date: 'Dec 25, 2025',
    status: 'COMPLETED' as ReturnStatus,
  },
];

const stats = [
  { label: 'Active', value: 2, icon: 'cube-outline' },
  { label: 'Pending', value: 1, icon: 'time-outline' },
  { label: 'Completed', value: 12, icon: 'checkmark-circle-outline' },
  { label: 'This Month', value: '3/5', icon: 'calendar-outline' },
];

const getStatusBadge = (status: ReturnStatus) => {
  switch (status) {
    case 'SCHEDULED':
      return { label: 'Scheduled', variant: 'info' as const };
    case 'PICKED_UP':
    case 'IN_TRANSIT':
      return { label: 'Picked Up', variant: 'warning' as const };
    case 'COMPLETED':
      return { label: 'Completed', variant: 'success' as const };
    default:
      return { label: status, variant: 'default' as const };
  }
};

export function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

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
            <Text style={styles.greeting}>Welcome back, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.subGreeting}>Here's an overview of your returns</Text>
          </View>
          <TouchableOpacity
            style={styles.newReturnButton}
            onPress={() => navigation.navigate('NewReturn')}
          >
            <Ionicons name="add" size={24} color={Colors.primaryForeground} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons
                name={stat.icon as any}
                size={20}
                color={Colors.mutedForeground}
              />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="New Return"
            onPress={() => navigation.navigate('NewReturn')}
            icon={<Ionicons name="add-circle-outline" size={20} color={Colors.primaryForeground} />}
            style={styles.quickActionButton}
          />
          <Button
            title="Scan QR"
            onPress={() => navigation.navigate('ScanQR')}
            variant="outline"
            icon={<Ionicons name="qr-code-outline" size={20} color={Colors.foreground} />}
            style={styles.quickActionButton}
          />
        </View>

        {/* Recent Returns */}
        <Card style={styles.returnsCard}>
          <CardHeader
            title="Recent Returns"
            subtitle="Your latest return requests"
            action={
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            }
          />
          <CardContent style={styles.returnsList}>
            {mockReturns.map((returnItem) => {
              const badge = getStatusBadge(returnItem.status);
              return (
                <TouchableOpacity
                  key={returnItem.id}
                  style={styles.returnItem}
                  onPress={() => navigation.navigate('ReturnDetail', { id: returnItem.id })}
                >
                  <View style={styles.returnIcon}>
                    <Ionicons name="cube-outline" size={24} color={Colors.mutedForeground} />
                  </View>
                  <View style={styles.returnInfo}>
                    <Text style={styles.returnRetailer}>{returnItem.retailer}</Text>
                    <Text style={styles.returnMeta}>
                      {returnItem.items} item{returnItem.items > 1 ? 's' : ''} • {returnItem.date}
                    </Text>
                  </View>
                  <View style={styles.returnStatus}>
                    <Badge label={badge.label} variant={badge.variant} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </CardContent>
        </Card>
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
    alignItems: 'center',
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
  newReturnButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.foreground,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickActionButton: {
    flex: 1,
  },
  returnsCard: {
    marginBottom: Spacing.lg,
  },
  returnsList: {
    padding: 0,
  },
  returnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  returnIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  returnInfo: {
    flex: 1,
  },
  returnRetailer: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.foreground,
  },
  returnMeta: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  returnStatus: {
    marginLeft: Spacing.sm,
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
});
