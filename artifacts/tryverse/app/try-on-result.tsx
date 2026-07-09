import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Typography } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { tvActions } from '@/lib/local-store';
import { useAuth } from '@/lib/auth';

function initialsFromName(name?: string | null): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

export default function TryOnResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const resultUrl = (params.resultUrl as string) || '';
  const sourcePhoto = (params.sourcePhoto as string) || '';
  const outfitName = (params.outfitName as string) || '';
  const outfitImage = (params.outfitImage as string) || '';
  const aiFeedback = (params.aiFeedback as string) || '';
  const storeName = (params.storeName as string) || '';
  const price = (params.price as string) || '';
  const sourceLink = (params.sourceLink as string) || '';

  const initials = initialsFromName(user?.full_name);

  const details: { label: string; value: string }[] = [];
  if (outfitName) details.push({ label: 'Outfit', value: outfitName });
  if (price) details.push({ label: 'Price', value: price });
  if (storeName) details.push({ label: 'Store', value: storeName });

  const handleSave = () => {
    if (saving || saved || !resultUrl) return;
    setSaving(true);
    tvActions.saveLook({
      outfit: {
        slug: `tryon-${Date.now()}`,
        name: outfitName || 'Try-On Look',
        image: outfitImage ? { uri: outfitImage } : undefined,
        tint: '#a855f7',
        price: price || undefined,
        store: storeName || undefined,
      },
      photo: sourcePhoto ? { uri: sourcePhoto } : null,
      result: { uri: resultUrl },
      size: '',
      fitNote: aiFeedback || '',
      tag: 'try-on',
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push('/(tabs)/saved'), 900);
  };

  if (!resultUrl) {
    return (
      <Screen safeArea withBottomNav>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={40} color="rgba(255,255,255,0.4)" />
          <TypographyText variant="bodySemibold" style={styles.emptyTitle}>No result yet</TypographyText>
          <TypographyText variant="small" style={styles.emptySubtitle}>Generate a try-on to see your result here.</TypographyText>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(tabs)/try-on')}>
            <Text style={styles.primaryBtnText}>Go to Try-On</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          {initials ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          ) : (
            <View style={[styles.avatar, styles.avatarGeneric]}>
              <Ionicons name="person" size={16} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.titleSection}>
          <TypographyText variant="h1" style={styles.title}>Your <Text style={{ color: '#c084fc' }}>Try-On Result</Text></TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Here's how the outfit looks on you.</TypographyText>
        </View>

        {(sourcePhoto || outfitImage) && (
          <View style={styles.miniCards}>
            {sourcePhoto ? (
              <View style={styles.miniCard}>
                <Image source={{ uri: sourcePhoto }} style={styles.miniImg} />
                <View style={styles.miniLabel}><Text style={styles.miniLabelText}>Your Photo</Text></View>
              </View>
            ) : null}
            {outfitImage ? (
              <View style={styles.miniCard}>
                <Image source={{ uri: outfitImage }} style={styles.miniImg} />
                <View style={styles.miniLabel}><Text style={styles.miniLabelText}>Outfit</Text></View>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.resultCard}>
          <Image source={{ uri: resultUrl }} style={styles.resultImg} />
          <View style={styles.resultBadge}>
            <Ionicons name="sparkles" size={12} color="#fff" />
            <Text style={styles.resultBadgeText}>Try-On Result</Text>
          </View>
        </View>

        {details.length > 0 && (
          <GlassCard style={styles.detailsCard}>
            <TypographyText variant="bodySemibold" style={styles.cardTitle}>Outfit Details</TypographyText>
            {details.map((d) => (
              <View key={d.label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text style={styles.detailValue}>{d.value}</Text>
              </View>
            ))}
          </GlassCard>
        )}

        {aiFeedback ? (
          <GlassCard style={styles.detailsCard}>
            <TypographyText variant="bodySemibold" style={styles.cardTitle}>Stylist Feedback</TypographyText>
            <Text style={styles.feedbackText}>{aiFeedback}</Text>
          </GlassCard>
        ) : null}

        <View style={styles.actions}>
          {saved ? (
            <View style={[styles.primaryBtn, styles.savedBtn]}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Saved</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.primaryBtnText}>Save Look</Text>}
            </TouchableOpacity>
          )}
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
  avatarGeneric: { backgroundColor: 'rgba(255,255,255,0.12)' },
  avatarText: { color: '#fff', fontSize: 12, fontFamily: Typography.heading.fontFamily },
  titleSection: { paddingHorizontal: 20, marginTop: 20 },
  title: { fontSize: 24, color: '#fff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  miniCards: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 10 },
  miniCard: { flex: 1, height: 140, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  miniImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  miniLabel: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  miniLabelText: { color: '#fff', fontSize: 9, fontFamily: Typography.bodyMedium.fontFamily, textTransform: 'uppercase' },
  resultCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 24, overflow: 'hidden', aspectRatio: 3 / 4, borderWidth: 1, borderColor: 'rgba(216,180,254,0.35)', shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)' },
  resultImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  resultBadge: { position: 'absolute', bottom: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultBadgeText: { color: '#fff', fontSize: 12, fontFamily: Typography.bodyMedium.fontFamily },
  detailsCard: { marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)' },
  cardTitle: { color: '#fff', fontSize: 14, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  detailLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  detailValue: { color: '#fff', fontSize: 12, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  feedbackText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 18 },
  actions: { paddingHorizontal: 20, marginTop: 24, gap: 12 },
  primaryBtn: { backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  savedBtn: { backgroundColor: 'rgba(34,197,94,0.85)' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  actionGrid: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 8, marginTop: 80 },
  emptyTitle: { color: '#fff', fontSize: 16, marginTop: 8 },
  emptySubtitle: { color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
});
