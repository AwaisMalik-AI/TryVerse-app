import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { mark: 28, text: 16, gap: 5 },
  md: { mark: 34, text: 20, gap: 6 },
  lg: { mark: 44, text: 28, gap: 8 },
  xl: { mark: 64, text: 36, gap: 10 },
};

export function Logo({ size = 'md', showText = true, style }: LogoProps) {
  const s = sizeMap[size];

  return (
    <View style={[styles.container, { gap: s.gap }, style]}>
      <Image
        source={require('@/assets/images/tryverse-logo.jpg')}
        style={[
          styles.logoImage,
          {
            width: s.mark,
            height: s.mark,
            borderRadius: s.mark / 2,
          },
        ]}
      />
      {showText && (
        <Text style={[styles.brandText, { fontSize: s.text }]}>
          <Text style={styles.brandGold}>Try</Text>
          <Text style={styles.brandLight}>Verse</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    resizeMode: 'cover',
  },
  brandText: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandGold: {
    color: theme.gold,
  },
  brandLight: {
    color: theme.text,
  },
});
