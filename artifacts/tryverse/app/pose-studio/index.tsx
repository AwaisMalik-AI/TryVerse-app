import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = ["All", "Catalog", "Professional", "Casual", "Editorial", "Lifestyle", "Events", "Resort", "Fitness", "Action"];
const GENDERS = ["All", "Female", "Male"];
const MAX_POSES = 6;

const POSES = [
  { slug: "white-studio", name: "White Studio", desc: "Clean white e-commerce backdrop", image: require('@/assets/images/poses-new/catalog-white.jpg'), category: "Catalog", gender: "Female" },
  { slug: "grey-backdrop", name: "Grey Backdrop", desc: "Neutral studio catalog look", image: require('@/assets/images/poses-new/catalog-grey.jpg'), category: "Catalog", gender: "Male" },
  { slug: "pastel-studio", name: "Pastel Studio", desc: "Soft pastel product framing", image: require('@/assets/images/poses-new/catalog-pastel.jpg'), category: "Catalog", gender: "Female" },
  { slug: "confident-standing", name: "Confident Standing", desc: "Straight and composed pose", image: require('@/assets/images/poses-new/pro-standing.jpg'), category: "Professional", gender: "Male" },
  { slug: "executive-walk", name: "Executive Walk", desc: "Purposeful lobby stride", image: require('@/assets/images/poses-new/pro-walk.jpg'), category: "Professional", gender: "Female" },
  { slug: "window-gaze", name: "Window Gaze", desc: "Soft daylight moment", image: require('@/assets/images/poses-new/edit-window.jpg'), category: "Editorial", gender: "Female" },
];

export default function PoseStudioScreen() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState("All");
  const [gender, setGender] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const step = !photo ? 1 : selected.length === 0 ? 2 : 3;
  const canGenerate = !!photo && selected.length > 0 && !generating;

  const handlePickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const togglePose = (slug: string) => {
    setSelected(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug);
      if (prev.length >= MAX_POSES) return prev;
      return [...prev, slug];
    });
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      router.push({ pathname: '/pose-studio/result', params: { photo, poses: selected.join(',') } });
    }, 1700);
  };

  const visiblePoses = POSES.filter(p => (category === "All" || p.category === category) && (gender === "All" || p.gender === gender));
  const selectedPoses = POSES.filter(p => selected.includes(p.slug));

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
          <TypographyText variant="h1" style={styles.title}><Text style={{ color: '#c084fc' }}>Pose Studio</Text></TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Turn outfit photos into polished fashion poses for social, portfolios, and style inspiration.</TypographyText>
        </View>

        <View style={styles.stepIndicator}>
          {[
            { n: 1, label: "Photo" },
            { n: 2, label: "Pose" },
            { n: 3, label: "Generate" }
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
          <TypographyText variant="bodySemibold" style={styles.cardTitle}>Upload Your Outfit Photo</TypographyText>
          {!photo ? (
            <View style={styles.uploadArea}>
              <Ionicons name="images-outline" size={24} color="#fff" />
              <TypographyText variant="bodyMedium" style={{ marginTop: 8, color: '#fff' }}>Choose outfit photo</TypographyText>
              <TypographyText variant="small" style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Use a clear full-body photo</TypographyText>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handlePickFile}><Text style={styles.secondaryBtnText}>Choose Photo</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setPhoto(Image.resolveAssetSource(require('@/assets/images/design/tv-user.jpg')).uri)} style={{ marginTop: 12 }}>
                <Text style={styles.demoBtnText}>Use demo photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewArea}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              <View style={styles.checkBadge}><Ionicons name="checkmark" size={12} color="#fff" /><Text style={styles.checkBadgeText}>Photo uploaded</Text></View>
              <TouchableOpacity onPress={() => setPhoto(null)} style={styles.changeBtn}><Text style={styles.changeBtnText}>Change</Text></TouchableOpacity>
            </View>
          )}
        </GlassCard>

        <View style={{ opacity: !photo ? 0.5 : 1 }} pointerEvents={!photo ? 'none' : 'auto'}>
          <GlassCard style={styles.card}>
            <TypographyText variant="bodySemibold" style={styles.cardTitle}>Choose Your Pose</TypographyText>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 12 }}>Select up to {MAX_POSES}.</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, marginBottom: 12 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[styles.tab, category === c && styles.tabActive]} onPress={() => setCategory(c)}>
                  <Text style={[styles.tabText, category === c && styles.tabTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {GENDERS.map(g => (
                <TouchableOpacity key={g} style={[styles.tab, gender === g && styles.tabActive]} onPress={() => setGender(g)}>
                  <Text style={[styles.tabText, gender === g && styles.tabTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.poseGrid}>
              {visiblePoses.map(p => {
                const isSel = selected.includes(p.slug);
                const disabled = !isSel && selected.length >= MAX_POSES;
                return (
                  <TouchableOpacity key={p.slug} style={[styles.poseCard, isSel && styles.poseCardActive, disabled && { opacity: 0.4 }]} onPress={() => togglePose(p.slug)} disabled={disabled}>
                    <View style={styles.poseMedia}>
                      <Image source={p.image} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                      <View style={styles.genderBadge}><Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>{p.gender === 'Female' ? 'F' : 'M'}</Text></View>
                      {isSel && <View style={styles.poseCheck}><Ionicons name="checkmark" size={14} color="#fff" /></View>}
                    </View>
                    <Text style={styles.poseName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.poseDesc} numberOfLines={2}>{p.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedPoses.length > 0 && (
              <View style={styles.selectedOutfit}>
                <View style={styles.fetchedThumb}>
                  <Image source={selectedPoses[0].image} style={styles.fetchedImg} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Your selected poses ({selectedPoses.length}/{MAX_POSES})</Text>
                  <Text style={styles.fetchedName} numberOfLines={1}>{selectedPoses.map(p => p.name).join(", ")}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelected([])}><Text style={styles.changeBtnText}>Clear</Text></TouchableOpacity>
              </View>
            )}
          </GlassCard>
        </View>

        <TouchableOpacity style={[styles.primaryBtn, !canGenerate && styles.primaryBtnDisabled]} onPress={handleGenerate} disabled={!canGenerate}>
          {generating ? <Text style={styles.primaryBtnText}>Creating variations...</Text> : <Text style={styles.primaryBtnText}>Generate Poses{selected.length > 0 ? ` · ${selected.length}` : ""}</Text>}
        </TouchableOpacity>
        <Text style={styles.footerNote}>Your uploaded photo is deleted after your session.</Text>

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
  cardTitle: { color: '#fff', fontSize: 14, marginBottom: 4 },
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
  tab: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabActive: { backgroundColor: 'rgba(168,85,247,0.2)', borderColor: Colors.primary },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  tabTextActive: { color: '#fff' },
  poseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  poseCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 6, borderWidth: 1, borderColor: 'transparent' },
  poseCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(168,85,247,0.1)' },
  poseMedia: { width: '100%', aspectRatio: 3/4, borderRadius: 8, overflow: 'hidden', marginBottom: 8, position: 'relative' },
  genderBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  poseCheck: { position: 'absolute', bottom: 6, right: 6, backgroundColor: Colors.primary, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  poseName: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily, marginBottom: 2 },
  poseDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },
  selectedOutfit: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 12, backgroundColor: 'rgba(168,85,247,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  fetchedThumb: { width: 44, height: 44, borderRadius: 8, overflow: 'hidden' },
  fetchedImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  fetchedName: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily },
  primaryBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  footerNote: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginTop: 12, paddingHorizontal: 40 }
});