import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StyloOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const recs = [
    { src: require('@/assets/images/design/tv-trousers.jpg'), label: "Cream trousers", delay: 1000 },
    { src: require('@/assets/images/design/tv-top.jpg'), label: "Neutral top", delay: 1200 },
    { src: require('@/assets/images/design/tv-blazer-lavender.jpg'), label: "Lavender blazer", delay: 1400 },
  ];

  const chips = ["Outfit advice", "Color matching", "Size guidance", "Product discovery"];

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TryVerseLogo height={22} />
          <View style={styles.progressContainer}>
            <Text style={styles.stepText}>STEP 2 OF 4</Text>
            <View style={styles.dots}>
              <View style={styles.dot} />
              <LinearGradient colors={['#a855f7', '#d946ef']} style={styles.activeDot} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Animated.View entering={FadeInUp.delay(150)}>
            <LinearGradient
              colors={['#c084fc', '#a855f7', '#d946ef']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientTextContainer}
              maskElement={<Text style={styles.titleGradient}>AI Stylist</Text>}
            >
              <Text style={[styles.titleGradient, { opacity: 0 }]}>AI Stylist</Text>
            </LinearGradient>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(250)} style={styles.subtitle}>
            Get outfit advice, color suggestions, size guidance, and product ideas in seconds.
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(350)} style={styles.subSubtitle}>
            Powered by Stylo, your TryVerse chatbot.
          </Animated.Text>
        </View>

        <View style={styles.chatCard}>
          <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']} style={StyleSheet.absoluteFill} />
          
          <Animated.View entering={FadeInUp.delay(150)} style={styles.chatUser}>
            <LinearGradient colors={['rgba(124,58,237,0.55)', 'rgba(217,70,239,0.55)']} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} start={{x:0,y:0}} end={{x:1,y:1}} />
            <Text style={styles.chatUserText}>What should I wear with this blazer?</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(550)} style={styles.chatStylo}>
            <LinearGradient colors={['#7c3aed', '#d946ef']} style={styles.chatAvatar} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={styles.chatAvatarText}>S</Text>
            </LinearGradient>
            
            <View style={styles.chatStyloContent}>
              <Text style={styles.styloName}>STYLO</Text>
              <Text style={styles.styloText}>Try cream trousers, a neutral top, and soft lavender tones for a polished look.</Text>
              
              <View style={styles.recsRow}>
                {recs.map((r, i) => (
                  <Animated.View key={r.label} entering={FadeInUp.delay(r.delay)} style={styles.recCard}>
                    <Image source={r.src} style={styles.recImg} />
                    <View style={styles.recLabelWrap}>
                      <Text style={styles.recLabel} numberOfLines={1}>{r.label}</Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>

        <View style={styles.chipsRow}>
          {chips.map((c, i) => (
            <Animated.View key={c} entering={FadeInUp.delay(1500 + i*150)} style={[styles.chip, i === 0 && styles.chipActive]}>
              {i === 0 && <LinearGradient colors={['rgba(124,58,237,0.4)', 'rgba(217,70,239,0.4)']} style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:1}} />}
              <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{c}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.ctas}>
          <Pressable style={styles.ctaPrimary} onPress={() => router.push('/onboarding/save')}>
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
  scrollContent: { flexGrow: 1, paddingHorizontal: 20 },
  header: { alignItems: 'center', marginTop: 20 },
  progressContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  stepText: { fontFamily: 'Montserrat_400Regular', fontSize: 10, letterSpacing: 2.5, color: 'rgba(255,255,255,0.5)' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeDot: { width: 24, height: 6, borderRadius: 3 },
  titleContainer: { alignItems: 'center', marginTop: 20, paddingHorizontal: 12 },
  gradientTextContainer: { overflow: 'visible' },
  titleGradient: { fontFamily: 'ClashDisplay-Regular', fontSize: 26, textAlign: 'center' },
  subtitle: { fontFamily: 'Montserrat_400Regular', fontSize: 12.5, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 12, lineHeight: 18 },
  subSubtitle: { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 6 },
  chatCard: { marginTop: 20, padding: 14, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  chatUser: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderBottomRightRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', maxWidth: '85%' },
  chatUserText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#fff', lineHeight: 16 },
  chatStylo: { flexDirection: 'row', gap: 10, marginTop: 12, padding: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  chatAvatar: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  chatAvatarText: { fontFamily: 'ClashDisplay-Medium', fontSize: 13, color: '#fff' },
  chatStyloContent: { flex: 1 },
  styloName: { fontFamily: 'Montserrat_400Regular', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.8, color: 'rgba(196,181,253,0.8)', marginBottom: 4 },
  styloText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 16 },
  recsRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  recCard: { flex: 1, aspectRatio: 0.75, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  recImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  recLabelWrap: { position: 'absolute', bottom: 4, left: 4, right: 4, backgroundColor: 'rgba(10,4,20,0.65)', borderRadius: 12, paddingVertical: 3, paddingHorizontal: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  recLabel: { fontFamily: 'Montserrat_400Regular', fontSize: 8.5, color: '#f5f3ff', textAlign: 'center' },
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
