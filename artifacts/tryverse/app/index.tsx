import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { View, StyleSheet, Image } from 'react-native';
import { Colors } from '@/constants/theme';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { useEffect, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    const id = setTimeout(() => {
      setReady(true);
    }, 2800);
    return () => clearTimeout(id);
  }, []);

  if (isLoading || !ready) {
    return (
      <Screen hideBackground={false}>
        <View style={styles.container}>
          <Animated.View style={[styles.content, { opacity }]}>
            <View style={styles.logoWrap}>
              <Image source={require('../assets/images/tryverse-logo.png')} style={styles.logo} />
            </View>
            <View style={styles.taglineWrap}>
              <TryVerseLogo height={24} />
            </View>
          </Animated.View>
        </View>
      </Screen>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 40,
    height: 40,
  },
  taglineWrap: {
    alignItems: 'center',
  }
});
