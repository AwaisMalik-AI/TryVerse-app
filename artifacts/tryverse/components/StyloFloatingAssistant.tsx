import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Colors, Typography } from '@/constants/theme';
import Svg, { Path } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export function StyloFloatingAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const scale = useSharedValue(0);
  const popoverOpacity = useSharedValue(0);
  const popoverTranslateY = useSharedValue(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
      scale.value = withSpring(1);
      popoverOpacity.value = withTiming(1, { duration: 300 });
      popoverTranslateY.value = withSpring(0);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleOpen = () => {
    if (open) {
      popoverOpacity.value = withTiming(0, { duration: 200 });
      popoverTranslateY.value = withTiming(20, { duration: 200 }, (finished) => {
        if (finished) runOnJS(setOpen)(false);
      });
    } else {
      setOpen(true);
      popoverOpacity.value = withTiming(1, { duration: 300 });
      popoverTranslateY.value = withSpring(0);
    }
  };

  const popoverStyle = useAnimatedStyle(() => ({
    opacity: popoverOpacity.value,
    transform: [{ translateY: popoverTranslateY.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      {open && (
        <Animated.View style={[styles.popover, popoverStyle]}>
          {Platform.OS === 'ios' && <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />}
          <Pressable style={styles.closeButton} onPress={toggleOpen}>
            <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <Path d="M6 6l12 12M18 6L6 18"/>
            </Svg>
          </Pressable>
          
          <View style={styles.header}>
            <LinearGradient colors={['#7c3aed', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/>
              </Svg>
            </LinearGradient>
            <Text style={styles.name}>Hi, I'm Stylo</Text>
          </View>
          
          <Text style={styles.message}>Need help choosing an outfit?</Text>
          
          <Pressable style={styles.cta} onPress={() => router.push('/(tabs)/stylo')}>
            <LinearGradient colors={['#7c3aed', '#a855f7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
              <Text style={styles.ctaText}>Ask Stylo</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}

      <Pressable style={styles.fab} onPress={toggleOpen}>
        <LinearGradient colors={['#7c3aed', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabGradient}>
          {open ? (
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <Path d="M6 6l12 12M18 6L6 18"/>
            </Svg>
          ) : (
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.3A8 8 0 1 1 21 12z"/><Path d="M9 11h.01M12 11h.01M15 11h.01"/>
            </Svg>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    right: 24,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  popover: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(25, 20, 40, 0.95)' : 'rgba(25, 20, 40, 0.65)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    width: 240,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#fff',
    fontFamily: Typography.bodySemibold.fontFamily,
    fontSize: 14,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    marginBottom: 16,
  },
  cta: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: 13,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
