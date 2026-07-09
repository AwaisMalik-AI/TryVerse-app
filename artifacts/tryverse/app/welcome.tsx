import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Pressable, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const stages = [
  { src: require('../assets/images/design/tv-user.jpg'), label: "Your photo" },
  { src: require('../assets/images/design/tv-outfit.jpg'), label: "Outfit" },
  { src: require('../assets/images/design/tv-result.jpg'), label: "Try-on" },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => (s + 1) % stages.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <Screen safeArea={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TryVerseLogo height={30} />
          <Text style={styles.tagline}>TRY IT BEFORE YOU BUY IT</Text>
        </View>

        <View style={styles.centerWrap}>
          <View style={styles.halo} />
          <View style={styles.card}>
            {stages.map((s, i) => (
              <Image 
                key={s.label}
                source={s.src}
                style={[styles.slide, i === stage && styles.slideActive]}
              />
            ))}
            <View style={styles.caption}>
              <View style={styles.dot} />
              <Text style={styles.captionText}>{stages[stage].label}</Text>
            </View>
          </View>
          <View style={styles.stepper}>
            {stages.map((s, i) => (
              <View key={s.label} style={[styles.stepDot, i === stage && styles.stepDotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.headingWrap}>
          <Text style={styles.heading}>Try Clothes On</Text>
          <Text style={styles.heading}>Before You Buy</Text>
          <Text style={[styles.heading, styles.headingGrad]}>With TryVerse</Text>
          <Text style={styles.body}>Upload your photo, choose an outfit, and see how it looks on you before checkout.</Text>
        </View>

        <View style={styles.ctaWrap}>
          <Pressable style={styles.cta} onPress={() => router.push('/onboarding/try-on')}>
            <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} style={styles.ctaGradient}>
              <Text style={styles.ctaText}>Get Started</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.ctaSec} onPress={() => router.push('/login')}>
            <Text style={styles.ctaSecText}>I already have an account</Text>
          </Pressable>
          <Text style={styles.disclaimer}>Private by design. Your photos stay yours.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tagline: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 10,
    letterSpacing: 3.5,
    color: 'rgba(216, 180, 254, 0.7)',
    marginTop: 6,
  },
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  halo: {
    position: 'absolute',
    width: 250,
    height: 300,
    backgroundColor: 'rgba(168, 85, 247, 0.55)',
    borderRadius: 40,
    opacity: 0.5,
    transform: [{ scale: 0.9 }],
  },
  card: {
    width: 210,
    height: 260,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  slide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  slideActive: {
    opacity: 1,
  },
  caption: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 4, 20, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c084fc',
  },
  captionText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#f5f3ff',
    textTransform: 'uppercase',
  },
  stepper: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  stepDotActive: {
    width: 24,
    backgroundColor: '#a855f7',
  },
  headingWrap: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  heading: {
    fontFamily: Typography.heading.fontFamily,
    fontSize: 26,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
  },
  headingGrad: {
    color: '#d946ef',
  },
  body: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
  },
  ctaWrap: {
    gap: 12,
  },
  cta: {
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  ctaGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.5,
  },
  ctaSec: {
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSecText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  disclaimer: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 4,
  }
});
