import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, BorderRadius, Spacing, Shadows, Gradients } from '@/constants/theme';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  glow?: boolean;
  gradient?: readonly [string, string];
  noPadding?: boolean;
}

export function GlassCard({ children, style, onPress, glow, gradient, noPadding }: GlassCardProps) {
  const inner = (
    <View style={[styles.card, glow && Shadows.gold, noPadding ? styles.noPadding : styles.padding, style]}>
      {gradient ? (
        <LinearGradient
          colors={gradient as unknown as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBg}
        />
      ) : null}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        {inner}
      </Pressable>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  padding: {
    padding: Spacing.base,
  },
  noPadding: {
    padding: 0,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
});
