import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const features = [
  {
    title: "Pose Studio",
    desc: "Turn outfit photos into polished fashion poses.",
    image: require('@/assets/images/design/tv-feat-pose.jpg'),
    delay: 150,
    tag: "Featured",
  },
  {
    title: "Virtual Try-On",
    desc: "See clothes on yourself before checkout.",
    image: require('@/assets/images/design/tv-feat-tryon.jpg'),
    delay: 150,
  },
  {
    title: "AI Stylist",
    desc: "Get outfit advice and color tips.",
    image: require('@/assets/images/design/tv-feat-stylist.jpg'),
    delay: 350,
  },
  {
    title: "AI Fashion Store",
    desc: "Browse outfits and try them instantly.",
    image: require('@/assets/images/design/tv-feat-store.jpg'),
    delay: 350,
  },
  {
    title: "Saved Looks",
    desc: "Save and compare your favorite outfits.",
    image: require('@/assets/images/design/tv-feat-saved.jpg'),
    delay: 550,
  },
  {
    title: "Showcase Video",
    desc: "Create short outfit videos to share.",
    image: require('@/assets/images/design/tv-feat-video.jpg'),
    delay: 550,
  },
];

export default function FeaturesOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TryVerseLogo height={22} />
          <View style={styles.progressContainer}>
            <Text style={styles.stepText}>STEP 4 OF 4</Text>
            <View style={styles.dots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
              <LinearGradient colors={['#a855f7', '#d946ef']} style={styles.activeDot} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
            </View>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Animated.Text entering={FadeInUp.delay(150)} style={styles.title}>Everything You Need</Animated.Text>
          <Animated.View entering={FadeInUp.delay(550)}>
            <LinearGradient
              colors={['#c084fc', '#a855f7', '#d946ef']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientTextContainer}
              {...({ maskElement: <Text style={styles.titleGradient}>To Shop Smarter</Text> } as object)}
            >
              <Text style={[styles.titleGradient, { opacity: 0 }]}>To Shop Smarter</Text>
            </LinearGradient>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(550)} style={styles.subtitle}>
            Try outfits, discover products, get AI styling, create poses, and save looks — all in one app.
          </Animated.Text>
        </View>

        <View style={styles.grid}>
          {features.map((f, i) => (
            <Animated.View key={f.title} entering={FadeInUp.delay(f.delay)} style={styles.card}>
              <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']} style={StyleSheet.absoluteFill} />
              <View style={styles.mediaContainer}>
                <Image source={f.image} style={styles.image} />
                {f.tag && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{f.tag}</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={styles.ctas}>
          <Pressable style={styles.ctaPrimary} onPress={() => router.push('/signup')}>
            <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={[StyleSheet.absoluteFill, styles.ctaPrimaryGradient]} />
            <Text style={styles.ctaPrimaryText}>Create Free Account</Text>
          </Pressable>
          <Pressable style={styles.ctaSecondary} onPress={() => router.push('/login')}>
            <Text style={styles.ctaSecondaryText}>I already have an account</Text>
          </Pressable>
          <Pressable style={styles.skipButton} onPress={() => router.push('/signup')}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          <Text style={styles.footerText}>Your photos are private and deleted after your session.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20 },
  header: { alignItems: 'center', marginTop: 20 },
  progressContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  stepText: { fontFamily: 'Montserrat_400Regular', fontSize: 10, letterSpacing: 2.5, color: 'rgba(255,255,255,0.5)' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeDot: { width: 24, height: 6, borderRadius: 3 },
  titleContainer: { alignItems: 'center', marginTop: 16, paddingHorizontal: 8 },
  title: { fontFamily: 'ClashDisplay-Regular', fontSize: 24, color: '#fff', textAlign: 'center' },
  gradientTextContainer: { overflow: 'visible' },
  titleGradient: { fontFamily: 'ClashDisplay-Regular', fontSize: 24, textAlign: 'center' },
  subtitle: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 10, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16, justifyContent: 'center' },
  card: { width: '48%', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  mediaContainer: { width: '100%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  tag: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  tagText: { fontFamily: 'Montserrat_600SemiBold', fontSize: 8, color: '#fff', textTransform: 'uppercase' },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: 'Montserrat_500Medium', fontSize: 12, color: '#fff', marginBottom: 2 },
  cardDesc: { fontFamily: 'Montserrat_400Regular', fontSize: 10.5, color: 'rgba(255,255,255,0.55)' },
  ctas: { marginTop: 'auto', paddingTop: 16, gap: 10 },
  ctaPrimary: { height: 48, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  ctaPrimaryGradient: { borderRadius: 24 },
  ctaPrimaryText: { fontFamily: 'Montserrat_500Medium', fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  ctaSecondary: { height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', justifyContent: 'center', alignItems: 'center' },
  ctaSecondaryText: { fontFamily: 'Montserrat_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  skipButton: { height: 40, justifyContent: 'center', alignItems: 'center' },
  skipText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  footerText: { fontFamily: 'Montserrat_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
});
