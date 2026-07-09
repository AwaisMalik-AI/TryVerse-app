import { Colors } from '../constants/theme';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const TryVerseLogo = ({ height = 28 }: { height?: number; width?: number }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.wordmark, { fontSize: height * 0.9 }]}>TRY<Text style={styles.accent}>VERSE</Text></Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: 'ClashDisplay-Semibold',
    letterSpacing: 2,
    color: '#fff',
    textShadowColor: 'rgba(168, 85, 247, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  accent: {
    color: '#C084FC', // Fallback for gradient text
  }
});