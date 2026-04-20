import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  light?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { mark: 28, text: 16, gap: 5 },
  md: { mark: 34, text: 20, gap: 6 },
  lg: { mark: 44, text: 28, gap: 8 },
};

export function Logo({ size = 'md', showText = true, light = false, style }: LogoProps) {
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
          <Text style={[styles.brandDark, light && styles.brandLight]}>Verse</Text>
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
    shadowColor: '#c9186a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  brandText: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandGold: {
    color: '#c9a96e',
  },
  brandDark: {
    color: '#1a1a2e',
  },
  brandLight: {
    color: '#ffffff',
  },
});
