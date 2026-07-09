import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TryOnOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const cards = [
    { src: require('@/assets/images/design/tv-user.jpg'), label: "You", delay: 150 },
    { src: require('@/assets/images/design/tv-outfit.jpg'), label: "Outfit", delay: 350 },
    { src: require('@/assets/images/design/tv-result.jpg'), label: "Result", delay: 550 },
  ];

  const steps = [
    { n: "1", title: "Upload photo", desc: "Add a clear full-body picture.", delay: 150 },
    { n: "2", title: "Choose outfit", desc: "Pick anything you love.", delay: 350 },
    { n: "3", title: "See the result", desc: "Instant preview on you.", delay: 550 },
  ];

  return (
    <Screen style={styles.container}>
      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <TryVerseLogo height={22} />
          <View style={styles.progressContainer}>
            <Text style={styles.stepText}>STEP 1 OF 4</Text>
            <View style={styles.dots}>
              <LinearGradient colors={['#a855f7', '#d946ef']} style={styles.activeDot} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Animated.Text entering={FadeInUp.delay(150)} style={styles.title}>Try Clothes</Animated.Text>
          <Animated.View entering={FadeInUp.delay(550)}>
            <LinearGradient
              colors={['#c084fc', '#a855f7', '#d946ef']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientTextContainer}
              maskElement={<Text style={styles.titleGradient}>On Yourself</Text>}
            >
              <Text style={[styles.titleGradient, { opacity: 0 }]}>On Yourself</Text>
            </LinearGradient>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(550)} style={styles.subtitle}>
            Upload your photo, choose an outfit, and see the look on you instantly.
          </Animated.Text>
        </View>

        <View style={styles.cardsRow}>
          {cards.map((c, i) => (
            <Animated.View key={c.label} entering={FadeInUp.delay(c.delay)} style={styles.cardWrapper}>
              <View style={[styles.miniCard, i === 2 && styles.miniCardHero]}>
                <Image source={c.src} style={styles.miniImg} />
                <View style={styles.miniCaption}>
                  <View style={styles.dotIndicator} />
                  <Text style={styles.captionText}>{c.label}</Text>
                </View>
              </View>
              {i < cards.length - 1 && (
                <View style={styles.arrow} />
              )}
            </Animated.View>
          ))}
        </View>

        <View style={styles.stepsList}>
          {steps.map((s) => (
            <Animated.View key={s.n} entering={FadeInUp.delay(s.delay)} style={styles.stepRow}>
              <LinearGradient colors={['#7c3aed', '#d946ef']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.stepNum}>
                <Text style={styles.stepNumText}>{s.n}</Text>
              </LinearGradient>
              <View style={styles.stepTextContent}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={styles.ctas}>
          <Pressable style={styles.ctaPrimary} onPress={() => router.push('/onboarding/stylo')}>
            <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={[StyleSheet.absoluteFill, styles.ctaPrimaryGradient]} />
            <Text style={styles.ctaPrimaryText}>Next</Text>
          </Pressable>
          <Pressable style={styles.ctaSecondary} onPress={() => router.push('/signup')}>
            <Text style={styles.ctaSecondaryText}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 20 },
  progressContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  stepText: { fontFamily: 'Montserrat_400Regular', fontSize: 10, letterSpacing: 2.5, color: 'rgba(255,255,255,0.5)' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeDot: { width: 24, height: 6, borderRadius: 3 },
  titleContainer: { alignItems: 'center', marginTop: 24 },
  title: { fontFamily: 'ClashDisplay-Regular', fontSize: 26, color: '#fff', textAlign: 'center' },
  gradientTextContainer: { overflow: 'visible' },
  titleGradient: { fontFamily: 'ClashDisplay-Regular', fontSize: 26, textAlign: 'center' },
  subtitle: { fontFamily: 'Montserrat_400Regular', fontSize: 12.5, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 12, lineHeight: 18 },
  cardsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 28, gap: 6 },
  cardWrapper: { flexDirection: 'row', alignItems: 'center' },
  miniCard: { width: 90, height: 130, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  miniCardHero: { width: 100, height: 140, borderColor: 'rgba(216, 180, 254, 0.35)' },
  miniImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  miniCaption: { position: 'absolute', bottom: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(10, 4, 20, 0.6)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  dotIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#c084fc' },
  captionText: { fontFamily: 'Montserrat_500Medium', fontSize: 8, color: '#f5f3ff', letterSpacing: 0.5, textTransform: 'uppercase' },
  arrow: { width: 12, height: 1, backgroundColor: 'rgba(217,70,239,0.9)', marginLeft: 6 },
  stepsList: { marginTop: 28, gap: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  stepNum: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { fontFamily: 'ClashDisplay-Medium', fontSize: 12, color: '#fff' },
  stepTextContent: { flex: 1 },
  stepTitle: { fontFamily: 'Montserrat_500Medium', fontSize: 13, color: '#fff' },
  stepDesc: { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: 'rgba(221,214,254,0.5)', marginTop: 2 },
  ctas: { marginTop: 'auto', paddingTop: 20, gap: 12 },
  ctaPrimary: { height: 48, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  ctaPrimaryGradient: { borderRadius: 24 },
  ctaPrimaryText: { fontFamily: 'Montserrat_500Medium', fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  ctaSecondary: { height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' },
  ctaSecondaryText: { fontFamily: 'Montserrat_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
});
