import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const blazerImg = require('@/assets/images/design/tv-blazer-lavender.jpg');
const topImg = require('@/assets/images/design/tv-top.jpg');
const trousersImg = require('@/assets/images/design/tv-trousers.jpg');

type P = { name: string; price: number; category: string; image?: any; tint: string[] };

const CATALOG: Record<string, P> = {
  "lavender-blazer": { name: "Lavender Oversized Blazer", price: 88, category: "Blazer", image: blazerImg, tint: ['#b48cff', '#6d3bff'] },
  "cream-knit-sweater": { name: "Cream Knit Sweater", price: 64, category: "Sweater", image: topImg, tint: ['#e9d9c4', '#b39a7a'] },
  "pink-satin-dress": { name: "Pink Satin Dress", price: 98, category: "Dress", tint: ['#ffb3d1', '#c93bff'] },
  "white-linen-shirt": { name: "White Linen Shirt", price: 54, category: "Shirt", tint: ['#f4f0e6', '#c9c2b0'] },
  "black-cropped-jacket": { name: "Black Cropped Jacket", price: 92, category: "Jacket", tint: ['#2a2233', '#0a0812'] },
  "olive-wide-pants": { name: "Olive Wide-Leg Pants", price: 76, category: "Pants", image: trousersImg, tint: ['#7a8355', '#3d4426'] },
};

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = [
  { name: "Lavender", hex: "#b48cff" },
  { name: "Cream", hex: "#e9d9c4" },
  { name: "Black", hex: "#1a1520" },
];

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const p = CATALOG[id as string] ?? CATALOG["lavender-blazer"];
  const [size, setSize] = useState("M");
  const [color, setColor] = useState(COLORS[0].name);
  const [saved, setSaved] = useState(false);

  return (
    <Screen safeArea>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TryVerseLogo height={26} width={100} />
          <TouchableOpacity 
            onPress={() => setSaved(!saved)} 
            style={[styles.iconBtn, saved && styles.iconBtnActive]}
          >
            <Ionicons name={saved ? "heart" : "heart-outline"} size={20} color={saved ? "#fff" : "#fff"} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.heroContainer}>
            <LinearGradient colors={p.tint as [string, string]} style={StyleSheet.absoluteFill} />
            {p.image && <Image source={p.image} style={styles.heroImg} />}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.cat}>{p.category}</Text>
          <Text style={styles.title}>{p.name}</Text>
          <Text style={styles.price}>${p.price}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {SIZES.map((s) => (
              <TouchableOpacity 
                key={s} 
                onPress={() => setSize(s)} 
                style={[styles.sizeChip, size === s && styles.sizeChipActive]}
              >
                <Text style={[styles.sizeText, size === s && styles.sizeTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {COLORS.map((c) => (
              <TouchableOpacity 
                key={c.name} 
                onPress={() => setColor(c.name)} 
                style={[styles.colorChip, { backgroundColor: c.hex }, color === c.name && styles.colorChipActive]}
              />
            ))}
          </ScrollView>
        </View>

        <View style={[styles.section, { gap: 10, marginTop: 30 }]}>
          <TouchableOpacity style={styles.cta} onPress={() => router.push('/try-on')}>
            <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
              <Text style={styles.ctaText}>Try On</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaSecondary} onPress={() => setSaved(!saved)}>
            <Text style={styles.ctaSecondaryText}>{saved ? "Saved" : "Save item"}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  iconBtnActive: { backgroundColor: '#c084fc', borderColor: '#d946ef' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  heroContainer: { width: '100%', height: 420, borderRadius: 24, overflow: 'hidden', position: 'relative' },
  heroImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cat: { fontSize: 11, textTransform: 'uppercase', fontFamily: 'Montserrat_600SemiBold', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  title: { fontSize: 22, color: '#fff', fontFamily: 'ClashDisplay-Semibold', marginTop: 4 },
  price: { fontSize: 20, color: '#d8b4fe', fontFamily: 'ClashDisplay-Semibold', marginTop: 8 },
  sectionTitle: { fontSize: 14, color: '#fff', fontFamily: 'Montserrat_600SemiBold', marginBottom: 8 },
  chipRow: { gap: 10, paddingVertical: 4 },
  sizeChip: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  sizeChipActive: { backgroundColor: 'rgba(124,58,237,0.4)', borderColor: 'rgba(216,180,254,0.5)' },
  sizeText: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontFamily: 'Montserrat_500Medium' },
  sizeTextActive: { color: '#fff' },
  colorChip: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorChipActive: { borderColor: '#fff' },
  cta: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  ctaGradient: { height: 48, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat_500Medium' },
  ctaSecondary: { height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  ctaSecondaryText: { color: 'rgba(255,255,255,0.85)', fontSize: 13.5, fontFamily: 'Montserrat_500Medium' }
});