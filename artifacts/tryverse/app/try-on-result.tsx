import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Typography } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TryOnResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [saving, setSaving] = useState(false);

  const photo = params.photo as string || Image.resolveAssetSource(require('@/assets/images/design/tv-user.jpg')).uri;
  const resultImg = require('@/assets/images/design/tv-result.jpg');
  const outfitImg = require('@/assets/images/design/tv-blazer-lavender.jpg');

  const handleSave = () => {
    if (saving) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Saved', 'Look saved successfully!');
      router.push('/(tabs)/saved');
    }, 500);
  };

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>HK</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <TypographyText variant="h1" style={styles.title}>Your <Text style={{ color: '#c084fc' }}>Try-On Result</Text></TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Here's how the outfit looks on you.</TypographyText>
        </View>

        <View style={styles.miniCards}>
          <View style={styles.miniCard}>
            <Image source={{ uri: photo }} style={styles.miniImg} />
            <View style={styles.miniLabel}><Text style={styles.miniLabelText}>Your Photo</Text></View>
          </View>
          <View style={styles.miniCard}>
            <LinearGradient colors={['#b48cff', '#6d3bff']} style={styles.miniImg}>
              <Image source={outfitImg} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
            </LinearGradient>
            <View style={styles.miniLabel}><Text style={styles.miniLabelText}>Outfit</Text></View>
          </View>
        </View>

        <View style={styles.resultCard}>
          <Image source={resultImg} style={styles.resultImg} />
          <View style={styles.resultBadge}>
            <Ionicons name="sparkles" size={12} color="#fff" />
            <Text style={styles.resultBadgeText}>Try-On Result</Text>
          </View>
        </View>

        <GlassCard style={styles.detailsCard}>
          <TypographyText variant="bodySemibold" style={styles.cardTitle}>Outfit Details</TypographyText>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Outfit</Text><Text style={styles.detailValue}>Lavender Oversized Blazer</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Size</Text><Text style={styles.detailValue}>M</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Fit</Text><Text style={styles.detailValue}>Regular fit recommended</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Color</Text><Text style={styles.detailValue}>Lavender</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Store</Text><Text style={styles.detailValue}>TryVerse Store</Text></View>
        </GlassCard>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.primaryBtnText}>{saving ? "Saving…" : "Save Look"}</Text>
          </TouchableOpacity>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/try-on')}><Text style={styles.secondaryBtnText}>Try Another</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/stylo')}><Text style={styles.secondaryBtnText}>Ask Stylo</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/store')}><Text style={styles.secondaryBtnText}>Shop Similar</Text></TouchableOpacity>
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
  miniCards: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 10 },
  miniCard: { flex: 1, height: 140, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  miniImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  miniLabel: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  miniLabelText: { color: '#fff', fontSize: 9, fontFamily: Typography.bodyMedium.fontFamily, textTransform: 'uppercase' },
  resultCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 24, overflow: 'hidden', aspectRatio: 3/4, borderWidth: 1, borderColor: 'rgba(216,180,254,0.35)', shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 20 },
  resultImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  resultBadge: { position: 'absolute', bottom: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultBadgeText: { color: '#fff', fontSize: 12, fontFamily: Typography.bodyMedium.fontFamily },
  detailsCard: { marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)' },
  cardTitle: { color: '#fff', fontSize: 14, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  detailLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  detailValue: { color: '#fff', fontSize: 12 },
  actions: { paddingHorizontal: 20, marginTop: 24, gap: 12 },
  primaryBtn: { backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  actionGrid: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily }
});