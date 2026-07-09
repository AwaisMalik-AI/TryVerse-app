import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const usage = [
  { label: "Virtual Try-On", value: 24 },
  { label: "AI Fashion Store", value: 18 },
  { label: "Pose Studio", value: 12 },
  { label: "Showcase Video", value: 30 },
  { label: "AI Stylist", value: 5 },
];

const packs = [
  { credits: 250, price: 50, badge: null },
  { credits: 500, price: 85, badge: "Best Value" },
  { credits: 1000, price: 150, badge: null },
];

export default function CreditsScreen() {
  const router = useRouter();
  const remaining = 182;
  const total = 200;
  const pct = Math.round((remaining / total) * 100);

  return (
    <Screen safeArea withBottomNav>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credits</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.section}>
          <View style={styles.heroCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={styles.heroSub}>TryVerse Pro</Text>
                <Text style={styles.heroTitle}><Text style={styles.gradText}>{remaining}</Text> credits</Text>
                <Text style={styles.heroDesc}>remaining this month</Text>
              </View>
              <View style={styles.proAvatar}>
                <Text style={styles.proAvatarText}>Pro</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.progressText}>{remaining} / {total}</Text>
                <Text style={styles.progressText}>{total} credits/month</Text>
              </View>
              <View style={styles.progressBarBg}>
                <LinearGradient colors={['#7a3bff', '#c93bff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressBarFill, { width: `${pct}%` }]} />
              </View>
            </View>

            <View style={styles.featuresGrid}>
              {["Watermark-free results","Priority generation","HD downloads","Saved looks"].map((b) => (
                <View key={b} style={styles.featureItem}>
                  <LinearGradient colors={['#7a3bff', '#c93bff']} style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.featureText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credit usage</Text>
          <View style={styles.usageList}>
            {usage.map((u) => (
              <View key={u.label} style={styles.usageItem}>
                <Text style={styles.usageLabel}>{u.label}</Text>
                <Text style={styles.usageValue}>{u.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Packs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buy more credits</Text>
          <View style={styles.packsList}>
            {packs.map((p) => (
              <View key={p.credits} style={styles.packCard}>
                <View style={styles.packIcon}>
                  <Ionicons name="flash" size={16} color="#fff" />
                </View>
                <View style={styles.packInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.packCredits}>{p.credits} credits</Text>
                    {p.badge && <View style={styles.badge}><Text style={styles.badgeText}>{p.badge}</Text></View>}
                  </View>
                  <Text style={styles.packPrice}>${p.price} one-time</Text>
                </View>
                <TouchableOpacity style={styles.buyBtn} onPress={() => {}}>
                  <LinearGradient colors={['#7a3bff', '#c93bff']} style={StyleSheet.absoluteFillObject} />
                  <Text style={styles.buyBtnText}>Buy Pack</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.cta} onPress={() => {}}>
            <Text style={styles.ctaText}>Buy More Credits</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>Credits never expire on Pro plan.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff', marginBottom: 12 },
  heroCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  heroSub: { fontSize: 10.5, fontFamily: 'Montserrat_600SemiBold', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: 2 },
  heroTitle: { fontSize: 26, fontFamily: 'ClashDisplay-Semibold', color: '#fff', marginTop: 4 },
  gradText: { color: '#c084fc' },
  heroDesc: { fontSize: 11.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  proAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 1, borderColor: '#c084fc', alignItems: 'center', justifyContent: 'center' },
  proAvatarText: { fontSize: 13, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
  progressContainer: { marginTop: 20 },
  progressText: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)' },
  progressBarBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, gap: 10 },
  featureItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkCircle: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.8)' },
  usageList: { gap: 6 },
  usageItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 16, height: 48, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  usageLabel: { fontSize: 12.5, fontFamily: 'Montserrat_500Medium', color: 'rgba(255,255,255,0.9)' },
  usageValue: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.7)' },
  packsList: { gap: 8 },
  packCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  packIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(124,58,237,0.2)', alignItems: 'center', justifyContent: 'center' },
  packInfo: { flex: 1, marginLeft: 12 },
  packCredits: { fontSize: 13, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
  badge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  badgeText: { fontSize: 9.5, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  packPrice: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  buyBtn: { paddingHorizontal: 16, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  buyBtnText: { fontSize: 12, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
  cta: { marginTop: 20, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  ctaText: { fontSize: 14, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  footerNote: { fontSize: 10.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 12 }
});