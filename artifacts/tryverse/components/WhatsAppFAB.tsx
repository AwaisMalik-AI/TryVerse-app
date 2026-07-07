import { useRef, useEffect } from 'react';
import { Animated, Pressable, Linking, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT, Shadows } from '@/constants/theme';

const WHATSAPP_NUMBER = '+923001234567';
const WHATSAPP_MESSAGE = 'Hi TryVerse! I need help with...';

export function WhatsAppFAB() {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
      delay: 1500,
    }).start();
  }, []);

  const openWhatsApp = () => {
    const encoded = encodeURIComponent(WHATSAPP_MESSAGE);
    const url = Platform.select({
      ios: `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`,
      android: `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encoded}`,
      default: `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`);
    });
  };

  const bottomOffset = TAB_BAR_HEIGHT + Math.max(insets.bottom, 10) + 76;

  return (
    <Animated.View style={[styles.container, { bottom: bottomOffset, transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={openWhatsApp}
        style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}
      >
        <Ionicons name="logo-whatsapp" size={26} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 998,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
});
