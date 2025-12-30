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

export function LoginScreen({ navigation }: Props) {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
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
            <Text style={styles.subtitle}>Welcome back</Text>
            <Text style={styles.description}>Sign in to your account to continue</Text>
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
              placeholder="Enter your password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Sign up</Text>
              </TouchableOpacity>
            </View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
  },
  submitButton: {
    marginTop: Spacing.sm,
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
});
