import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text, Switch } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const STYLES = [
  { slug: "spin-360", name: "360° Spin", desc: "Full-body turntable rotation.", tint: ['#6d3bff', '#1a0a3d'], image: require('@/assets/images/videos/vs-spin.jpg'), badge: "360°" },
  { slug: "runway-walk", name: "Runway Walk", desc: "Confident catwalk motion.", tint: ['#c48cff', '#6d3bff'], image: require('@/assets/images/videos/vs-runway.jpg'), badge: "Reels" },
  { slug: "pose-shift", name: "Pose Shift", desc: "Smooth transitions between poses.", tint: ['#ff9ac4', '#8a2b6d'], image: require('@/assets/images/videos/vs-pose-shift.jpg'), badge: "3–4 poses" },
];
const DURATIONS = ["8 sec", "12 sec", "15 sec"];
const RATIOS = ["9:16", "1:1", "4:5"];
const MUSICS = ["None", "Soft Beat", "Fashion Pop", "Calm Luxe"];

export default function VideoStudioScreen() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [styleSlug, setStyleSlug] = useState<string | null>(null);
  const [duration, setDuration] = useState("8 sec");
  const [ratio, setRatio] = useState("9:16");
  const [music, setMusic] = useState("Soft Beat");
  const [overlay, setOverlay] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selectedStyle = STYLES.find(s => s.slug === styleSlug);
  const step = !photo ? 1 : !selectedStyle ? 2 : 3;
  const canGenerate = !!photo && !!selectedStyle && !generating;

  const handlePickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      router.push('/video-studio/result');
    }, 2000);
  };

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <TouchableOpacity style={styles.avatar}><Text style={styles.avatarText}>HK</Text></TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <TypographyText variant="h1" style={styles.title}><Text style={{ color: '#c084fc' }}>Showcase Video</Text></TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Turn your outfit into a short fashion video for sharing.</TypographyText>
        </View>

        <View style={styles.stepIndicator}>
          {[
            { n: 1, label: "Upload" }, { n: 2, label: "Style" }, { n: 3, label: "Generate" }
          ].map((s, i, arr) => (
            <React.Fragment key={s.n}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, step >= s.n && styles.stepDotActive, step === s.n && styles.stepDotCurrent]}>
                  {step > s.n ? <Ionicons name="checkmark" size={12} color="#fff" /> : <Text style={[styles.stepDotText, step === s.n && styles.stepDotTextCurrent]}>{s.n}</Text>}
                </View>
                <Text style={[styles.stepLabel, step === s.n && styles.stepLabelCurrent]}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.stepLine, step > s.n && styles.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>

        <GlassCard style={styles.card}>
          <TypographyText variant="bodySemibold" style={styles.cardTitle}>Choose Your Outfit</TypographyText>
          {!photo ? (
            <View style={styles.uploadArea}>
              <Ionicons name="film-outline" size={24} color="#fff" />
              <TypographyText variant="bodyMedium" style={{ marginTop: 8, color: '#fff' }}>Upload outfit image</TypographyText>
              <TypographyText variant="small" style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'center' }}>Use a try-on result, saved look, or photo.</TypographyText>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handlePickFile}><Text style={styles.secondaryBtnText}>Upload Image</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setPhoto(Image.resolveAssetSource(require('@/assets/images/design/tv-user.jpg')).uri)} style={{ marginTop: 12 }}>
                <Text style={styles.demoBtnText}>Use demo photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewArea}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              <View style={styles.checkBadge}><Ionicons name="checkmark" size={12} color="#fff" /><Text style={styles.checkBadgeText}>Look selected</Text></View>
              <TouchableOpacity onPress={() => setPhoto(null)} style={styles.changeBtn}><Text style={styles.changeBtnText}>Change</Text></TouchableOpacity>
            </View>
          )}
        </GlassCard>

        <View style={{ opacity: !photo ? 0.5 : 1 }} pointerEvents={!photo ? 'none' : 'auto'}>
          <GlassCard style={styles.card}>
            <TypographyText variant="bodySemibold" style={styles.cardTitle}>Choose Video Style</TypographyText>
            <View style={styles.poseGrid}>
              {STYLES.map(s => {
                const isSel = styleSlug === s.slug;
                return (
                  <TouchableOpacity key={s.slug} style={[styles.poseCard, isSel && styles.poseCardActive]} onPress={() => setStyleSlug(s.slug)}>
                    <View style={styles.poseMedia}>
                      <Image source={s.image} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                      <View style={styles.genderBadge}><Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>{s.badge}</Text></View>
                      <View style={styles.secBadge}><Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>8 SEC</Text></View>
                      {isSel && <View style={styles.poseCheck}><Ionicons name="checkmark" size={14} color="#fff" /></View>}
                    </View>
                    <Text style={styles.poseName} numberOfLines={1}>{s.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>

          <GlassCard style={styles.card}>
            <TypographyText variant="bodySemibold" style={styles.cardTitle}>Video Settings</TypographyText>
            
            <Text style={styles.settingLabel}>DURATION</Text>
            <View style={styles.tabs}>
              {DURATIONS.map(d => <TouchableOpacity key={d} style={[styles.tab, duration === d && styles.tabActive]} onPress={() => setDuration(d)}><Text style={[styles.tabText, duration === d && styles.tabTextActive]}>{d}</Text></TouchableOpacity>)}
            </View>

            <Text style={styles.settingLabel}>ASPECT RATIO</Text>
            <View style={styles.tabs}>
              {RATIOS.map(r => <TouchableOpacity key={r} style={[styles.tab, ratio === r && styles.tabActive]} onPress={() => setRatio(r)}><Text style={[styles.tabText, ratio === r && styles.tabTextActive]}>{r}</Text></TouchableOpacity>)}
            </View>

            <Text style={styles.settingLabel}>MUSIC</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              {MUSICS.map(m => <TouchableOpacity key={m} style={[styles.tab, music === m && styles.tabActive]} onPress={() => setMusic(m)}><Text style={[styles.tabText, music === m && styles.tabTextActive]}>{m}</Text></TouchableOpacity>)}
            </ScrollView>

            <View style={styles.switchRow}>
              <View>
                <Text style={{ color: '#fff', fontSize: 13 }}>Text Overlay</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Add outfit title on video.</Text>
              </View>
              <Switch value={overlay} onValueChange={setOverlay} trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.primary }} />
            </View>
          </GlassCard>
        </View>

        <TouchableOpacity style={[styles.primaryBtn, !canGenerate && styles.primaryBtnDisabled]} onPress={handleGenerate} disabled={!canGenerate}>
          {generating ? <Text style={styles.primaryBtnText}>Creating video...</Text> : <Text style={styles.primaryBtnText}>Generate Video</Text>}
        </TouchableOpacity>

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
  stepIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 20, marginTop: 16, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  stepItem: { alignItems: 'center', gap: 6, flexDirection: 'row' },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: Colors.primary },
  stepDotCurrent: { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 8 },
  stepDotText: { color: '#fff', fontSize: 10, fontFamily: Typography.heading.fontFamily },
  stepDotTextCurrent: { color: '#fff' },
  stepLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: Typography.body.fontFamily },
  stepLabelCurrent: { color: '#fff' },
  stepLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 },
  stepLineActive: { backgroundColor: Colors.primary },
  card: { marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)' },
  cardTitle: { color: '#fff', fontSize: 14, marginBottom: 12 },
  uploadArea: { alignItems: 'center', padding: 24, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed' },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 16 },
  secondaryBtnText: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily, textAlign: 'center' },
  demoBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textDecorationLine: 'underline' },
  previewArea: { position: 'relative', height: 280, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  checkBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkBadgeText: { color: '#fff', fontSize: 10 },
  changeBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  changeBtnText: { color: '#fff', fontSize: 11 },
  poseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  poseCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 6, borderWidth: 1, borderColor: 'transparent' },
  poseCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(168,85,247,0.1)' },
  poseMedia: { width: '100%', aspectRatio: 3/4, borderRadius: 8, overflow: 'hidden', marginBottom: 8, position: 'relative' },
  genderBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  secBadge: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  poseCheck: { position: 'absolute', bottom: 6, right: 6, backgroundColor: Colors.primary, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  poseName: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily, textAlign: 'center' },
  settingLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 12, marginBottom: 8 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabActive: { backgroundColor: 'rgba(168,85,247,0.2)', borderColor: Colors.primary },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  primaryBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
});