import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text, ActivityIndicator, Platform, Linking } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { apiGet, apiUpload, API_URL, getToken } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { sendLocalNotification } from '@/lib/notifications';

const MAX_POSES = 3;

interface PosePreset {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  thumbnail_url: string | null;
  is_premium: boolean;
  display_order: number;
}

function initialsFromName(name?: string | null): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function resolveUrl(url: string): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `${API_URL}${url}`;
}

export default function PoseStudioScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [presets, setPresets] = useState<PosePreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [presetError, setPresetError] = useState<string | null>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<number[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [premiumNote, setPremiumNote] = useState<string | null>(null);
  const [limitNote, setLimitNote] = useState<string | null>(null);

  const [results, setResults] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [savedIdx, setSavedIdx] = useState<number | null>(null);

  const initials = initialsFromName(user?.full_name);

  const loadPresets = useCallback(async () => {
    setLoadingPresets(true);
    setPresetError(null);
    const res = await apiGet<PosePreset[]>('/api/pose/presets');
    if (res.ok && res.data) {
      setPresets(res.data);
    } else {
      setPresetError(res.error || 'Could not load poses.');
    }
    setLoadingPresets(false);
  }, []);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const categories = ['all', ...Array.from(new Set(presets.map((p) => p.category)))];
  const visiblePresets = category === 'all' ? presets : presets.filter((p) => p.category === category);
  const selectedPresets = presets.filter((p) => selected.includes(p.id));

  const step = !photo ? 1 : selected.length === 0 ? 2 : 3;
  const canGenerate = !!photo && selected.length > 0 && !generating;

  const handlePickFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setResults([]);
      setFeedback(null);
      setGenError(null);
    }
  };

  const togglePose = (preset: PosePreset) => {
    setPremiumNote(null);
    setLimitNote(null);
    if (preset.is_premium && !user?.is_pro) {
      setPremiumNote('Premium poses are available for Pro members. Upgrade to unlock all poses.');
      return;
    }
    setSelected((prev) => {
      if (prev.includes(preset.id)) return prev.filter((id) => id !== preset.id);
      if (prev.length >= MAX_POSES) {
        setLimitNote(`You can select up to ${MAX_POSES} poses at a time.`);
        return prev;
      }
      return [...prev, preset.id];
    });
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (!isAuthenticated) {
      setGenError('Please sign in to generate poses.');
      return;
    }
    setGenerating(true);
    setGenError(null);
    setResults([]);
    setFeedback(null);
    const res = await apiUpload('/api/pose/generate-from-presets', photo!, 'file', {
      preset_ids: JSON.stringify(selected),
    });
    setGenerating(false);
    if (res.ok && res.data) {
      const data = res.data as { generated_image_urls?: string[]; ai_feedback?: string };
      const urls = (data.generated_image_urls || []).map(resolveUrl);
      if (urls.length > 0) {
        setResults(urls);
        setFeedback(data.ai_feedback || null);
        sendLocalNotification('Image Ready!', `Your ${urls.length > 1 ? `${urls.length} poses are` : 'pose is'} ready.`);
      } else {
        setGenError('No poses were generated. Please try again.');
      }
    } else {
      if (res.status === 402 || res.status === 429) {
        setGenError('You have reached your credit limit. Please upgrade your plan.');
      } else {
        setGenError(res.error || 'Generation failed. Please try again.');
      }
    }
  };

  const handleSave = async (url: string, idx: number) => {
    if (savingIdx !== null) return;
    if (Platform.OS === 'web') {
      Linking.openURL(url);
      return;
    }
    setSavingIdx(idx);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setGenError('Please allow gallery access to save images.');
        setSavingIdx(null);
        return;
      }
      let saveUri = url;
      if (url.startsWith('http')) {
        const fileUri = `${FileSystem.cacheDirectory}pose_${Date.now()}.jpg`;
        const headers: Record<string, string> = {};
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const download = await FileSystem.downloadAsync(url, fileUri, { headers });
        saveUri = download.uri;
      }
      await MediaLibrary.saveToLibraryAsync(saveUri);
      setSavedIdx(idx);
      setTimeout(() => setSavedIdx(null), 2000);
    } catch {
      setGenError('Could not save the image. Please try again.');
    } finally {
      setSavingIdx(null);
    }
  };

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <View style={styles.avatar}>
            {initials ? <Text style={styles.avatarText}>{initials}</Text> : <Ionicons name="person" size={16} color="#fff" />}
          </View>
        </View>

        <View style={styles.titleSection}>
          <TypographyText variant="h1" style={styles.title}><Text style={{ color: '#c084fc' }}>Pose Studio</Text></TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Turn outfit photos into polished fashion poses for social, portfolios, and style inspiration.</TypographyText>
        </View>

        <View style={styles.stepIndicator}>
          {[
            { n: 1, label: 'Photo' },
            { n: 2, label: 'Pose' },
            { n: 3, label: 'Generate' },
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
            </View>
          ) : (
            <View style={styles.previewArea}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              <View style={styles.checkBadge}><Ionicons name="checkmark" size={12} color="#fff" /><Text style={styles.checkBadgeText}>Photo uploaded</Text></View>
              <TouchableOpacity onPress={() => { setPhoto(null); setResults([]); }} style={styles.changeBtn}><Text style={styles.changeBtnText}>Change</Text></TouchableOpacity>
            </View>
          )}
        </GlassCard>

        <View style={{ opacity: !photo ? 0.5 : 1 }} pointerEvents={!photo ? 'none' : 'auto'}>
          <GlassCard style={styles.card}>
            <TypographyText variant="bodySemibold" style={styles.cardTitle}>Choose Your Pose</TypographyText>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 12 }}>Select up to {MAX_POSES}.</Text>

            {loadingPresets ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 32 }} />
            ) : presetError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{presetError}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadPresets}><Text style={styles.retryBtnText}>Retry</Text></TouchableOpacity>
              </View>
            ) : presets.length === 0 ? (
              <Text style={styles.emptyText}>No poses available right now.</Text>
            ) : (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, marginBottom: 16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                  {categories.map((c) => (
                    <TouchableOpacity key={c} style={[styles.tab, category === c && styles.tabActive]} onPress={() => setCategory(c)}>
                      <Text style={[styles.tabText, category === c && styles.tabTextActive]}>{c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.poseGrid}>
                  {visiblePresets.map((p) => {
                    const isSel = selected.includes(p.id);
                    const disabled = !isSel && selected.length >= MAX_POSES;
                    const thumb = p.thumbnail_url ? resolveUrl(p.thumbnail_url) : null;
                    return (
                      <TouchableOpacity key={p.id} style={[styles.poseCard, isSel && styles.poseCardActive, disabled && { opacity: 0.4 }]} onPress={() => togglePose(p)} disabled={disabled}>
                        <View style={styles.poseMedia}>
                          {thumb ? (
                            <Image source={{ uri: thumb }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                          ) : (
                            <View style={styles.posePlaceholder}><Ionicons name="body-outline" size={22} color="rgba(255,255,255,0.5)" /></View>
                          )}
                          {p.is_premium && <View style={styles.premiumBadge}><Ionicons name="star" size={9} color="#fff" /></View>}
                          {isSel && <View style={styles.poseCheck}><Ionicons name="checkmark" size={14} color="#fff" /></View>}
                        </View>
                        <Text style={styles.poseName} numberOfLines={1}>{p.name}</Text>
                        {p.description ? <Text style={styles.poseDesc} numberOfLines={2}>{p.description}</Text> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {premiumNote && <Text style={styles.note}>{premiumNote}</Text>}
                {limitNote && <Text style={styles.note}>{limitNote}</Text>}

                {selectedPresets.length > 0 && (
                  <View style={styles.selectedOutfit}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Your selected poses ({selectedPresets.length}/{MAX_POSES})</Text>
                      <Text style={styles.fetchedName} numberOfLines={1}>{selectedPresets.map((p) => p.name).join(', ')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelected([])}><Text style={styles.changeBtnText}>Clear</Text></TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </GlassCard>
        </View>

        {!isAuthenticated && (
          <View style={styles.signInBox}>
            <Text style={styles.signInText}>Sign in to generate poses.</Text>
            <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/login')}><Text style={styles.signInBtnText}>Sign In</Text></TouchableOpacity>
          </View>
        )}

        {genError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{genError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleGenerate}><Text style={styles.retryBtnText}>Retry</Text></TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={[styles.primaryBtn, !canGenerate && styles.primaryBtnDisabled]} onPress={handleGenerate} disabled={!canGenerate}>
          {generating ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.primaryBtnText}>Creating variations...</Text>
            </View>
          ) : (
            <Text style={styles.primaryBtnText}>Generate Poses{selected.length > 0 ? ` · ${selected.length}` : ''}</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.footerNote}>Your uploaded photo is deleted after your session.</Text>

        {results.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <TypographyText variant="bodySemibold" style={[styles.cardTitle, { paddingHorizontal: 20 }]}>Your Pose Results</TypographyText>
            {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
            <View style={styles.resultGrid}>
              {results.map((url, idx) => (
                <View key={idx} style={styles.resultCard}>
                  <Image source={{ uri: url }} style={styles.resultImage} />
                  <TouchableOpacity style={styles.resultSaveBtn} onPress={() => handleSave(url, idx)} disabled={savingIdx === idx}>
                    {savingIdx === idx ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name={savedIdx === idx ? 'checkmark' : (Platform.OS === 'web' ? 'open-outline' : 'download-outline')} size={14} color="#fff" />
                        <Text style={styles.resultSaveText}>{savedIdx === idx ? 'Saved' : (Platform.OS === 'web' ? 'Open' : 'Save')}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
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
  previewArea: { position: 'relative', height: 280, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'contain', backgroundColor: 'rgba(255,255,255,0.03)' },
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
  poseMedia: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8, overflow: 'hidden', marginBottom: 8, position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)' },
  posePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  premiumBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(168,85,247,0.9)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  poseCheck: { position: 'absolute', bottom: 6, right: 6, backgroundColor: Colors.primary, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  poseName: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily, marginBottom: 2 },
  poseDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },
  note: { color: '#f0abfc', fontSize: 11, marginTop: 12 },
  selectedOutfit: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 12, backgroundColor: 'rgba(168,85,247,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  fetchedName: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily },
  primaryBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  footerNote: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginTop: 12, paddingHorizontal: 40 },
  errorBox: { marginHorizontal: 20, marginTop: 16, padding: 16, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', alignItems: 'center' },
  errorText: { color: '#fca5a5', fontSize: 12, textAlign: 'center', marginBottom: 10 },
  retryBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  retryBtnText: { color: '#fff', fontSize: 12, fontFamily: Typography.bodyMedium.fontFamily },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', marginVertical: 24 },
  signInBox: { marginHorizontal: 20, marginTop: 16, padding: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  signInText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 10 },
  signInBtn: { backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 24, borderRadius: 20 },
  signInBtnText: { color: '#fff', fontSize: 12, fontFamily: Typography.bodyMedium.fontFamily },
  feedbackText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, paddingHorizontal: 20, marginTop: 8, marginBottom: 4, lineHeight: 18 },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginTop: 12 },
  resultCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  resultImage: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8, marginBottom: 8, resizeMode: 'contain' },
  resultSaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', height: 34, borderRadius: 17 },
  resultSaveText: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily },
});
