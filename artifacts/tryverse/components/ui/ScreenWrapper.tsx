import { View, StyleSheet, ViewStyle, ScrollView, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, Spacing, TAB_BAR_SPACER } from '@/constants/theme';
import type { ReactNode } from 'react';

interface ScreenWrapperProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  tabBarPad?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  keyboardAvoid?: boolean;
}

export function ScreenWrapper({
  children,
  scroll = true,
  padded = true,
  tabBarPad = true,
  refreshing,
  onRefresh,
  style,
  contentStyle,
  keyboardAvoid,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  const content = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        padded && styles.padded,
        { paddingTop: insets.top + Spacing.sm },
        tabBarPad && { paddingBottom: TAB_BAR_SPACER },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={theme.gold}
            colors={[theme.gold]}
            progressBackgroundColor={theme.surface}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        padded && styles.padded,
        { paddingTop: insets.top + Spacing.sm },
        tabBarPad && { paddingBottom: TAB_BAR_SPACER },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const wrapped = keyboardAvoid ? (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    <View style={[styles.container, style]}>{content}</View>
  );

  return wrapped;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: Spacing.base,
  },
});
