import React from 'react';
import { View, TextInput as RNTextInput, TextInputProps as RNTextInputProps, StyleSheet, Animated } from 'react-native';
import { Colors, Typography } from '../constants/theme';
import { TypographyText } from './Typography';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const TextInput = ({ label, error, leftIcon, style, ...props }: TextInputProps) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <TypographyText variant="small" color={Colors.textMuted} style={styles.label}>
          {label}
        </TypographyText>
      )}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError
      ]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <RNTextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error && (
        <TypographyText variant="small" color={Colors.error} style={styles.errorText}>
          {error}
        </TypographyText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceHighlight,
  },
  inputContainerError: {
    borderColor: Colors.error,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: Typography.body.fontFamily,
    fontSize: 16,
    color: Colors.text,
    height: '100%',
  },
  errorText: {
    marginTop: 8,
    marginLeft: 4,
  }
});
