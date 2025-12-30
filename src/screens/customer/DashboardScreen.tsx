import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { apiRequest } from '../../lib/api';
import { ReturnStatus } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

interface ReturnItem {
  id: string;
  retailer: string;
  productName: string;
  status: string;
}

interface Return {
  id: string;
  status: ReturnStatus;
  scheduledDate: string;
  timeWindow: string;
  items: ReturnItem[];
  createdAt: string;
  lastUpdate: string;
}

const getStatusBadge = (status: ReturnStatus) => {
  switch (status) {
    case 'SCHEDULED':
      return { label: 'Scheduled', variant: 'info' as const };
    case 'DRIVER_ASSIGNED':
      return { label: 'Driver Assigned', variant: 'info' as const };
    case 'PICKED_UP':
    case 'IN_TRANSIT':
      return { label: 'In Transit', variant: 'warning' as const };
    case 'DROPPED_OFF':
      return { label: 'Dropped Off', variant: 'success' as const };
    case 'COMPLETED':
      return { label: 'Completed', variant: 'success' as const };
    case 'CANCELLED':
      return { label: 'Cancelled', variant: 'destructive' as const };
    default:
      return { label: status, variant: 'default' as const };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState<Return[]>([]);
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    completed: 0,
    thisMonth: 0,
  });

  const fetchReturns = useCallback(async () => {
    try {
      const response = await apiRequest<{ returns: Return[] }>('/returns');
      setReturns(response.returns);

      // Calculate stats
      const active = response.returns.filter(r =>
        ['SCHEDULED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(r.status)
      ).length;
      const pending = response.returns.filter(r => r.status === 'SCHEDULED').length;
      const completed = response.returns.filter(r => r.status === 'COMPLETED').length;

      // Count returns this month
      const now = new Date();
      const thisMonthReturns = response.returns.filter(r => {
        const created = new Date(r.createdAt);
        return created.getMonth() === now.getMonth() &&
               created.getFullYear() === now.getFullYear();
      }).length;

      setStats({ active, pending, completed, thisMonth: thisMonthReturns });
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReturns();
    setRefreshing(false);
  }, [fetchReturns]);

  const statsDisplay = [
    { label: 'Active', value: stats.active, icon: 'cube-outline' },
    { label: 'Pending', value: stats.pending, icon: 'time-outline' },
    { label: 'Completed', value: stats.completed, icon: 'checkmark-circle-outline' },
    { label: 'This Month', value: stats.thisMonth, icon: 'calendar-outline' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your returns...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {statsDisplay.map((stat, index) => (
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
            subtitle={returns.length > 0 ? "Your latest return requests" : "No returns yet"}
            action={
              returns.length > 0 ? (
                <TouchableOpacity onPress={() => navigation.navigate('History')}>
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              ) : null
            }
          />
          <CardContent style={styles.returnsList}>
            {returns.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color={Colors.mutedForeground} />
                <Text style={styles.emptyStateText}>No returns yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Schedule your first return pickup
                </Text>
                <Button
                  title="Create Return"
                  onPress={() => navigation.navigate('NewReturn')}
                  style={{ marginTop: Spacing.md }}
                />
              </View>
            ) : (
              returns.slice(0, 5).map((returnItem) => {
                const badge = getStatusBadge(returnItem.status);
                const retailer = returnItem.items[0]?.retailer || 'Unknown';
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
                      <Text style={styles.returnRetailer}>{retailer}</Text>
                      <Text style={styles.returnMeta}>
                        {returnItem.items.length} item{returnItem.items.length > 1 ? 's' : ''} • {formatDate(returnItem.scheduledDate)}
                      </Text>
                    </View>
                    <View style={styles.returnStatus}>
                      <Badge label={badge.label} variant={badge.variant} />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        {returns.length === 0 && (
          <Card style={styles.tipsCard}>
            <CardHeader title="Quick Tips" />
            <CardContent>
              <View style={styles.tipItem}>
                <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
                <Text style={styles.tipText}>Scan your return QR code to auto-fill details</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.tipText}>Schedule pickups up to 7 days in advance</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
                <Text style={styles.tipText}>Get notified when your driver is on the way</Text>
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.muted,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.mutedForeground,
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
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.foreground,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
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
  tipsCard: {
    marginBottom: Spacing.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  tipText: {
    fontSize: FontSizes.sm,
    color: Colors.foreground,
    flex: 1,
  },
});
