import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSizes } from '../../constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: Colors.secondary,
  },
  success: {
    backgroundColor: '#dcfce7',
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
  destructive: {
    backgroundColor: '#fee2e2',
  },
  info: {
    backgroundColor: '#dbeafe',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  text_default: {
    color: Colors.secondaryForeground,
  },
  text_success: {
    color: '#16a34a',
  },
  text_warning: {
    color: '#d97706',
  },
  text_destructive: {
    color: '#dc2626',
  },
  text_info: {
    color: '#2563eb',
  },
  text_outline: {
    color: Colors.foreground,
  },
});
