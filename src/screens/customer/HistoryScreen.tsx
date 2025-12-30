import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { ReturnStatus, ReturnItem } from '../../types';
import { apiRequest } from '../../lib/api';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

interface Return {
  id: string;
  status: ReturnStatus;
  scheduledDate: string;
  timeWindow: string;
  items: ReturnItem[];
  createdAt: string;
}

const getStatusBadge = (status: ReturnStatus) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending', variant: 'default' as const };
    case 'SCHEDULED':
      return { label: 'Scheduled', variant: 'info' as const };
    case 'DRIVER_ASSIGNED':
      return { label: 'Driver Assigned', variant: 'info' as const };
    case 'PICKED_UP':
    case 'IN_TRANSIT':
      return { label: 'In Progress', variant: 'warning' as const };
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

export function HistoryScreen({ navigation }: Props) {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const fetchReturns = useCallback(async () => {
    try {
      const response = await apiRequest<{ returns: Return[] }>('/returns');
      setReturns(response.returns);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReturns();
    });
    return unsubscribe;
  }, [navigation, fetchReturns]);

  const filteredHistory = returns.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['COMPLETED', 'CANCELLED'].includes(item.status);
    return item.status === 'COMPLETED';
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReturns();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Return }) => {
    const badge = getStatusBadge(item.status);
    const retailer = item.items[0]?.retailer || 'Unknown';

    return (
      <TouchableOpacity
        style={styles.returnItem}
        onPress={() => navigation.navigate('ReturnDetail', { id: item.id })}
      >
        <View style={styles.returnIcon}>
          <Ionicons name="cube-outline" size={24} color={Colors.mutedForeground} />
        </View>
        <View style={styles.returnInfo}>
          <Text style={styles.retailerName}>{retailer}</Text>
          <Text style={styles.returnMeta}>
            {item.items.length} item{item.items.length > 1 ? 's' : ''} • {formatDate(item.scheduledDate)}
          </Text>
        </View>
        <View style={styles.badgeContainer}>
          <Badge label={badge.label} variant={badge.variant} />
          <Ionicons name="chevron-forward" size={16} color={Colors.mutedForeground} style={{ marginLeft: 4 }} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color={Colors.mutedForeground} />
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'No returns yet' : `No ${filter} returns`}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'Your return history will appear here'
                : filter === 'active'
                ? 'You have no active returns right now'
                : 'You haven\'t completed any returns yet'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.muted,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: Colors.primaryForeground,
  },
  listContent: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  returnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  returnIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  returnInfo: {
    flex: 1,
  },
  retailerName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.foreground,
  },
  returnMeta: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.foreground,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
