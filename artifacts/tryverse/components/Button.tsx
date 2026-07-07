import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TypographyText } from './Typography';
import { Colors } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button = ({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) => {
  const isOutline = variant === 'outline';
  const isText = variant === 'text';
  
  if (isText) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled || loading} 
        style={[styles.textButton, style]}
        activeOpacity={0.7}
      >
        <TypographyText variant="bodySemibold" color={Colors.primary}>
          {title}
        </TypographyText>
      </TouchableOpacity>
    );
  }

  const content = (
    <View style={[
      styles.buttonContent, 
      isOutline && styles.outlineContent,
      (disabled || loading) && { opacity: 0.7 }
    ]}>
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : Colors.text} />
      ) : (
        <TypographyText variant="bodySemibold" color={isOutline ? Colors.primary : Colors.text}>
          {title}
        </TypographyText>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} style={style}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading} 
      activeOpacity={0.8}
      style={[
        styles.container,
        isOutline && styles.outlineContainer,
        style
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
  },
  buttonContent: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineContainer: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  outlineContent: {
    backgroundColor: 'transparent',
  },
  textButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
