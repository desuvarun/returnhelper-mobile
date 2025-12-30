import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { apiRequest } from '../../lib/api';
import { ReturnStatus, ReturnItem, Address } from '../../types';

type Props = NativeStackScreenProps<any, 'ReturnDetail'>;

interface StatusUpdate {
  id: string;
  status: ReturnStatus;
  timestamp: string;
  notes?: string;
}

interface ReturnDetail {
  id: string;
  status: ReturnStatus;
  scheduledDate: string;
  timeWindow: string;
  items: ReturnItem[];
  address: Address;
  driverName?: string;
  driverPhone?: string;
  specialInstructions?: string;
  statusUpdates: StatusUpdate[];
  createdAt: string;
  lastUpdate: string;
}

const STATUS_CONFIG: Record<ReturnStatus, { label: string; icon: string; color: string; description: string }> = {
  PENDING: {
    label: 'Pending',
    icon: 'hourglass-outline',
    color: Colors.mutedForeground,
    description: 'Your return request has been submitted',
  },
  SCHEDULED: {
    label: 'Scheduled',
    icon: 'calendar-outline',
    color: Colors.info,
    description: 'Pickup has been scheduled',
  },
  DRIVER_ASSIGNED: {
    label: 'Driver Assigned',
    icon: 'person-outline',
    color: Colors.info,
    description: 'A driver has been assigned to your pickup',
  },
  PICKED_UP: {
    label: 'Picked Up',
    icon: 'checkmark-circle-outline',
    color: Colors.warning,
    description: 'Items have been picked up',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    icon: 'car-outline',
    color: Colors.warning,
    description: 'Items are on the way to the drop-off location',
  },
  DROPPED_OFF: {
    label: 'Dropped Off',
    icon: 'location-outline',
    color: Colors.success,
    description: 'Items have been dropped off at the retailer',
  },
  COMPLETED: {
    label: 'Completed',
    icon: 'checkmark-done-circle-outline',
    color: Colors.success,
    description: 'Return completed successfully',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: 'close-circle-outline',
    color: Colors.destructive,
    description: 'Return has been cancelled',
  },
};

const STATUS_ORDER: ReturnStatus[] = [
  'PENDING',
  'SCHEDULED',
  'DRIVER_ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DROPPED_OFF',
  'COMPLETED',
];

const getStatusBadge = (status: ReturnStatus) => {
  const config = STATUS_CONFIG[status];
  const variantMap: Record<string, 'default' | 'info' | 'warning' | 'success' | 'destructive'> = {
    [Colors.mutedForeground]: 'default',
    [Colors.info]: 'info',
    [Colors.warning]: 'warning',
    [Colors.success]: 'success',
    [Colors.destructive]: 'destructive',
  };
  return { label: config.label, variant: variantMap[config.color] || 'default' };
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export function ReturnDetailScreen({ route, navigation }: Props) {
  const { id } = route.params || {};
  const [returnData, setReturnData] = useState<ReturnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReturnDetail = useCallback(async () => {
    try {
      setError(null);
      const response = await apiRequest<{ return: ReturnDetail }>(`/returns/${id}`);
      setReturnData(response.return);
    } catch (err: any) {
      setError(err.message || 'Failed to load return details');
      console.error('Failed to fetch return:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReturnDetail();

    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchReturnDetail();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchReturnDetail]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReturnDetail();
    setRefreshing(false);
  }, [fetchReturnDetail]);

  const handleCallDriver = () => {
    if (returnData?.driverPhone) {
      Linking.openURL(`tel:${returnData.driverPhone}`);
    }
  };

  const handleCancelReturn = () => {
    Alert.alert(
      'Cancel Return',
      'Are you sure you want to cancel this return? This action cannot be undone.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiRequest(`/returns/${id}/cancel`, { method: 'POST' });
              Alert.alert('Success', 'Return has been cancelled');
              fetchReturnDetail();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel return');
            }
          },
        },
      ]
    );
  };

  const getCurrentStatusIndex = () => {
    if (!returnData) return -1;
    if (returnData.status === 'CANCELLED') return -1;
    return STATUS_ORDER.indexOf(returnData.status);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading return details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !returnData) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.destructive} />
          <Text style={styles.errorText}>{error || 'Return not found'}</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: Spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  const badge = getStatusBadge(returnData.status);
  const currentStatusIndex = getCurrentStatusIndex();
  const canCancel = ['PENDING', 'SCHEDULED'].includes(returnData.status);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Header */}
        <Card style={styles.statusCard}>
          <CardContent>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIconContainer, { backgroundColor: STATUS_CONFIG[returnData.status].color + '20' }]}>
                <Ionicons
                  name={STATUS_CONFIG[returnData.status].icon as any}
                  size={32}
                  color={STATUS_CONFIG[returnData.status].color}
                />
              </View>
              <View style={styles.statusInfo}>
                <Badge label={badge.label} variant={badge.variant} />
                <Text style={styles.statusDescription}>
                  {STATUS_CONFIG[returnData.status].description}
                </Text>
                <Text style={styles.lastUpdate}>
                  Last updated: {formatTime(returnData.lastUpdate)}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card style={styles.timelineCard}>
          <CardHeader title="Status Timeline" />
          <CardContent>
            {returnData.status === 'CANCELLED' ? (
              <View style={styles.cancelledStatus}>
                <Ionicons name="close-circle" size={24} color={Colors.destructive} />
                <Text style={styles.cancelledText}>This return was cancelled</Text>
              </View>
            ) : (
              STATUS_ORDER.map((status, index) => {
                const isPast = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isFuture = index > currentStatusIndex;
                const config = STATUS_CONFIG[status];

                const statusUpdate = returnData.statusUpdates.find(u => u.status === status);

                return (
                  <View key={status} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          isPast && styles.timelineDotPast,
                          isCurrent && styles.timelineDotCurrent,
                          isFuture && styles.timelineDotFuture,
                        ]}
                      >
                        {isPast && (
                          <Ionicons name="checkmark" size={12} color={Colors.background} />
                        )}
                        {isCurrent && (
                          <View style={styles.currentDotInner} />
                        )}
                      </View>
                      {index < STATUS_ORDER.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            isPast && styles.timelineLinePast,
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text
                        style={[
                          styles.timelineStatus,
                          isFuture && styles.timelineStatusFuture,
                        ]}
                      >
                        {config.label}
                      </Text>
                      {statusUpdate && (
                        <Text style={styles.timelineTime}>
                          {formatDate(statusUpdate.timestamp)} at {formatTime(statusUpdate.timestamp)}
                        </Text>
                      )}
                      {statusUpdate?.notes && (
                        <Text style={styles.timelineNotes}>{statusUpdate.notes}</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Driver Info (if assigned) */}
        {returnData.driverName && (
          <Card style={styles.driverCard}>
            <CardHeader title="Your Driver" />
            <CardContent>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Ionicons name="person" size={24} color={Colors.mutedForeground} />
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{returnData.driverName}</Text>
                  {returnData.driverPhone && (
                    <Text style={styles.driverPhone}>{returnData.driverPhone}</Text>
                  )}
                </View>
                {returnData.driverPhone && (
                  <Button
                    title="Call"
                    variant="outline"
                    size="sm"
                    icon={<Ionicons name="call-outline" size={16} color={Colors.foreground} />}
                    onPress={handleCallDriver}
                  />
                )}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Pickup Details */}
        <Card style={styles.detailsCard}>
          <CardHeader title="Pickup Details" />
          <CardContent>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color={Colors.mutedForeground} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Scheduled Date</Text>
                <Text style={styles.detailValue}>{formatDate(returnData.scheduledDate)}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color={Colors.mutedForeground} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Time Window</Text>
                <Text style={styles.detailValue}>{returnData.timeWindow}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color={Colors.mutedForeground} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Pickup Address</Text>
                <Text style={styles.detailValue}>
                  {returnData.address.street}
                  {returnData.address.apartment && `, ${returnData.address.apartment}`}
                </Text>
                <Text style={styles.detailSubvalue}>
                  {returnData.address.city}, {returnData.address.state} {returnData.address.zipCode}
                </Text>
              </View>
            </View>
            {returnData.specialInstructions && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={20} color={Colors.mutedForeground} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Special Instructions</Text>
                  <Text style={styles.detailValue}>{returnData.specialInstructions}</Text>
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card style={styles.itemsCard}>
          <CardHeader
            title="Items"
            subtitle={`${returnData.items.length} item${returnData.items.length > 1 ? 's' : ''} to return`}
          />
          <CardContent>
            {returnData.items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  index < returnData.items.length - 1 && styles.itemRowBorder,
                ]}
              >
                <View style={styles.itemIcon}>
                  <Ionicons name="cube-outline" size={24} color={Colors.mutedForeground} />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemRetailer}>{item.retailer}</Text>
                  <View style={styles.itemTags}>
                    <View style={styles.itemTag}>
                      <Text style={styles.itemTagText}>{item.size}</Text>
                    </View>
                    {item.fragile && (
                      <View style={[styles.itemTag, styles.fragileTag]}>
                        <Ionicons name="warning-outline" size={12} color={Colors.warning} />
                        <Text style={[styles.itemTagText, { color: Colors.warning }]}>Fragile</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        {canCancel && (
          <Button
            title="Cancel Return"
            variant="destructive"
            onPress={handleCancelReturn}
            style={styles.cancelButton}
          />
        )}

        <Text style={styles.returnId}>Return ID: {returnData.id}</Text>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  statusCard: {
    marginBottom: Spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusDescription: {
    fontSize: FontSizes.md,
    color: Colors.foreground,
    marginTop: Spacing.sm,
  },
  lastUpdate: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
  },
  timelineCard: {
    marginBottom: Spacing.md,
  },
  cancelledStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.destructive + '10',
    borderRadius: BorderRadius.md,
  },
  cancelledText: {
    fontSize: FontSizes.md,
    color: Colors.destructive,
    fontWeight: '500',
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    width: 32,
    alignItems: 'center',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotPast: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  timelineDotCurrent: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  timelineDotFuture: {
    borderColor: Colors.border,
  },
  currentDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  timelineLinePast: {
    backgroundColor: Colors.success,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  timelineStatus: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.foreground,
  },
  timelineStatusFuture: {
    color: Colors.mutedForeground,
  },
  timelineTime: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  timelineNotes: {
    fontSize: FontSizes.sm,
    color: Colors.foreground,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  driverCard: {
    marginBottom: Spacing.md,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.foreground,
  },
  driverPhone: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  detailsCard: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  detailText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: FontSizes.md,
    color: Colors.foreground,
    marginTop: 2,
  },
  detailSubvalue: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  itemsCard: {
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.foreground,
  },
  itemRetailer: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  itemTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  itemTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    backgroundColor: Colors.muted,
    borderRadius: BorderRadius.sm,
  },
  fragileTag: {
    backgroundColor: Colors.warning + '20',
  },
  itemTagText: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
  },
  cancelButton: {
    marginBottom: Spacing.md,
  },
  returnId: {
    textAlign: 'center',
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
  },
});
