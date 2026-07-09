import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Video, ResizeMode } from 'expo-av';
import { apiGet, apiUpload, apiFetch, API_URL, getToken } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { sendLocalNotification } from '@/lib/notifications';

interface VideoPose {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  thumbnail_url?: string;
  gif_url?: string;
}

interface AspectRatio {
  id: string;
  label?: string;
  subtitle?: string;
  description?: string;
  ratio?: string;
}

const MAX_POLL_SECONDS = 600;

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

export default function VideoStudioScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [poses, setPoses] = useState<VideoPose[]>([]);
  const [aspectRatios, setAspectRatios] = useState<AspectRatio[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [poseId, setPoseId] = useState<string | null>(null);
  const [ratio, setRatio] = useState<string>('9:16');

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [genError, setGenError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [localVideoUri, setLocalVideoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initials = initialsFromName(user?.full_name);
  const selectedPose = poses.find((p) => p.id === poseId);
  const step = !photo ? 1 : !selectedPose ? 2 : 3;
  const canGenerate = !!photo && !!selectedPose && !generating;

  const loadData = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    const [posesRes, ratiosRes] = await Promise.all([
      apiGet<{ poses: VideoPose[] }>('/api/video/poses'),
      apiGet<{ aspect_ratios: AspectRatio[] }>('/api/video/aspect-ratios'),
    ]);
    if (posesRes.ok && posesRes.data) {
      const d = posesRes.data as any;
      setPoses(d.poses || d || []);
    }
    if (ratiosRes.ok && ratiosRes.data) {
      const d = ratiosRes.data as any;
      const list: AspectRatio[] = d.aspect_ratios || d || [];
      setAspectRatios(list);
      if (list.length > 0 && !list.some((r) => r.id === '9:16')) setRatio(list[0].id);
    }
    if (!posesRes.ok || !ratiosRes.ok) {
      setDataError(posesRes.error || ratiosRes.error || 'Could not load video options.');
    }
    setLoadingData(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handlePickFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setVideoUrl(null);
      setLocalVideoUri(null);
      setProgress(0);
      setGenError(null);
    }
  };

  const downloadVideoForPlayback = async (url: string) => {
    if (Platform.OS === 'web') return null;
    try {
      const fileUri = `${FileSystem.cacheDirectory}tryverse_preview_${Date.now()}.mp4`;
      const headers: Record<string, string> = {};
      const token = await getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const download = await FileSystem.downloadAsync(url, fileUri, { headers });
      return download.uri;
    } catch {
      return null;
    }
  };

  const pollStatus = (id: string) => {
    let elapsed = 0;
    let pollFailures = 0;

    pollRef.current = setInterval(async () => {
      elapsed += 5;

      if (elapsed >= MAX_POLL_SECONDS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setGenerating(false);
        setProgress(0);
        setGenError('Video generation is taking too long. Please try again later.');
        return;
      }

      const elapsedProgress = Math.min((elapsed / 150) * 90, 90);
      setProgress((prev) => Math.max(prev, elapsedProgress));

      try {
        const res = await apiFetch(`/api/video/status/${id}`);
        if (res.ok) {
          pollFailures = 0;
          const data = await res.json();

          if (data.progress != null && data.progress > 0) {
            setProgress((prev) => Math.max(prev, Math.min(data.progress, 95)));
          }
          if (data.status_message) setStatusMessage(data.status_message);

          const videoPath = data.download_url || data.video_url;
          if (data.status === 'completed' && videoPath) {
            if (pollRef.current) clearInterval(pollRef.current);
            const fullUrl = resolveUrl(videoPath);
            setVideoUrl(fullUrl);
            const localUri = await downloadVideoForPlayback(fullUrl);
            if (localUri) setLocalVideoUri(localUri);
            setGenerating(false);
            setProgress(100);
            sendLocalNotification('Video Ready!', 'Your showcase video has been generated.');
          } else if (data.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setGenerating(false);
            setProgress(0);
            setGenError(data.error || 'Video generation failed. Please try again.');
          }
        } else {
          pollFailures++;
          if (pollFailures >= 5) {
            if (pollRef.current) clearInterval(pollRef.current);
            setGenerating(false);
            setProgress(0);
            setGenError('Lost connection to the server. Please try again.');
          }
        }
      } catch {
        pollFailures++;
        if (pollFailures >= 5) {
          if (pollRef.current) clearInterval(pollRef.current);
          setGenerating(false);
          setProgress(0);
          setGenError('Connection lost. Please check your internet and try again.');
        }
      }
    }, 5000);
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (!isAuthenticated) {
      setGenError('Please sign in to generate videos.');
      return;
    }
    setGenerating(true);
    setVideoUrl(null);
    setLocalVideoUri(null);
    setProgress(0);
    setStatusMessage('');
    setGenError(null);

    const res = await apiUpload('/api/video/generate', photo!, 'file', {
      pose_id: poseId!,
      aspect_ratio: ratio,
    });

    if (res.ok && res.data) {
      const data = res.data as { task_id?: string };
      if (data.task_id) {
        pollStatus(data.task_id);
      } else {
        setGenerating(false);
        setGenError('Could not start video generation. Please try again.');
      }
    } else {
      setGenerating(false);
      if (res.status === 402 || res.status === 429) {
        setGenError('Credit limit reached, upgrade your plan.');
      } else {
        setGenError(res.error || 'Could not start video generation.');
      }
    }
  };

  const handleSave = async () => {
    const sourceUri = localVideoUri || videoUrl;
    if (!sourceUri) return;
    if (Platform.OS === 'web') {
      Linking.openURL(sourceUri);
      return;
    }
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setGenError('Please allow gallery access to save videos.');
        setSaving(false);
        return;
      }
      let saveUri = sourceUri;
      if (sourceUri.startsWith('http')) {
        const fileUri = `${FileSystem.cacheDirectory}tryverse_video_${Date.now()}.mp4`;
        const headers: Record<string, string> = {};
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const download = await FileSystem.downloadAsync(sourceUri, fileUri, { headers });
        saveUri = download.uri;
      }
      await MediaLibrary.saveToLibraryAsync(saveUri);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setGenError('Could not save the video. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const playbackUri = localVideoUri || videoUrl;

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <View style={styles.avatar}>
            {initials ? <Text style={styles.avatarText}>{initials}</Text> : <Ionicons name="person" size={16} color="#fff" />}
          </View>
        </View>

        <View style={styles.titleSection}>
          <TypographyText variant="h1" style={styles.title}><Text style={{ color: '#c084fc' }}>Showcase Video</Text></TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Turn your outfit into a short fashion video for sharing.</TypographyText>
        </View>

        <View style={styles.stepIndicator}>
          {[{ n: 1, label: 'Upload' }, { n: 2, label: 'Style' }, { n: 3, label: 'Generate' }].map((s, i, arr) => (
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
            </View>
          ) : (
            <View style={styles.previewArea}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              <View style={styles.checkBadge}><Ionicons name="checkmark" size={12} color="#fff" /><Text style={styles.checkBadgeText}>Look selected</Text></View>
              <TouchableOpacity onPress={() => { setPhoto(null); setVideoUrl(null); setLocalVideoUri(null); }} style={styles.changeBtn}><Text style={styles.changeBtnText}>Change</Text></TouchableOpacity>
            </View>
          )}
        </GlassCard>

        {loadingData ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
        ) : dataError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{dataError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadData}><Text style={styles.retryBtnText}>Retry</Text></TouchableOpacity>
          </View>
        ) : (
          <View style={{ opacity: !photo ? 0.5 : 1 }} pointerEvents={!photo ? 'none' : 'auto'}>
            <GlassCard style={styles.card}>
              <TypographyText variant="bodySemibold" style={styles.cardTitle}>Choose Video Style</TypographyText>
              {poses.length === 0 ? (
                <Text style={styles.emptyText}>No video styles available right now.</Text>
              ) : (
                <View style={styles.poseGrid}>
                  {poses.map((p) => {
                    const isSel = poseId === p.id;
                    const thumb = p.gif_url || p.thumbnail_url;
                    return (
                      <TouchableOpacity key={p.id} style={[styles.poseCard, isSel && styles.poseCardActive]} onPress={() => setPoseId(p.id)}>
                        <View style={styles.poseMedia}>
                          {thumb ? (
                            <Image source={{ uri: resolveUrl(thumb) }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                          ) : (
                            <View style={styles.posePlaceholder}><Ionicons name="videocam-outline" size={22} color="rgba(255,255,255,0.5)" /></View>
                          )}
                          {isSel && <View style={styles.poseCheck}><Ionicons name="checkmark" size={14} color="#fff" /></View>}
                        </View>
                        <Text style={styles.poseName} numberOfLines={1}>{p.name}</Text>
                        {p.description ? <Text style={styles.poseDesc} numberOfLines={2}>{p.description}</Text> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </GlassCard>

            {aspectRatios.length > 0 && (
              <GlassCard style={styles.card}>
                <TypographyText variant="bodySemibold" style={styles.cardTitle}>Aspect Ratio</TypographyText>
                <View style={styles.tabs}>
                  {aspectRatios.map((r) => (
                    <TouchableOpacity key={r.id} style={[styles.tab, ratio === r.id && styles.tabActive]} onPress={() => setRatio(r.id)}>
                      <Text style={[styles.tabText, ratio === r.id && styles.tabTextActive]}>{r.label || r.ratio || r.id}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {!isAuthenticated && (
          <View style={styles.signInBox}>
            <Text style={styles.signInText}>Sign in to generate videos.</Text>
            <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/login')}><Text style={styles.signInBtnText}>Sign In</Text></TouchableOpacity>
          </View>
        )}

        {generating && (
          <GlassCard style={styles.card}>
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.genTitle}>{statusMessage || 'Creating your video...'}</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(progress, 2)}%` }]} /></View>
              <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
              <Text style={styles.genHint}>Video generation takes 1-3 minutes.</Text>
            </View>
          </GlassCard>
        )}

        {genError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{genError}</Text>
            {genError.toLowerCase().includes('upgrade') ? (
              <TouchableOpacity style={styles.retryBtn} onPress={() => router.push('/pricing')}><Text style={styles.retryBtnText}>Upgrade Plan</Text></TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.retryBtn} onPress={handleGenerate}><Text style={styles.retryBtnText}>Retry</Text></TouchableOpacity>
            )}
          </View>
        )}

        {!playbackUri && (
          <TouchableOpacity style={[styles.primaryBtn, !canGenerate && styles.primaryBtnDisabled]} onPress={handleGenerate} disabled={!canGenerate}>
            {generating ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.primaryBtnText}>Creating video... {Math.round(progress)}%</Text>
              </View>
            ) : (
              <Text style={styles.primaryBtnText}>Generate Video</Text>
            )}
          </TouchableOpacity>
        )}

        {playbackUri && (
          <View style={{ marginTop: 28 }}>
            <TypographyText variant="bodySemibold" style={[styles.cardTitle, { paddingHorizontal: 20 }]}>Your Showcase Video</TypographyText>
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: playbackUri }}
                style={styles.videoPlayer}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay
              />
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryBtnText}>{saved ? 'Saved' : (Platform.OS === 'web' ? 'Open Video' : 'Save to Gallery')}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryFullBtn} onPress={() => { setVideoUrl(null); setLocalVideoUri(null); setPhoto(null); setPoseId(null); setProgress(0); }}>
                <Text style={styles.secondaryBtnText}>Create Another</Text>
              </TouchableOpacity>
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
  cardTitle: { color: '#fff', fontSize: 14, marginBottom: 12 },
  uploadArea: { alignItems: 'center', padding: 24, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed' },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 16 },
  secondaryBtnText: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily, textAlign: 'center' },
  previewArea: { position: 'relative', height: 280, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  checkBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkBadgeText: { color: '#fff', fontSize: 10 },
  changeBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  changeBtnText: { color: '#fff', fontSize: 11 },
  poseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  poseCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 6, borderWidth: 1, borderColor: 'transparent' },
  poseCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(168,85,247,0.1)' },
  poseMedia: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8, overflow: 'hidden', marginBottom: 8, position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)' },
  posePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  poseCheck: { position: 'absolute', bottom: 6, right: 6, backgroundColor: Colors.primary, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  poseName: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily },
  poseDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabActive: { backgroundColor: 'rgba(168,85,247,0.2)', borderColor: Colors.primary },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  primaryBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  secondaryFullBtn: { marginHorizontal: 20, marginTop: 12, backgroundColor: 'rgba(255,255,255,0.08)', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  errorBox: { marginHorizontal: 20, marginTop: 16, padding: 16, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', alignItems: 'center' },
  errorText: { color: '#fca5a5', fontSize: 12, textAlign: 'center', marginBottom: 10 },
  retryBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  retryBtnText: { color: '#fff', fontSize: 12, fontFamily: Typography.bodyMedium.fontFamily },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', marginVertical: 24 },
  signInBox: { marginHorizontal: 20, marginTop: 16, padding: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  signInText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 10 },
  signInBtn: { backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 24, borderRadius: 20 },
  signInBtnText: { color: '#fff', fontSize: 12, fontFamily: Typography.bodyMedium.fontFamily },
  genTitle: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily, marginTop: 14, textAlign: 'center' },
  progressTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  progressText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 8 },
  genHint: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 8, textAlign: 'center' },
  videoContainer: { alignItems: 'center', marginTop: 16 },
  videoPlayer: { width: 240, aspectRatio: 9 / 16, borderRadius: 22, overflow: 'hidden', backgroundColor: '#000', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  resultActions: { marginTop: 8 },
});
