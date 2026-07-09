import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { StyloFloatingAssistant } from '@/components/StyloFloatingAssistant';
import { TypographyText } from '@/components/Typography';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const featPose = require('@/assets/images/design/tv-feat-pose.jpg');
const featTryon = require('@/assets/images/design/tv-feat-tryon.jpg');
const featStylist = require('@/assets/images/design/tv-feat-stylist.jpg');
const featStore = require('@/assets/images/design/tv-feat-store.jpg');
const featSaved = require('@/assets/images/design/tv-feat-saved.jpg');
const featVideo = require('@/assets/images/design/tv-feat-video.jpg');

type Feature = {
  to: string;
  title: string;
  desc: string;
  image: any;
  tag: string;
};

const features: Feature[] = [
  { to: "/pose-studio", title: "Pose Studio", desc: "Turn outfit photos into polished poses.", image: featPose, tag: "Featured" },
  { to: "/(tabs)/try-on", title: "Virtual Try-On", desc: "See clothes on yourself before checkout.", image: featTryon, tag: "Popular" },
  { to: "/(tabs)/stylo", title: "AI Stylist", desc: "Get outfit advice and color tips.", image: featStylist, tag: "Ask Stylo" },
  { to: "/(tabs)/store", title: "AI Fashion Store", desc: "Browse outfits and try them instantly.", image: featStore, tag: "Shop" },
  { to: "/(tabs)/saved", title: "Saved Looks", desc: "Save and compare your favorite outfits.", image: featSaved, tag: "Library" },
  { to: "/video-studio", title: "Showcase Video", desc: "Create short outfit videos to share.", image: featVideo, tag: "Reels" },
];

const ideas = [
  { to: "/(tabs)/try-on", title: "Try a Summer Look", desc: "Upload your photo and try a light outfit." },
  { to: "/(tabs)/stylo", title: "Find Your Color Palette", desc: "Ask Stylo which colors suit you best." },
  { to: "/(tabs)/saved", title: "Save Your First Look", desc: "Compare outfits before you buy." },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Screen safeArea withBottomNav>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TryVerseLogo height={30} width={120} />
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
              <View style={styles.dotBadge} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatar}>
              <Text style={styles.avatarText}>HK</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.section}>
          <Text style={styles.greetingSub}>Welcome back,</Text>
          <View style={styles.greetingMainContainer}>
            <LinearGradient colors={['#c084fc', '#a855f7', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientMask}>
              <TypographyText variant="h1" style={styles.greetingMain}>Hussnain</TypographyText>
            </LinearGradient>
          </View>
          <Text style={styles.greetingDesc}>What would you like to try today?</Text>
          <TouchableOpacity onPress={() => router.push('/credits')} style={styles.creditPill}>
            <View style={styles.creditDot} />
            <Text style={styles.creditText}>Pro · 182 credits</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy card */}
        <View style={styles.section}>
          <View style={styles.privacyCard}>
            <View style={styles.privacyIcon}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
            </View>
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>Your privacy is protected</Text>
              <Text style={styles.privacyDesc}>Uploads and generated results are deleted after your session.</Text>
            </View>
          </View>
        </View>

        {/* Feature cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TypographyText variant="h3" style={styles.sectionTitle}>Explore</TypographyText>
            <Text style={styles.sectionCount}>6 features</Text>
          </View>
          <View style={styles.featGrid}>
            {features.map((f, i) => (
              <TouchableOpacity key={f.to} style={styles.featCard} onPress={() => router.push(f.to as any)}>
                <View style={styles.featMedia}>
                  <Image source={f.image} style={styles.featImg} />
                  <View style={styles.featTag}>
                    <Text style={styles.featTagText}>{f.tag}</Text>
                  </View>
                </View>
                <View style={styles.featBody}>
                  <Text style={styles.featTitle}>{f.title}</Text>
                  <Text style={styles.featDesc}>{f.desc}</Text>
                </View>
                <View style={styles.featArrow}>
                  <Ionicons name="arrow-forward" size={12} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ideas */}
        <View style={styles.section}>
          <TypographyText variant="h3" style={styles.sectionTitle}>Ideas to try</TypographyText>
          <View style={styles.ideasContainer}>
            {ideas.map((it) => (
              <TouchableOpacity key={it.title} style={styles.ideaCard} onPress={() => router.push(it.to as any)}>
                <View style={styles.ideaIcon}>
                  <Ionicons name="sparkles-outline" size={16} color="#fff" />
                </View>
                <View style={styles.ideaContent}>
                  <Text style={styles.ideaTitle} numberOfLines={1}>{it.title}</Text>
                  <Text style={styles.ideaDesc}>{it.desc}</Text>
                </View>
                <Text style={styles.ideaCta}>Start →</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <StyloFloatingAssistant />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dotBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#c084fc', borderWidth: 1, borderColor: '#1a0730' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontFamily: 'ClashDisplay-Semibold' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  greetingSub: { fontSize: 11, fontFamily: 'Montserrat_500Medium', textTransform: 'uppercase', letterSpacing: 2.4, color: 'rgba(196, 181, 253, 0.7)' },
  greetingMainContainer: { marginTop: 4 },
  gradientMask: { borderRadius: 4 },
  greetingMain: { fontSize: 26, color: '#fff', opacity: 0.9, marginBottom: 0 },
  greetingDesc: { fontSize: 12.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  creditPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 12 },
  creditDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#c084fc' },
  creditText: { fontSize: 11, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  privacyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  privacyIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(124,58,237,0.2)', alignItems: 'center', justifyContent: 'center' },
  privacyContent: { flex: 1 },
  privacyTitle: { fontSize: 11.5, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  privacyDesc: { fontSize: 10.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { fontSize: 16, color: '#fff', marginBottom: 0 },
  sectionCount: { fontSize: 10.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.45)' },
  featGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  featCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 10 },
  featMedia: { width: '100%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 10 },
  featImg: { width: '100%', height: '100%' },
  featTag: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(10,4,20,0.65)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  featTagText: { fontSize: 8.5, fontFamily: 'Montserrat_500Medium', color: '#f5f3ff', letterSpacing: 0.4, textTransform: 'uppercase' },
  featBody: { flex: 1 },
  featTitle: { fontSize: 12, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
  featDesc: { fontSize: 10, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  featArrow: { position: 'absolute', bottom: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  ideasContainer: { gap: 8, marginTop: 12 },
  ideaCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  ideaIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  ideaContent: { flex: 1 },
  ideaTitle: { fontSize: 12.5, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  ideaDesc: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  ideaCta: { fontSize: 11, fontFamily: 'Montserrat_500Medium', color: 'rgba(196, 181, 253, 0.9)' },
});