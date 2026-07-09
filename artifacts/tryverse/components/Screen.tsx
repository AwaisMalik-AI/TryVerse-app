import React from 'react';
import { View, StyleSheet, Platform, ViewProps, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  safeArea?: boolean;
  withBottomNav?: boolean;
  hideBackground?: boolean;
}

export const Screen = ({ children, safeArea = true, withBottomNav = false, hideBackground = false, style, ...props }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  
  // Setup simple animation for drift
  const driftA = useSharedValue(0);
  const driftB = useSharedValue(0);

  React.useEffect(() => {
    driftA.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 12000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    driftB.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 14000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyleA = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: driftA.value * 20 },
        { translateY: driftA.value * -30 },
        { scale: 1 + driftA.value * 0.1 }
      ]
    };
  });

  const animatedStyleB = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: driftB.value * -20 },
        { translateY: driftB.value * 30 },
        { scale: 1 + driftB.value * 0.1 }
      ]
    };
  });

  return (
    <View style={styles.container}>
      {!hideBackground && (
        <View style={StyleSheet.absoluteFill}>
          {/* Base gradient */}
          <LinearGradient
            colors={['#1a0730', '#06010f', '#000000']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Glowing blobs */}
          <Animated.View style={[styles.glowA, animatedStyleA]} />
          <Animated.View style={[styles.glowB, animatedStyleB]} />
        </View>
      )}
      
      <View 
        style={[
          styles.content, 
          safeArea && { paddingTop: insets.top },
          withBottomNav && { paddingBottom: 0 },
          style
        ]} 
        {...props}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  glowA: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(124, 58, 237, 0.25)', // #7c3aed
    top: '12%',
    left: '-20%',
    ...(Platform.OS !== 'android' && {
      shadowColor: '#7c3aed',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 60,
    }),
  },
  glowB: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(217, 70, 239, 0.25)', // #d946ef
    bottom: '8%',
    right: '-25%',
    ...(Platform.OS !== 'android' && {
      shadowColor: '#d946ef',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 60,
    }),
  }
});