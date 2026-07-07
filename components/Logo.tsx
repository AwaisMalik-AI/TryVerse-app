import { View, Image, StyleSheet, ViewStyle } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { mark: 28, full: 100, height: 28 },
  md: { mark: 34, full: 130, height: 34 },
  lg: { mark: 44, full: 170, height: 44 },
  xl: { mark: 64, full: 240, height: 64 },
};

export function Logo({ size = 'md', showText = true, style }: LogoProps) {
  const s = sizeMap[size];

  if (showText) {
    return (
      <View style={[styles.container, style]}>
        <Image
          source={require('@/assets/images/tryverse-logo-full.png')}
          style={{ width: s.full, height: s.height, resizeMode: 'contain' }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('@/assets/images/tryverse-logo.png')}
        style={{ width: s.mark, height: s.mark, resizeMode: 'contain' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
