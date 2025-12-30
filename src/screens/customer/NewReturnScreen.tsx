import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { apiRequest } from '../../lib/api';
import { Address } from '../../types';

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
  { id: 'MORNING', label: 'Morning', time: '9 AM - 12 PM' },
  { id: 'AFTERNOON', label: 'Afternoon', time: '12 PM - 5 PM' },
  { id: 'EVENING', label: 'Evening', time: '5 PM - 8 PM' },
];

const itemSizes = [
  { id: 'SMALL', label: 'Small', description: 'Fits in a shoebox' },
  { id: 'MEDIUM', label: 'Medium', description: 'Fits in a backpack' },
  { id: 'LARGE', label: 'Large', description: 'Needs two hands to carry' },
];

const returnReasons = [
  'Changed my mind',
  'Item damaged',
  'Wrong item received',
  'Item not as described',
  'Better price found',
  'Other',
];

export function NewReturnScreen({ navigation, route }: Props) {
  const qrData = route?.params?.qrData;
  const [step, setStep] = useState(1);
  const [selectedRetailer, setSelectedRetailer] = useState<string | null>(null);
  const [customRetailer, setCustomRetailer] = useState('');
  const [productName, setProductName] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [itemSize, setItemSize] = useState<string | null>(null);
  const [isFragile, setIsFragile] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<string | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await apiRequest<{ addresses: Address[] }>('/addresses');
      setAddresses(response.addresses);
      if (response.addresses.length > 0) {
        const defaultAddress = response.addresses.find(a => a.isDefault) || response.addresses[0];
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedRetailer) {
      Alert.alert('Error', 'Please select a retailer');
      return;
    }
    if (step === 1 && selectedRetailer === 'other' && !customRetailer) {
      Alert.alert('Error', 'Please enter the retailer name');
      return;
    }
    if (step === 2 && !productName) {
      Alert.alert('Error', 'Please enter the product name');
      return;
    }
    if (step === 2 && !returnReason) {
      Alert.alert('Error', 'Please select a return reason');
      return;
    }
    if (step === 2 && !itemSize) {
      Alert.alert('Error', 'Please select the item size');
      return;
    }
    if (step === 3 && !selectedAddress) {
      Alert.alert('Error', 'Please select a pickup address');
      return;
    }
    if (step === 4 && !selectedTimeWindow) {
      Alert.alert('Error', 'Please select a pickup time');
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const retailerName = selectedRetailer === 'other'
        ? customRetailer
        : retailers.find(r => r.id === selectedRetailer)?.name;

      const response = await apiRequest<{ return: any }>('/returns', {
        method: 'POST',
        body: {
          retailer: retailerName,
          items: [{
            productName,
            returnReason,
            size: itemSize,
            fragile: isFragile,
            qrCodeUrl: qrData || null,
          }],
          addressId: selectedAddress,
          scheduledDate: selectedDate.toISOString(),
          timeWindow: selectedTimeWindow,
          specialInstructions: specialInstructions || null,
        },
      });

      Alert.alert(
        'Success!',
        'Your return has been scheduled. We\'ll notify you when a driver is assigned.',
        [
          {
            text: 'View Returns',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create return. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
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
            {selectedRetailer === 'other' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Retailer Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter retailer name"
                  value={customRetailer}
                  onChangeText={setCustomRetailer}
                  placeholderTextColor={Colors.mutedForeground}
                />
              </View>
            )}
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Return Reason</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.reasonChips}>
                  {returnReasons.map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={[
                        styles.reasonChip,
                        returnReason === reason && styles.reasonChipSelected,
                      ]}
                      onPress={() => setReturnReason(reason)}
                    >
                      <Text
                        style={[
                          styles.reasonChipText,
                          returnReason === reason && styles.reasonChipTextSelected,
                        ]}
                      >
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Size</Text>
              <View style={styles.sizeList}>
                {itemSizes.map((size) => (
                  <TouchableOpacity
                    key={size.id}
                    style={[
                      styles.sizeCard,
                      itemSize === size.id && styles.sizeCardSelected,
                    ]}
                    onPress={() => setItemSize(size.id)}
                  >
                    <Text style={[
                      styles.sizeLabel,
                      itemSize === size.id && styles.sizeLabelSelected,
                    ]}>
                      {size.label}
                    </Text>
                    <Text style={styles.sizeDescription}>{size.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.fragileToggle}
              onPress={() => setIsFragile(!isFragile)}
            >
              <Ionicons
                name={isFragile ? 'checkbox' : 'square-outline'}
                size={24}
                color={isFragile ? Colors.primary : Colors.mutedForeground}
              />
              <Text style={styles.fragileText}>This item is fragile</Text>
            </TouchableOpacity>

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
                {qrData ? 'Scan Different QR' : 'Scan Return QR Code'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pickup Address</Text>
            <Text style={styles.stepSubtitle}>
              Where should we pick up your return?
            </Text>

            {loadingAddresses ? (
              <Text style={styles.loadingText}>Loading addresses...</Text>
            ) : addresses.length === 0 ? (
              <View style={styles.noAddresses}>
                <Ionicons name="location-outline" size={48} color={Colors.mutedForeground} />
                <Text style={styles.noAddressText}>No addresses saved</Text>
                <Button
                  title="Add Address"
                  onPress={() => Alert.alert('Info', 'Address management coming soon!')}
                  variant="outline"
                  style={{ marginTop: Spacing.md }}
                />
              </View>
            ) : (
              <View style={styles.addressList}>
                {addresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={[
                      styles.addressCard,
                      selectedAddress === address.id && styles.addressCardSelected,
                    ]}
                    onPress={() => setSelectedAddress(address.id)}
                  >
                    <View style={styles.addressIcon}>
                      <Ionicons
                        name={address.label === 'Home' ? 'home-outline' : 'business-outline'}
                        size={20}
                        color={selectedAddress === address.id ? Colors.primary : Colors.mutedForeground}
                      />
                    </View>
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      <Text style={styles.addressText}>
                        {address.street}{address.apartment ? `, ${address.apartment}` : ''}
                      </Text>
                      <Text style={styles.addressText}>
                        {address.city}, {address.state} {address.zipCode}
                      </Text>
                    </View>
                    {selectedAddress === address.id && (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="e.g., Gate code is 1234, leave at front door"
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                placeholderTextColor={Colors.mutedForeground}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Schedule Pickup</Text>
            <Text style={styles.stepSubtitle}>
              When would you like us to pick up your return?
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pickup Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.mutedForeground} />
                <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
                <Ionicons name="chevron-down" size={20} color={Colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date(Date.now() + 86400000)}
                maximumDate={new Date(Date.now() + 7 * 86400000)}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time Window</Text>
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
          </View>
        );

      case 5:
        const retailer = selectedRetailer === 'other'
          ? customRetailer
          : retailers.find((r) => r.id === selectedRetailer)?.name;
        const timeWindow = timeWindows.find((t) => t.id === selectedTimeWindow);
        const address = addresses.find((a) => a.id === selectedAddress);

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
                  <Text style={styles.summaryValue}>{retailer}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Product</Text>
                  <Text style={styles.summaryValue}>{productName}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Reason</Text>
                  <Text style={styles.summaryValue}>{returnReason}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Size</Text>
                  <Text style={styles.summaryValue}>
                    {itemSizes.find(s => s.id === itemSize)?.label}
                    {isFragile ? ' (Fragile)' : ''}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pickup Date</Text>
                  <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Time Window</Text>
                  <Text style={styles.summaryValue}>{timeWindow?.time}</Text>
                </View>
                <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.summaryLabel}>Address</Text>
                  <Text style={[styles.summaryValue, { textAlign: 'right', flex: 1 }]}>
                    {address?.street}, {address?.city}
                  </Text>
                </View>
              </CardContent>
            </Card>

            {qrData && (
              <View style={styles.qrConfirm}>
                <Ionicons name="qr-code" size={20} color={Colors.success} />
                <Text style={styles.qrConfirmText}>Return QR code attached</Text>
              </View>
            )}
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
        {[1, 2, 3, 4, 5].map((s) => (
          <View
            key={s}
            style={[
              styles.progressStep,
              s <= step && styles.progressStepActive,
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {renderStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={step === 5 ? 'Schedule Pickup' : 'Continue'}
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
    marginTop: Spacing.md,
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
    backgroundColor: Colors.background,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reasonChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  reasonChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.muted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reasonChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  reasonChipText: {
    fontSize: FontSizes.sm,
    color: Colors.foreground,
  },
  reasonChipTextSelected: {
    color: Colors.primaryForeground,
    fontWeight: '500',
  },
  sizeList: {
    gap: Spacing.sm,
  },
  sizeCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  sizeCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.muted,
  },
  sizeLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.foreground,
  },
  sizeLabelSelected: {
    color: Colors.primary,
  },
  sizeDescription: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  fragileToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  fragileText: {
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
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.mutedForeground,
    textAlign: 'center',
    padding: Spacing.xl,
  },
  noAddresses: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  noAddressText: {
    fontSize: FontSizes.md,
    color: Colors.mutedForeground,
    marginTop: Spacing.md,
  },
  addressList: {
    gap: Spacing.sm,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  addressCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.muted,
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
  addressLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.foreground,
  },
  addressText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
  },
  dateButtonText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.foreground,
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
  qrConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#dcfce7',
    borderRadius: BorderRadius.md,
  },
  qrConfirmText: {
    fontSize: FontSizes.sm,
    color: '#16a34a',
    fontWeight: '500',
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
