import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { TypographyText } from '@/components/Typography';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const blazerImg = require('@/assets/images/design/tv-blazer-lavender.jpg');
const topImg = require('@/assets/images/design/tv-top.jpg');
const trousersImg = require('@/assets/images/design/tv-trousers.jpg');

const categories = ["All", "Dresses", "Blazers", "Shirts", "Jackets", "Hoodies", "Pants"];

const stores = [
  { slug: "12th-tribe", name: "12th Tribe", count: 19, tint: ['#7a3bff', '#c93bff'] },
  { slug: "frank-and-oak", name: "Frank And Oak", count: 24, tint: ['#3b6bff', '#7a3bff'] },
  { slug: "meshki", name: "Meshki", count: 16, tint: ['#ff3b8a', '#c93bff'] },
  { slug: "zara", name: "Zara", count: 32, tint: ['#c93bff', '#ff8a3b'] },
];

const products = [
  { slug: "lavender-blazer", name: "Lavender Oversized Blazer", price: 88, category: "Blazer", image: blazerImg, tint: ['#b48cff', '#6d3bff'] },
  { slug: "cream-knit-sweater", name: "Cream Knit Sweater", price: 64, category: "Sweater", image: topImg, tint: ['#e9d9c4', '#b39a7a'] },
  { slug: "pink-satin-dress", name: "Pink Satin Dress", price: 98, category: "Dress", tint: ['#ffb3d1', '#c93bff'] },
  { slug: "white-linen-shirt", name: "White Linen Shirt", price: 54, category: "Shirt", tint: ['#f4f0e6', '#c9c2b0'] },
  { slug: "black-cropped-jacket", name: "Black Cropped Jacket", price: 92, category: "Jacket", tint: ['#2a2233', '#0a0812'] },
  { slug: "olive-wide-pants", name: "Olive Wide-Leg Pants", price: 76, category: "Pants", image: trousersImg, tint: ['#7a8355', '#3d4426'] },
];

export default function StoreScreen() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState("All");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const visible = activeCat === "All"
    ? products
    : products.filter((p) => p.category.toLowerCase() === activeCat.slice(0, -1).toLowerCase() || p.category.toLowerCase() + "s" === activeCat.toLowerCase());

  return (
    <Screen safeArea withBottomNav>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TryVerseLogo height={30} width={120} />
          </View>
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

        {/* Heading */}
        <View style={styles.section}>
          <Text style={styles.headingMain}>Explore <Text style={styles.gradText}>Fashion Stores</Text></Text>
          <Text style={styles.headingDesc}>Browse clothing from curated stores and try outfits on yourself instantly.</Text>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput 
              placeholder="Search dresses, blazers, shirts..." 
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {categories.map((c) => (
            <TouchableOpacity 
              key={c} 
              onPress={() => setActiveCat(c)} 
              style={[styles.chip, activeCat === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeCat === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured stores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TypographyText variant="subheading" style={styles.sectionTitle}>Featured Stores</TypographyText>
            <Text style={styles.sectionCount}>{stores.length} stores</Text>
          </View>
          <View style={styles.storeList}>
            {stores.map((s) => (
              <TouchableOpacity key={s.slug} style={styles.storeCard} onPress={() => router.push(`/store/${s.slug}` as any)}>
                <View style={styles.storeThumbs}>
                  <LinearGradient colors={s.tint as [string, string]} style={[styles.storeThumb, { zIndex: 3 }]} />
                  <LinearGradient colors={s.tint as [string, string]} style={[styles.storeThumb, { zIndex: 2, marginLeft: -12, opacity: 0.8 }]} />
                  <LinearGradient colors={s.tint as [string, string]} style={[styles.storeThumb, { zIndex: 1, marginLeft: -12, opacity: 0.6 }]} />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.storeCount}>{s.count} products</Text>
                </View>
                <View style={styles.arrowIcon}>
                  <Ionicons name="chevron-forward" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending outfits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TypographyText variant="subheading" style={styles.sectionTitle}>Trending Outfits</TypographyText>
            <Text style={styles.sectionCount}>{visible.length} looks</Text>
          </View>
          <View style={styles.prodGrid}>
            {visible.map((p) => (
              <View key={p.slug} style={styles.prodCard}>
                <TouchableOpacity 
                  style={styles.prodMedia} 
                  onPress={() => router.push(`/store/product/${p.slug}` as any)}
                  activeOpacity={0.9}
                >
                  <LinearGradient colors={p.tint as [string, string]} style={StyleSheet.absoluteFill} />
                  {p.image && <Image source={p.image} style={styles.prodImg} />}
                  <TouchableOpacity 
                    style={[styles.heartBtn, saved[p.slug] && styles.heartBtnActive]} 
                    onPress={() => setSaved(s => ({ ...s, [p.slug]: !s[p.slug] }))}
                  >
                    <Ionicons name={saved[p.slug] ? "heart" : "heart-outline"} size={14} color={saved[p.slug] ? "#fff" : "rgba(255,255,255,0.7)"} />
                  </TouchableOpacity>
                </TouchableOpacity>
                <View style={styles.prodBody}>
                  <Text style={styles.prodCat}>{p.category}</Text>
                  <Text style={styles.prodName} numberOfLines={1}>{p.name}</Text>
                  <View style={styles.prodRow}>
                    <Text style={styles.prodPrice}>${p.price}</Text>
                    <TouchableOpacity onPress={() => router.push('/try-on')} style={styles.tryBtn}>
                      <Text style={styles.tryBtnText}>Try On</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dotBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#c084fc', borderWidth: 1, borderColor: '#1a0730' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontFamily: 'ClashDisplay-Semibold' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  headingMain: { fontSize: 24, color: '#fff', fontFamily: 'ClashDisplay-Semibold' },
  gradText: { color: '#c084fc' }, // simplified gradient text for RN
  headingDesc: { fontSize: 12.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  searchSection: { paddingHorizontal: 20, marginTop: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 13, fontFamily: 'Montserrat_400Regular' },
  chipRow: { paddingHorizontal: 20, marginTop: 16, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  chipActive: { backgroundColor: 'rgba(124,58,237,0.4)', borderColor: 'rgba(216,180,254,0.5)' },
  chipText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'Montserrat_500Medium' },
  chipTextActive: { color: '#fff' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, color: '#fff' },
  sectionCount: { fontSize: 10.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.45)' },
  storeList: { gap: 10, marginTop: 12 },
  storeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  storeThumbs: { flexDirection: 'row', width: 64 },
  storeThumb: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#11071c' },
  storeInfo: { flex: 1, marginLeft: 8 },
  storeName: { fontSize: 14, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
  storeCount: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  arrowIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  prodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  prodCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  prodMedia: { width: '100%', aspectRatio: 3/4, position: 'relative' },
  prodImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  heartBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(10,4,20,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heartBtnActive: { backgroundColor: '#c084fc', borderColor: '#d946ef' },
  prodBody: { padding: 10 },
  prodCat: { fontSize: 9, textTransform: 'uppercase', fontFamily: 'Montserrat_600SemiBold', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 },
  prodName: { fontSize: 12, fontFamily: 'Montserrat_500Medium', color: '#fff', marginTop: 4 },
  prodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  prodPrice: { fontSize: 13, fontFamily: 'ClashDisplay-Semibold', color: '#d8b4fe' },
  tryBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tryBtnText: { fontSize: 10, fontFamily: 'Montserrat_600SemiBold', color: '#fff' }
});