import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function VideoResultScreen() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState(false);

  const style = { slug: "reels-spin", name: "Reels Spin", tint: ['#b48cff', '#6d3bff'] as [string, string], image: require('@/assets/images/videos/vs-spin.jpg') };

  const handleSave = () => {
    if (saving) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Saved', 'Video saved successfully!');
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
          <TypographyText variant="h1" style={styles.title}>Your <Text style={{ color: '#c084fc' }}>Showcase Video</Text></TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Your short outfit video is ready.</TypographyText>
        </View>

        <View style={styles.videoContainer}>
          <LinearGradient colors={style.tint} style={styles.videoPlayer}>
            <Image source={style.image} style={styles.videoImg} />
            <View style={styles.gradientOverlay} />
            <TouchableOpacity style={styles.playBtn} onPress={() => setPlaying(!playing)}>
              <Ionicons name={playing ? "pause" : "play"} size={28} color={Colors.tertiary} style={{ marginLeft: playing ? 0 : 4 }} />
            </TouchableOpacity>
            <View style={styles.durationBadge}><Text style={styles.durationText}>8 SEC VIDEO</Text></View>
          </LinearGradient>
        </View>

        <GlassCard style={styles.detailsCard}>
          <TypographyText variant="bodySemibold" style={styles.cardTitle}>Video Details</TypographyText>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Style</Text><Text style={styles.detailValue}>{style.name}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Format</Text><Text style={styles.detailValue}>9:16</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Music</Text><Text style={styles.detailValue}>Soft Beat</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Quality</Text><Text style={styles.detailValue}>HD Preview</Text></View>
        </GlassCard>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.primaryBtnText}>{saving ? "Saving…" : "Save Video"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryFullBtn} onPress={() => router.push('/video-studio')}>
            <Text style={styles.secondaryBtnText}>Create Another</Text>
          </TouchableOpacity>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => Alert.alert('Download', 'Download queued')}><Text style={styles.secondaryBtnText}>Download</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/stylo')}><Text style={styles.secondaryBtnText}>Ask Stylo</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/try-on')}><Text style={styles.secondaryBtnText}>Try Another</Text></TouchableOpacity>
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
  videoContainer: { alignItems: 'center', marginTop: 24 },
  videoPlayer: { width: 240, aspectRatio: 9/16, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', shadowColor: Colors.tertiary, shadowOpacity: 0.5, shadowRadius: 20 },
  videoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  gradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(0,0,0,0.4)' },
  playBtn: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -31 }, { translateY: -31 }], width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  durationBadge: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  durationText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  detailsCard: { marginHorizontal: 20, marginTop: 24, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)' },
  cardTitle: { color: '#fff', fontSize: 14, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  detailLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  detailValue: { color: '#fff', fontSize: 12, fontWeight: '500' },
  actions: { paddingHorizontal: 20, marginTop: 24, gap: 12 },
  primaryBtn: { backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  secondaryFullBtn: { backgroundColor: 'rgba(255,255,255,0.08)', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  actionGrid: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily }
});