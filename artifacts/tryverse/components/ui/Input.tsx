import { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, BorderRadius, Spacing, FontSize } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onFocus?.(undefined as any);
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onBlur?.(undefined as any);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? theme.danger : theme.inputBorder, error ? theme.danger : theme.inputFocusBorder],
  });

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        {icon && (
          <Ionicons name={icon} size={18} color={focused ? theme.gold : theme.textMuted} style={styles.leftIcon} />
        )}
        <TextInput
          {...props}
          style={[styles.input, icon && styles.inputWithIcon, rightIcon && styles.inputWithRightIcon]}
          placeholderTextColor={theme.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={theme.gold}
          cursorColor={theme.gold}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon} hitSlop={12}>
            <Ionicons name={rightIcon} size={20} color={theme.textMuted} />
          </Pressable>
        )}
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: Spacing.xs,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  leftIcon: {
    marginLeft: Spacing.md,
  },
  rightIcon: {
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: FontSize.base,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  error: {
    fontSize: FontSize.xs,
    color: theme.danger,
    marginTop: 4,
    marginLeft: 2,
  },
});
