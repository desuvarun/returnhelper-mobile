import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { apiRequest } from '../../lib/api';
import { Subscription, Address } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const getPlanDetails = (plan: string) => {
  switch (plan) {
    case 'BASIC':
      return { name: 'Basic', price: '$9.99/mo', color: Colors.mutedForeground };
    case 'STANDARD':
      return { name: 'Standard', price: '$19.99/mo', color: Colors.info };
    case 'UNLIMITED':
      return { name: 'Unlimited', price: '$29.99/mo', color: Colors.success };
    default:
      return { name: 'Free', price: 'Free', color: Colors.mutedForeground };
  }
};

export function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      const [subResponse, addrResponse] = await Promise.all([
        apiRequest<{ subscription: Subscription }>('/subscription').catch(() => ({ subscription: null })),
        apiRequest<{ addresses: Address[] }>('/addresses').catch(() => ({ addresses: [] })),
      ]);
      setSubscription(subResponse.subscription);
      setAddresses(addrResponse.addresses);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const planDetails = subscription ? getPlanDetails(subscription.plan) : getPlanDetails('FREE');

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
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
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Subscription Card */}
        <Card style={styles.card}>
          <CardHeader title="Your Subscription" />
          <CardContent>
            <View style={styles.subscriptionRow}>
              <View>
                <View style={styles.planBadge}>
                  <Text style={[styles.planName, { color: planDetails.color }]}>
                    {planDetails.name}
                  </Text>
                </View>
                <Text style={styles.planPrice}>{planDetails.price}</Text>
              </View>
              {subscription && (
                <View style={styles.usageInfo}>
                  <Text style={styles.usageText}>
                    {subscription.returnsUsed} / {subscription.returnsLimit === -1 ? '∞' : subscription.returnsLimit}
                  </Text>
                  <Text style={styles.usageLabel}>returns used</Text>
                </View>
              )}
            </View>
            {subscription && subscription.returnsLimit !== -1 && (
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(100, (subscription.returnsUsed / subscription.returnsLimit) * 100)}%`,
                      backgroundColor: subscription.returnsUsed >= subscription.returnsLimit
                        ? Colors.destructive
                        : Colors.primary,
                    },
                  ]}
                />
              </View>
            )}
          </CardContent>
        </Card>

        {/* Saved Addresses */}
        <Card style={styles.card}>
          <CardHeader
            title="Saved Addresses"
            subtitle={addresses.length > 0 ? `${addresses.length} addresses` : 'No addresses saved'}
          />
          <CardContent>
            {addresses.length === 0 ? (
              <Text style={styles.emptyText}>Add addresses when creating a return</Text>
            ) : (
              addresses.map((address, index) => (
                <View
                  key={address.id}
                  style={[
                    styles.addressItem,
                    index < addresses.length - 1 && styles.addressItemBorder,
                  ]}
                >
                  <View style={styles.addressIcon}>
                    <Ionicons
                      name={address.label.toLowerCase() === 'home' ? 'home-outline' : 'business-outline'}
                      size={20}
                      color={Colors.mutedForeground}
                    />
                  </View>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressText}>
                      {address.street}
                      {address.apartment && `, ${address.apartment}`}
                    </Text>
                    <Text style={styles.addressSubtext}>
                      {address.city}, {address.state} {address.zipCode}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </CardContent>
        </Card>

        {/* Settings Menu */}
        <Card style={styles.card}>
          <CardHeader title="Settings" />
          <CardContent style={styles.menuContent}>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="notifications-outline" size={22} color={Colors.foreground} />
              <Text style={styles.menuText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="shield-outline" size={22} color={Colors.foreground} />
              <Text style={styles.menuText}>Privacy</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="help-circle-outline" size={22} color={Colors.foreground} />
              <Text style={styles.menuText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="document-text-outline" size={22} color={Colors.foreground} />
              <Text style={styles.menuText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.destructive} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ReturnHelper v1.0.0</Text>
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
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.foreground,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
  },
  card: {
    marginBottom: Spacing.md,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planBadge: {
    marginBottom: Spacing.xs,
  },
  planName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  planPrice: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  usageInfo: {
    alignItems: 'flex-end',
  },
  usageText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.foreground,
  },
  usageLabel: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.muted,
    borderRadius: 2,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  addressItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
  },
  addressItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addressLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.foreground,
  },
  defaultBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  defaultText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '500',
  },
  addressText: {
    fontSize: FontSizes.sm,
    color: Colors.foreground,
    marginTop: 2,
  },
  addressSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  menuContent: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.foreground,
    marginLeft: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.destructive,
    backgroundColor: Colors.background,
  },
  logoutText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.destructive,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    marginTop: Spacing.xl,
  },
});
