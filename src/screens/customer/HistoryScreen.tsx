import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { ReturnStatus } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const mockHistory = [
  { id: '1', retailer: 'Amazon', items: 2, date: 'Dec 29, 2025', status: 'SCHEDULED' as ReturnStatus },
  { id: '2', retailer: 'Target', items: 1, date: 'Dec 28, 2025', status: 'PICKED_UP' as ReturnStatus },
  { id: '3', retailer: 'Walmart', items: 3, date: 'Dec 25, 2025', status: 'COMPLETED' as ReturnStatus },
  { id: '4', retailer: 'Best Buy', items: 1, date: 'Dec 20, 2025', status: 'COMPLETED' as ReturnStatus },
  { id: '5', retailer: 'Costco', items: 2, date: 'Dec 15, 2025', status: 'COMPLETED' as ReturnStatus },
  { id: '6', retailer: 'Amazon', items: 1, date: 'Dec 10, 2025', status: 'COMPLETED' as ReturnStatus },
];

const getStatusBadge = (status: ReturnStatus) => {
  switch (status) {
    case 'SCHEDULED':
      return { label: 'Scheduled', variant: 'info' as const };
    case 'PICKED_UP':
    case 'IN_TRANSIT':
      return { label: 'In Progress', variant: 'warning' as const };
    case 'COMPLETED':
      return { label: 'Completed', variant: 'success' as const };
    case 'CANCELLED':
      return { label: 'Cancelled', variant: 'destructive' as const };
    default:
      return { label: status, variant: 'default' as const };
  }
};

export function HistoryScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredHistory = mockHistory.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['COMPLETED', 'CANCELLED'].includes(item.status);
    return item.status === 'COMPLETED';
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderItem = ({ item }: { item: typeof mockHistory[0] }) => {
    const badge = getStatusBadge(item.status);
    return (
      <TouchableOpacity
        style={styles.returnItem}
        onPress={() => navigation.navigate('ReturnDetail', { id: item.id })}
      >
        <View style={styles.returnIcon}>
          <Ionicons name="cube-outline" size={24} color={Colors.mutedForeground} />
        </View>
        <View style={styles.returnInfo}>
          <Text style={styles.retailerName}>{item.retailer}</Text>
          <Text style={styles.returnMeta}>
            {item.items} item{item.items > 1 ? 's' : ''} • {item.date}
          </Text>
        </View>
        <Badge label={badge.label} variant={badge.variant} />
      </TouchableOpacity>
    );
  };

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
            <Text style={styles.emptyTitle}>No returns yet</Text>
            <Text style={styles.emptyText}>
              Your return history will appear here
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
  emptyState: {
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
  },
});
