import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme, Gradients, BorderRadius, FontSize, Spacing, Shadows } from '@/constants/theme';

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: FontSize.sm, iconSize: 16 },
  md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: FontSize.base, iconSize: 18 },
  lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: FontSize.md, iconSize: 20 },
};

export function GoldButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  variant = 'filled',
  size = 'md',
  style,
  textStyle,
  fullWidth,
}: GoldButtonProps) {
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  if (variant === 'filled') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          fullWidth && styles.fullWidth,
          { opacity: pressed ? 0.85 : isDisabled ? 0.5 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={Gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            { paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal },
            Shadows.gold,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.textInverse} />
          ) : (
            <>
              {icon && <Ionicons name={icon} size={s.iconSize} color={theme.textInverse} style={styles.icon} />}
              <Text style={[styles.filledText, { fontSize: s.fontSize }, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          styles.outline,
          { paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal },
          fullWidth && styles.fullWidth,
          { opacity: pressed ? 0.7 : isDisabled ? 0.5 : 1 },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.gold} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={s.iconSize} color={theme.gold} style={styles.icon} />}
            <Text style={[styles.outlineText, { fontSize: s.fontSize }, textStyle]}>{title}</Text>
          </>
        )}
      </Pressable>
    );
  }

  // ghost variant
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles.ghost,
        { paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal },
        fullWidth && styles.fullWidth,
        { opacity: pressed ? 0.6 : isDisabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.gold} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={s.iconSize} color={theme.gold} style={styles.icon} />}
          <Text style={[styles.ghostText, { fontSize: s.fontSize }, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  icon: {
    marginRight: 2,
  },
  filledText: {
    fontWeight: '700',
    color: theme.textInverse,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: theme.goldBorder,
    backgroundColor: 'transparent',
  },
  outlineText: {
    fontWeight: '600',
    color: theme.gold,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    fontWeight: '600',
    color: theme.gold,
  },
});
