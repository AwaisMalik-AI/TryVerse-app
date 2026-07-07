import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { theme, Gradients, Spacing, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { apiGet, apiUpload, apiFetch, API_URL, getToken } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoldButton } from '@/components/ui/GoldButton';
import { sendLocalNotification } from '@/lib/notifications';
import { useAuth } from '@/lib/auth';

interface VideoPose {
  id: string;
  name: string;
  description: string;
  thumbnail_url?: string;
  gif_url?: string;
  category?: string;
}

interface AspectRatio {
  id: string;
  label: string;
  ratio: string;
  description: string;
}

export default function VideoStudioScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const POSE_SIZE = (width - Spacing.xl * 2 - Spacing.md * 2) / 3;

  const [poses, setPoses] = useState<VideoPose[]>([]);
  const [aspectRatios, setAspectRatios] = useState<AspectRatio[]>([]);
  const [loadingPoses, setLoadingPoses] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selectedPose, setSelectedPose] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('9:16');
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    setLoadingPoses(true);
    const [posesRes, ratiosRes] = await Promise.all([
      apiGet<{ poses: VideoPose[] }>('/api/video/poses'),
      apiGet<{ aspect_ratios: AspectRatio[] }>('/api/video/aspect-ratios'),
    ]);
    if (posesRes.ok && posesRes.data) {
      const data = posesRes.data as any;
      setPoses(data.poses || data || []);
    }
    if (ratiosRes.ok && ratiosRes.data) {
      const data = ratiosRes.data as any;
      setAspectRatios(data.aspect_ratios || data || []);
    }
    setLoadingPoses(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setVideoUrl(null);
      setTaskId(null);
      setProgress(0);
    }
  };

  const [saving, setSaving] = useState(false);

  const pollStatus = (id: string) => {
    let elapsed = 0;
    const MAX_POLL_SECONDS = 300;
    pollRef.current = setInterval(async () => {
      elapsed += 5;

      if (elapsed >= MAX_POLL_SECONDS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setIsGenerating(false);
        setProgress(0);
        Alert.alert('Timeout', 'Video generation is taking too long. Please try again later.');
        return;
      }

      try {
        const res = await apiFetch(`/api/video/status/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.progress != null) setProgress(Math.min(data.progress, 95));
          else setProgress(Math.min(elapsed / 120 * 100, 95));
          const videoPath = data.download_url || data.video_url;
          if (data.status === 'completed' && videoPath) {
            if (pollRef.current) clearInterval(pollRef.current);
            const url = videoPath.startsWith('http') ? videoPath : `${API_URL}${videoPath}`;
            setVideoUrl(url);
            setIsGenerating(false);
            setProgress(100);
            sendLocalNotification('Video Ready!', 'Your showcase video has been generated.');
          } else if (data.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setIsGenerating(false);
            setProgress(0);
            Alert.alert('Generation Failed', data.error || 'Video generation failed. Please try again.');
          }
        }
      } catch {
        if (__DEV__) console.log('[VIDEO] Poll error at', elapsed, 'seconds');
      }
    }, 5000);
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    try {
      setSaving(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save videos to your gallery.');
        setSaving(false);
        return;
      }
      const filename = `tryverse_video_${Date.now()}.mp4`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const headers: Record<string, string> = {};
      if (videoUrl.startsWith(API_URL)) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const download = await FileSystem.downloadAsync(videoUrl, fileUri, { headers });
      await MediaLibrary.saveToLibraryAsync(download.uri);
      Alert.alert('Saved!', 'Video has been saved to your gallery.');
    } catch {
      Alert.alert('Error', 'Could not save the video. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!photoUri || !selectedPose) {
      Alert.alert('Missing', 'Please upload a photo and select a pose.');
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);
    setProgress(0);

    const formData: Record<string, string> = {
      pose_id: selectedPose,
      aspect_ratio: selectedAspectRatio,
    };

    const res = await apiUpload('/api/video/generate', photoUri, 'file', formData);
    if (res.ok && res.data) {
      const data = res.data as { task_id?: string };
      if (data.task_id) {
        setTaskId(data.task_id);
        pollStatus(data.task_id);
      }
    } else {
      setIsGenerating(false);
      Alert.alert('Error', (res.error as string) || 'Could not start video generation');
    }
  };

  const resolveUrl = (url: string) => url?.startsWith('http') ? url : `${API_URL}${url}`;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.sm }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Video Studio</Text>
          <View style={styles.headerBadge}>
            <Ionicons name="videocam" size={20} color={theme.gold} />
          </View>
        </View>

        <Text style={styles.subtitle}>Create stunning AI-powered showcase videos from your photos</Text>

        {/* Photo upload */}
        <Pressable onPress={pickPhoto} style={({ pressed }) => [styles.uploadArea, { opacity: pressed ? 0.9 : 1 }]}>
          {photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <View style={styles.changeOverlay}>
                <Ionicons name="camera" size={18} color="#fff" />
                <Text style={styles.changeText}>Change</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="image-outline" size={28} color={theme.gold} />
              </View>
              <Text style={styles.uploadTitle}>Upload Your Photo</Text>
              <Text style={styles.uploadDesc}>Full body or product photo works best</Text>
            </View>
          )}
        </Pressable>

        {/* Aspect Ratio selector */}
        {aspectRatios.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.sectionLabel}>Aspect Ratio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ratioRow}>
              {aspectRatios.map((ratio) => {
                const active = selectedAspectRatio === ratio.id;
                return (
                  <Pressable key={ratio.id} onPress={() => setSelectedAspectRatio(ratio.id)} style={[styles.ratioChip, active && styles.ratioChipActive]}>
                    <Text style={[styles.ratioLabel, active && styles.ratioLabelActive]}>{ratio.label || ratio.ratio}</Text>
                    {ratio.description && <Text style={[styles.ratioDesc, active && styles.ratioDescActive]} numberOfLines={1}>{ratio.description}</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {/* Pose selector */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionLabel}>Choose a Pose</Text>
          {loadingPoses ? (
            <ActivityIndicator size="large" color={theme.gold} style={{ marginVertical: Spacing.xl }} />
          ) : (
            <View style={styles.poseGrid}>
              {poses.map((pose) => {
                const active = selectedPose === pose.id;
                const thumb = pose.gif_url || pose.thumbnail_url;
                return (
                  <Pressable
                    key={pose.id}
                    onPress={() => setSelectedPose(pose.id)}
                    style={[styles.poseCard, { width: POSE_SIZE }, active && styles.poseCardActive]}
                  >
                    {thumb ? (
                      <Image source={{ uri: resolveUrl(thumb) }} style={styles.poseImage} />
                    ) : (
                      <View style={[styles.poseImage, styles.posePlaceholder]}>
                        <Ionicons name="videocam-outline" size={20} color={theme.textMuted} />
                      </View>
                    )}
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.poseOverlay}>
                      <Text style={styles.poseName} numberOfLines={1}>{pose.name}</Text>
                    </LinearGradient>
                    {active && (
                      <View style={styles.poseCheck}>
                        <Ionicons name="checkmark-circle" size={22} color={theme.gold} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* Generate */}
        <View style={styles.generateSection}>
          <GoldButton
            title={isGenerating ? `Generating... ${Math.round(progress)}%` : 'Generate Video'}
            icon={isGenerating ? undefined : 'videocam'}
            onPress={handleGenerate}
            loading={isGenerating}
            disabled={!photoUri || !selectedPose || isGenerating}
            size="lg"
            fullWidth
          />
          {isGenerating && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient colors={Gradients.gold} style={[styles.progressFill, { width: `${progress}%` as any }]} />
              </View>
              <Text style={styles.progressText}>This may take 1-2 minutes. You can minimize the app.</Text>
            </View>
          )}
        </View>

        {/* Video result */}
        {videoUrl && (
          <Animated.View entering={FadeIn} style={styles.resultSection}>
            <Text style={styles.resultTitle}>Your Showcase Video</Text>
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: videoUrl }}
                style={styles.videoPlayer}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay
              />
            </View>
            <GoldButton title={saving ? "Saving..." : "Download Video"} icon="download-outline" onPress={handleDownload} loading={saving} disabled={saving} variant="outline" fullWidth />
          </Animated.View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: theme.text, letterSpacing: -0.3 },
  headerBadge: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: theme.goldMuted, borderWidth: 1, borderColor: theme.goldBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  subtitle: { fontSize: FontSize.sm, color: theme.textSecondary, marginBottom: Spacing.xl, lineHeight: 20 },

  uploadArea: { borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.borderLight, backgroundColor: theme.surface, marginBottom: Spacing.xl },
  photoContainer: { position: 'relative' },
  photoPreview: { width: '100%', aspectRatio: 3 / 4, resizeMode: 'cover' },
  changeOverlay: { position: 'absolute', bottom: Spacing.md, right: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full },
  changeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },
  uploadPlaceholder: { alignItems: 'center', paddingVertical: Spacing['4xl'] },
  uploadIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.goldMuted, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: theme.goldBorder },
  uploadTitle: { fontSize: FontSize.md, fontWeight: '700', color: theme.text },
  uploadDesc: { fontSize: FontSize.sm, color: theme.textSecondary, marginTop: 4 },

  sectionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md },
  ratioRow: { gap: Spacing.sm, marginBottom: Spacing.xl, paddingRight: Spacing.xl },
  ratioChip: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: theme.borderLight,
    backgroundColor: theme.surface, minWidth: 90, alignItems: 'center',
  },
  ratioChipActive: { backgroundColor: theme.gold, borderColor: theme.gold },
  ratioLabel: { fontSize: FontSize.sm, fontWeight: '700', color: theme.text },
  ratioLabelActive: { color: theme.textInverse },
  ratioDesc: { fontSize: 9, color: theme.textMuted, marginTop: 2 },
  ratioDescActive: { color: theme.textInverse },

  poseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
  poseCard: { borderRadius: BorderRadius.md, overflow: 'hidden', position: 'relative', aspectRatio: 3 / 4, borderWidth: 2, borderColor: 'transparent' },
  poseCardActive: { borderColor: theme.gold },
  poseImage: { width: '100%', height: '100%', resizeMode: 'cover', backgroundColor: theme.surface },
  posePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  poseOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 6, paddingBottom: 6, paddingTop: 20 },
  poseName: { fontSize: 10, fontWeight: '600', color: '#fff' },
  poseCheck: { position: 'absolute', top: 4, right: 4 },

  generateSection: { gap: Spacing.md, marginBottom: Spacing.xl },
  progressContainer: { gap: Spacing.sm },
  progressBar: { height: 4, borderRadius: 2, backgroundColor: theme.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: FontSize.xs, color: theme.textMuted, textAlign: 'center' },

  resultSection: { gap: Spacing.base },
  resultTitle: { fontSize: FontSize.lg, fontWeight: '700', color: theme.text },
  videoContainer: { borderRadius: BorderRadius.lg, overflow: 'hidden', backgroundColor: theme.surface, ...Shadows.md },
  videoPlayer: { width: '100%', aspectRatio: 9 / 16 },
});
