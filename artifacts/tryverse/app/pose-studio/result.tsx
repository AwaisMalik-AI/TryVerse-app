import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Typography } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PoseResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [saving, setSaving] = useState(false);

  const photo = params.photo as string || Image.resolveAssetSource(require('@/assets/images/design/tv-user.jpg')).uri;
  
  const poses = [
    { slug: "white-studio", name: "White Studio", tint: ['#f0f0f0', '#c0c0c0'], image: require('@/assets/images/poses-new/catalog-white.jpg') },
    { slug: "executive-walk", name: "Executive Walk", tint: ['#8cbcff', '#3b5dff'], image: require('@/assets/images/poses-new/pro-walk.jpg') },
  ];

  const handleSaveAll = () => {
    if (saving) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Saved', 'Pose results saved!');
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
          <TypographyText variant="h1" style={styles.title}>Your <Text style={{ color: '#c084fc' }}>Pose Results</Text></TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Here are your polished pose variations.</TypographyText>
        </View>

        <GlassCard style={styles.card}>
          <TypographyText variant="bodySemibold" style={styles.cardTitle}>Original Photo</TypographyText>
          <View style={styles.previewArea}>
            <Image source={{ uri: photo }} style={styles.previewImage} />
          </View>
        </GlassCard>

        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <TypographyText variant="bodySemibold" style={styles.cardTitle}>Pose Variations</TypographyText>
          <View style={styles.poseGrid}>
            {poses.map((pose) => (
              <View key={pose.slug} style={styles.poseCard}>
                <LinearGradient colors={pose.tint as [string, string]} style={styles.poseMedia}>
                  <Image source={pose.image} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                </LinearGradient>
                <Text style={styles.poseName}>{pose.name}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="download-outline" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="heart-outline" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveAll} disabled={saving}>
            <Text style={styles.primaryBtnText}>{saving ? "Saving…" : "Save Results"}</Text>
          </TouchableOpacity>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/pose-studio')}><Text style={styles.secondaryBtnText}>Try Another</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/video-studio')}><Text style={styles.secondaryBtnText}>Create Video</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/stylo')}><Text style={styles.secondaryBtnText}>Ask Stylo</Text></TouchableOpacity>
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
  card: { marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)' },
  cardTitle: { color: '#fff', fontSize: 14, marginBottom: 12 },
  previewArea: { height: 280, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  poseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  poseCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  poseMedia: { width: '100%', aspectRatio: 3/4, borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  poseName: { color: '#fff', fontSize: 12, fontFamily: Typography.bodyMedium.fontFamily, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  actionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  actions: { paddingHorizontal: 20, marginTop: 24, gap: 12 },
  primaryBtn: { backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  actionGrid: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily }
});