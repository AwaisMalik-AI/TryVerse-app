import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  safeArea?: boolean;
  withBottomNav?: boolean;
}

export const Screen = ({ children, safeArea = true, withBottomNav = false, style, ...props }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  
  const content = (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );

  return (
    <View style={[
      styles.container,
      safeArea && { paddingTop: insets.top },
      withBottomNav && { paddingBottom: 0 } // handled by bottom tabs
    ]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  }
});
