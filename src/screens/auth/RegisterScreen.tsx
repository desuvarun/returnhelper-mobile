import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors, Spacing, FontSizes } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function RegisterScreen({ navigation }: Props) {
  const { signUp, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      await signUp(name, email, password);
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="cube-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>ReturnHelper</Text>
            <Text style={styles.subtitle}>Create an account</Text>
            <Text style={styles.description}>
              Start with a free return - no credit card required
            </Text>
          </View>

          <View style={styles.form}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={20} color={Colors.foreground} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <Input
              label="Full Name"
              placeholder="John Doe"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="you@example.com"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="At least 8 characters"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.submitButton}
            />

            <View style={styles.benefits}>
              <Text style={styles.benefitsTitle}>What you get with your free trial:</Text>
              {['1 free return pickup', 'Full tracking & notifications', 'No credit card required'].map(
                (benefit, index) => (
                  <View key={index} style={styles.benefitRow}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                )
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.terms}>
              By creating an account, you agree to our{' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.foreground,
  },
  subtitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.foreground,
    marginTop: Spacing.md,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  socialButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.foreground,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    paddingHorizontal: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  benefits: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.muted,
    borderRadius: 8,
  },
  benefitsTitle: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginBottom: Spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  benefitText: {
    fontSize: FontSizes.sm,
    color: Colors.foreground,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  linkText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  terms: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
