import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const PACKS = [
  { id: "starter", name: "Starter", credits: 250, price: 50, desc: "Best for casual try-ons", badge: null },
  { id: "plus", name: "Plus", credits: 500, price: 85, desc: "Best for regular styling", badge: "Best Value" },
  { id: "pro", name: "Pro Boost", credits: 1000, price: 150, desc: "Best for creators and heavy users", badge: null },
  { id: "mini", name: "Mini Pack", credits: 100, price: 25, desc: "Quick top-up", badge: null },
];

const USAGE = [
  { label: "Virtual Try-On", value: "5 credits" },
  { label: "Pose Studio", value: "8 credits" },
  { label: "Showcase Video", value: "15 credits" },
  { label: "AI Stylist", value: "1 credit" },
  { label: "HD Download", value: "3 credits" },
];

export default function PricingScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState("plus");

  const handleChoose = (id: string) => {
    setSelected(id);
    router.push({ pathname: '/pricing/checkout', params: { packId: id } });
  };

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.iconBtn}><Ionicons name="notifications-outline" size={24} color="#fff" /></TouchableOpacity>
            <TouchableOpacity style={styles.avatar}><Text style={styles.avatarText}>HK</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleSection}>
          <TypographyText variant="h1" style={styles.title}>Buy <Text style={{ color: '#c084fc' }}>Credits</Text></TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Generate more try-ons, poses, videos, and AI styling results.</TypographyText>
        </View>

        <View style={styles.balanceCard}>
          <LinearGradient colors={['#7a3bff', '#c93bff']} style={styles.balanceIcon}>
            <Ionicons name="flash" size={16} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>182 credits remaining</Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>Pro plan · Refills each month</Text>
          </View>
        </View>

        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <Text style={styles.sectionTitle}>Credit packs</Text>
          <View style={{ gap: 8 }}>
            {PACKS.map(p => {
              const isSel = selected === p.id;
              return (
                <TouchableOpacity 
                  key={p.id} 
                  style={[styles.packCard, isSel && styles.packCardActive]}
                  onPress={() => setSelected(p.id)}
                >
                  <LinearGradient colors={['#7a3bff', '#c93bff']} style={styles.balanceIcon}>
                    <Ionicons name="flash" size={16} color="#fff" />
                  </LinearGradient>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{p.name}</Text>
                      {p.badge && <View style={styles.badge}><Text style={styles.badgeText}>{p.badge}</Text></View>}
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 }}>{p.credits} credits · ${p.price}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 }}>{p.desc}</Text>
                  </View>
                  <TouchableOpacity style={[styles.chooseBtn, isSel && styles.chooseBtnActive]} onPress={() => handleChoose(p.id)}>
                    <Text style={[styles.chooseBtnText, isSel && { color: '#fff' }]}>Choose Pack</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={{ marginHorizontal: 20, marginTop: 32 }}>
          <Text style={styles.sectionTitle}>How credits are used</Text>
          <View style={{ gap: 6 }}>
            {USAGE.map(u => (
              <View key={u.label} style={styles.usageRow}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' }}>{u.label}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{u.value}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 12, fontFamily: Typography.heading.fontFamily },
  titleSection: { paddingHorizontal: 20, marginTop: 20 },
  title: { fontSize: 24, color: '#fff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  balanceCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 20, padding: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  balanceIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sectionTitle: { color: '#fff', fontSize: 16, fontFamily: Typography.heading.fontFamily, marginBottom: 12 },
  packCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  packCardActive: { borderColor: 'rgba(148,88,255,0.7)', backgroundColor: 'rgba(148,88,255,0.1)' },
  badge: { backgroundColor: 'rgba(148,88,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(148,88,255,0.4)' },
  badgeText: { color: '#d946ef', fontSize: 9, fontWeight: 'bold' },
  chooseBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)' },
  chooseBtnActive: { backgroundColor: Colors.primary },
  chooseBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
});