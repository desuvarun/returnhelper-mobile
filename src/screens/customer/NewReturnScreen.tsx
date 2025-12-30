import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route?: {
    params?: {
      qrData?: string;
    };
  };
};

const retailers = [
  { id: 'amazon', name: 'Amazon', icon: 'cube-outline' },
  { id: 'walmart', name: 'Walmart', icon: 'storefront-outline' },
  { id: 'target', name: 'Target', icon: 'storefront-outline' },
  { id: 'bestbuy', name: 'Best Buy', icon: 'desktop-outline' },
  { id: 'costco', name: 'Costco', icon: 'cart-outline' },
  { id: 'kohls', name: "Kohl's", icon: 'shirt-outline' },
  { id: 'homedepot', name: 'Home Depot', icon: 'hammer-outline' },
  { id: 'macys', name: "Macy's", icon: 'bag-outline' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const timeWindows = [
  { id: 'morning', label: 'Morning', time: '9 AM - 12 PM' },
  { id: 'afternoon', label: 'Afternoon', time: '12 PM - 5 PM' },
  { id: 'evening', label: 'Evening', time: '5 PM - 8 PM' },
];

export function NewReturnScreen({ navigation, route }: Props) {
  const qrData = route?.params?.qrData;
  const [step, setStep] = useState(1);
  const [selectedRetailer, setSelectedRetailer] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && !selectedRetailer) {
      Alert.alert('Error', 'Please select a retailer');
      return;
    }
    if (step === 2 && !productName) {
      Alert.alert('Error', 'Please enter the product name');
      return;
    }
    if (step === 3 && !selectedTimeWindow) {
      Alert.alert('Error', 'Please select a pickup time');
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    Alert.alert(
      'Success!',
      'Your return has been scheduled. We\'ll notify you when a driver is assigned.',
      [
        {
          text: 'View Return',
          onPress: () => navigation.navigate('Dashboard'),
        },
      ]
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Retailer</Text>
            <Text style={styles.stepSubtitle}>
              Choose the store where you purchased the item
            </Text>
            <View style={styles.retailerGrid}>
              {retailers.map((retailer) => (
                <TouchableOpacity
                  key={retailer.id}
                  style={[
                    styles.retailerCard,
                    selectedRetailer === retailer.id && styles.retailerCardSelected,
                  ]}
                  onPress={() => setSelectedRetailer(retailer.id)}
                >
                  <Ionicons
                    name={retailer.icon as any}
                    size={28}
                    color={
                      selectedRetailer === retailer.id
                        ? Colors.primary
                        : Colors.mutedForeground
                    }
                  />
                  <Text
                    style={[
                      styles.retailerName,
                      selectedRetailer === retailer.id && styles.retailerNameSelected,
                    ]}
                  >
                    {retailer.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Item Details</Text>
            <Text style={styles.stepSubtitle}>
              Tell us about the item you're returning
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Wireless Headphones"
                value={productName}
                onChangeText={setProductName}
                placeholderTextColor={Colors.mutedForeground}
              />
            </View>
            {qrData && (
              <Card style={styles.qrCard}>
                <CardContent>
                  <View style={styles.qrInfo}>
                    <Ionicons name="qr-code" size={24} color={Colors.success} />
                    <Text style={styles.qrText}>QR Code scanned successfully</Text>
                  </View>
                </CardContent>
              </Card>
            )}
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => navigation.navigate('ScanQR')}
            >
              <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
              <Text style={styles.scanButtonText}>
                {qrData ? 'Scan Different QR' : 'Scan QR Code'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Schedule Pickup</Text>
            <Text style={styles.stepSubtitle}>
              When would you like us to pick up your return?
            </Text>
            <View style={styles.timeWindowList}>
              {timeWindows.map((window) => (
                <TouchableOpacity
                  key={window.id}
                  style={[
                    styles.timeWindowCard,
                    selectedTimeWindow === window.id && styles.timeWindowSelected,
                  ]}
                  onPress={() => setSelectedTimeWindow(window.id)}
                >
                  <View style={styles.timeWindowInfo}>
                    <Text style={styles.timeWindowLabel}>{window.label}</Text>
                    <Text style={styles.timeWindowTime}>{window.time}</Text>
                  </View>
                  {selectedTimeWindow === window.id && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        const retailer = retailers.find((r) => r.id === selectedRetailer);
        const timeWindow = timeWindows.find((t) => t.id === selectedTimeWindow);
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Confirm</Text>
            <Text style={styles.stepSubtitle}>
              Please review your return details
            </Text>
            <Card style={styles.summaryCard}>
              <CardContent>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Retailer</Text>
                  <Text style={styles.summaryValue}>{retailer?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Product</Text>
                  <Text style={styles.summaryValue}>{productName}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pickup Time</Text>
                  <Text style={styles.summaryValue}>
                    Today, {timeWindow?.time}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Address</Text>
                  <Text style={styles.summaryValue}>
                    123 Main St, San Francisco, CA
                  </Text>
                </View>
              </CardContent>
            </Card>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}>
          <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Return</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            style={[
              styles.progressStep,
              s <= step && styles.progressStepActive,
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scrollView}>
        {renderStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={step === 4 ? 'Schedule Pickup' : 'Continue'}
          onPress={handleNext}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.foreground,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.muted,
    borderRadius: BorderRadius.full,
  },
  progressStepActive: {
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: Spacing.md,
  },
  stepTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.mutedForeground,
    marginBottom: Spacing.lg,
  },
  retailerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  retailerCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  retailerCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.muted,
  },
  retailerName: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  retailerNameSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.foreground,
    marginBottom: Spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.foreground,
  },
  qrCard: {
    marginBottom: Spacing.md,
    backgroundColor: '#dcfce7',
    borderColor: Colors.success,
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qrText: {
    fontSize: FontSizes.sm,
    color: '#16a34a',
    fontWeight: '500',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  scanButtonText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '500',
  },
  timeWindowList: {
    gap: Spacing.sm,
  },
  timeWindowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  timeWindowSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.muted,
  },
  timeWindowInfo: {},
  timeWindowLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.foreground,
  },
  timeWindowTime: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  summaryCard: {
    marginTop: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  summaryValue: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.foreground,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
