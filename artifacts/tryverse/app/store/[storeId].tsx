import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const NAMES: Record<string, string> = {
  "12th-tribe": "12th Tribe",
  "frank-and-oak": "Frank And Oak",
  "meshki": "Meshki",
  "zara": "Zara",
};

const cats = ["All", "Women", "Men"];

const tints = [
  ['#b48cff', '#6d3bff'],
  ['#ffb3d1', '#c93bff'],
  ['#e9d9c4', '#b39a7a'],
  ['#3b6bff', '#7a3bff'],
  ['#2a2233', '#0a0812'],
  ['#7a8355', '#3d4426'],
];

export default function StoreDetailScreen() {
  const router = useRouter();
  const { storeId } = useLocalSearchParams();
  const [cat, setCat] = useState("All");
  const name = NAMES[storeId as string] ?? "Store";

  return (
    <Screen safeArea withBottomNav>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TryVerseLogo height={26} width={100} />
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.headingMain}>{name}</Text>
          <Text style={styles.headingDesc}>19 products available for virtual try-on.</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.searchInput}>Search {name}...</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {cats.map((c) => (
            <TouchableOpacity 
              key={c} 
              onPress={() => setCat(c)} 
              style={[styles.chip, cat === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, cat === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.prodGrid}>
            {tints.map((t, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.prodCard}
                onPress={() => router.push(`/store/product/lavender-blazer`)}
              >
                <View style={styles.prodMedia}>
                  <LinearGradient colors={t as [string, string]} style={StyleSheet.absoluteFill} />
                </View>
                <View style={styles.prodBody}>
                  <Text style={styles.prodCat}>Look {i + 1}</Text>
                  <Text style={styles.prodName} numberOfLines={1}>Curated outfit</Text>
                  <View style={styles.prodRow}>
                    <Text style={styles.prodPrice}>${60 + i * 8}</Text>
                    <View style={styles.tryBtn}>
                      <Text style={styles.tryBtnText}>View</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.cta} onPress={() => router.push('/try-on')}>
            <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
              <Text style={styles.ctaText}>Start Try-On</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  headingMain: { fontSize: 24, color: '#c084fc', fontFamily: 'ClashDisplay-Semibold' },
  headingDesc: { fontSize: 12.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  searchSection: { paddingHorizontal: 20, marginTop: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchInput: { flex: 1, marginLeft: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Montserrat_400Regular' },
  chipRow: { paddingHorizontal: 20, marginTop: 16, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  chipActive: { backgroundColor: 'rgba(124,58,237,0.4)', borderColor: 'rgba(216,180,254,0.5)' },
  chipText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'Montserrat_500Medium' },
  chipTextActive: { color: '#fff' },
  prodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  prodCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  prodMedia: { width: '100%', aspectRatio: 3/4, position: 'relative' },
  prodBody: { padding: 10 },
  prodCat: { fontSize: 9, textTransform: 'uppercase', fontFamily: 'Montserrat_600SemiBold', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 },
  prodName: { fontSize: 12, fontFamily: 'Montserrat_500Medium', color: '#fff', marginTop: 4 },
  prodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  prodPrice: { fontSize: 13, fontFamily: 'ClashDisplay-Semibold', color: '#d8b4fe' },
  tryBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tryBtnText: { fontSize: 10, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
  cta: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  ctaGradient: { height: 48, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat_500Medium' }
});