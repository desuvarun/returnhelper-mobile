import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function ScanQRScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={48} color={Colors.mutedForeground} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan your return QR codes
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.permissionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Navigate to new return with scanned data
    Alert.alert(
      'QR Code Scanned!',
      `Return code: ${data.substring(0, 20)}...`,
      [
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            navigation.navigate('NewReturn', { qrData: data });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color={Colors.primaryForeground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setTorch(!torch)}
          >
            <Ionicons
              name={torch ? 'flash' : 'flash-outline'}
              size={24}
              color={Colors.primaryForeground}
            />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Scan Area Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Position the QR code from your return label within the frame
          </Text>
          <TouchableOpacity
            style={styles.manualEntry}
            onPress={() => navigation.navigate('NewReturn')}
          >
            <Text style={styles.manualEntryText}>Enter code manually</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.foreground,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.primaryForeground,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primaryForeground,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  instructions: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  instructionText: {
    fontSize: FontSizes.md,
    color: Colors.primaryForeground,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  manualEntry: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  manualEntryText: {
    fontSize: FontSizes.sm,
    color: Colors.primaryForeground,
    textDecorationLine: 'underline',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  permissionIcon: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  permissionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: Spacing.sm,
  },
  permissionText: {
    fontSize: FontSizes.md,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  permissionButton: {
    width: '100%',
    marginTop: Spacing.sm,
  },
});
