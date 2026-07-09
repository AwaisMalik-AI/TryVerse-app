import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SaveOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const looks = [
    { src: require('@/assets/images/design/tv-result.jpg'), label: "Try-On", delay: 150 },
    { src: require('@/assets/images/design/tv-outfit.jpg'), label: "Compare", delay: 550 },
    { src: require('@/assets/images/design/tv-blazer-lavender.jpg'), label: "Stylo Pick", delay: 950 },
    { src: require('@/assets/images/design/tv-top.jpg'), label: "Saved", delay: 950 },
  ];

  const benefits = ["Private uploads", "Fast results", "Clothing-only AI", "Compare before buying"];

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TryVerseLogo height={22} />
          <View style={styles.progressContainer}>
            <Text style={styles.stepText}>STEP 3 OF 4</Text>
            <View style={styles.dots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <LinearGradient colors={['#a855f7', '#d946ef']} style={styles.activeDot} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Animated.Text entering={FadeInUp.delay(150)} style={styles.title}>Save Looks</Animated.Text>
          <Animated.View entering={FadeInUp.delay(550)}>
            <LinearGradient
              colors={['#c084fc', '#a855f7', '#d946ef']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientTextContainer}
              {...({ maskElement: <Text style={styles.titleGradient}>You Love</Text> } as object)}
            >
              <Text style={[styles.titleGradient, { opacity: 0 }]}>You Love</Text>
            </LinearGradient>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(550)} style={styles.subtitle}>
            Keep your try-on results, compare outfits, and shop with more confidence.
          </Animated.Text>
        </View>

        <View style={styles.grid}>
          {looks.map((l, i) => (
            <Animated.View key={l.label} entering={FadeInUp.delay(l.delay)} style={styles.miniCard}>
              <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={StyleSheet.absoluteFill} />
              <Image source={l.src} style={styles.miniImg} />
              <View style={styles.miniCaption}>
                <View style={styles.dotIndicator} />
                <Text style={styles.captionText}>{l.label}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={styles.chipsRow}>
          {benefits.map((b, i) => (
            <Animated.View key={b} entering={FadeInUp.delay(1100 + i*150)} style={[styles.chip, i === 0 && styles.chipActive]}>
              {i === 0 && <LinearGradient colors={['rgba(124,58,237,0.4)', 'rgba(217,70,239,0.4)']} style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:1}} />}
              <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{b}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.ctas}>
          <Pressable style={styles.ctaPrimary} onPress={() => router.push('/onboarding/features')}>
            <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={[StyleSheet.absoluteFill, styles.ctaPrimaryGradient]} />
            <Text style={styles.ctaPrimaryText}>Next</Text>
          </Pressable>
          <Pressable style={styles.ctaSecondary} onPress={() => router.push('/signup')}>
            <Text style={styles.ctaSecondaryText}>Skip</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 20 },
  progressContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  stepText: { fontFamily: 'Montserrat_400Regular', fontSize: 10, letterSpacing: 2.5, color: 'rgba(255,255,255,0.5)' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeDot: { width: 24, height: 6, borderRadius: 3 },
  titleContainer: { alignItems: 'center', marginTop: 20, paddingHorizontal: 12 },
  title: { fontFamily: 'ClashDisplay-Regular', fontSize: 26, color: '#fff', textAlign: 'center' },
  gradientTextContainer: { overflow: 'visible' },
  titleGradient: { fontFamily: 'ClashDisplay-Regular', fontSize: 26, textAlign: 'center' },
  subtitle: { fontFamily: 'Montserrat_400Regular', fontSize: 12.5, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 12, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20, justifyContent: 'center' },
  miniCard: { width: '48%', height: 140, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  miniImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  miniCaption: { position: 'absolute', bottom: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(10, 4, 20, 0.6)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  dotIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#c084fc' },
  captionText: { fontFamily: 'Montserrat_500Medium', fontSize: 8, color: '#f5f3ff', letterSpacing: 0.5, textTransform: 'uppercase' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  chipActive: { borderColor: 'rgba(216,180,254,0.5)' },
  chipText: { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  chipTextActive: { color: '#fff' },
  ctas: { marginTop: 'auto', paddingTop: 20, gap: 12 },
  ctaPrimary: { height: 48, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  ctaPrimaryGradient: { borderRadius: 24 },
  ctaPrimaryText: { fontFamily: 'Montserrat_500Medium', fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  ctaSecondary: { height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' },
  ctaSecondaryText: { fontFamily: 'Montserrat_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
});
