import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { sendLocalNotification } from '@/lib/notifications';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme, Gradients, Spacing, FontSize, BorderRadius, TAB_BAR_SPACER, Shadows } from '@/constants/theme';
import { apiUpload, apiFetch, apiGet, API_URL } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GeneratingOverlay } from '@/components/GeneratingOverlay';
import { ImageResult } from '@/components/ImageResult';
import { GoldButton } from '@/components/ui/GoldButton';
import { useAuth } from '@/lib/auth';

type Tab = 'stylist' | 'poses';

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

const PRESET_THUMBNAIL_MAP: Record<string, ReturnType<typeof require>> = {
  'confident-standing': require('@/assets/images/poses/confident-standing.jpg'),
  'confident_standing': require('@/assets/images/poses/confident-standing.jpg'),
  'executive-walk': require('@/assets/images/poses/executive-walk.jpg'),
  'executive_walk': require('@/assets/images/poses/executive-walk.jpg'),
  'business-portrait': require('@/assets/images/poses/business-portrait.jpg'),
  'business_portrait': require('@/assets/images/poses/business-portrait.jpg'),
  'over-the-shoulder': require('@/assets/images/poses/over-the-shoulder.jpg'),
  'over_the_shoulder': require('@/assets/images/poses/over-the-shoulder.jpg'),
  'casual-lean': require('@/assets/images/poses/casual-lean.jpg'),
  'casual_lean': require('@/assets/images/poses/casual-lean.jpg'),
  'relaxed-seated': require('@/assets/images/poses/relaxed-seated.jpg'),
  'relaxed_seated': require('@/assets/images/poses/relaxed-seated.jpg'),
  'hands-in-pockets': require('@/assets/images/poses/hands-in-pockets.jpg'),
  'hands_in_pockets': require('@/assets/images/poses/hands-in-pockets.jpg'),
  'street-stroll': require('@/assets/images/poses/street-stroll.jpg'),
  'street_stroll': require('@/assets/images/poses/street-stroll.jpg'),
  'window-gaze': require('@/assets/images/poses/window-gaze.jpg'),
  'window_gaze': require('@/assets/images/poses/window-gaze.jpg'),
  'model-turn': require('@/assets/images/poses/model-turn.jpg'),
  'model_turn': require('@/assets/images/poses/model-turn.jpg'),
  'dramatic-profile': require('@/assets/images/poses/dramatic-profile.jpg'),
  'dramatic_profile': require('@/assets/images/poses/dramatic-profile.jpg'),
  'floor-pose': require('@/assets/images/poses/floor-pose.jpg'),
  'floor_pose': require('@/assets/images/poses/floor-pose.jpg'),
  'coffee-shop': require('@/assets/images/poses/coffee-shop.jpg'),
  'coffee_shop': require('@/assets/images/poses/coffee-shop.jpg'),
  'urban-background': require('@/assets/images/poses/urban-background.jpg'),
  'urban_background': require('@/assets/images/poses/urban-background.jpg'),
  'sunlight-portrait': require('@/assets/images/poses/sunlight-portrait.jpg'),
  'sunlight_portrait': require('@/assets/images/poses/sunlight-portrait.jpg'),
  'action-stride': require('@/assets/images/poses/action-stride.jpg'),
  'action_stride': require('@/assets/images/poses/action-stride.jpg'),
  'wind-blown': require('@/assets/images/poses/wind-blown.jpg'),
  'wind_blown': require('@/assets/images/poses/wind-blown.jpg'),
  'staircase-pose': require('@/assets/images/poses/staircase-pose.jpg'),
  'staircase_pose': require('@/assets/images/poses/staircase-pose.jpg'),
  'jump-shot': require('@/assets/images/poses/jump-shot.jpg'),
  'jump_shot': require('@/assets/images/poses/jump-shot.jpg'),
  'dance-move': require('@/assets/images/poses/dance-move.jpg'),
  'dance_move': require('@/assets/images/poses/dance-move.jpg'),
};

type StylistCategoryId = 'ai_stylist' | 'travel' | 'search';

const STYLIST_CATEGORIES: {
  id: StylistCategoryId;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
}[] = [
  { id: 'ai_stylist', title: 'AI Stylist', subtitle: 'Style scores, color analysis, outfit ideas', icon: 'sparkles', accent: '#c9a96e' },
  { id: 'travel', title: 'Travel & Packing', subtitle: 'Trip outfits, packing lists & destination tips', icon: 'location-outline', accent: '#e8618c' },
  { id: 'search', title: 'Search Products', subtitle: 'Find fashion items with AI recommendations', icon: 'search', accent: '#3b82f6' },
];

const STYLIST_WELCOME: Record<StylistCategoryId, string> = {
  ai_stylist: "I'm ready to analyze your style! Ask me about color matching, outfit ideas, or style scores.",
  travel: "Planning a trip? Tell me your destination and I'll help with outfit packing lists!",
  search: "What kind of fashion items are you looking for? I'll find the best matches.",
};

export default function StyleScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const POSE_SIZE = (width - Spacing.xl * 2 - Spacing.sm * 2) / 3;
  const [tab, setTab] = useState<Tab>(params.tab === 'poses' ? 'poses' : 'stylist');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedPresetIds, setSelectedPresetIds] = useState<Set<number>>(new Set());
  const [posePhotoUri, setPosePhotoUri] = useState<string | null>(null);
  const [poseResults, setPoseResults] = useState<string[]>([]);
  const [poseFeedback, setPoseFeedback] = useState<string | null>(null);
  const [isGeneratingPose, setIsGeneratingPose] = useState(false);
  const [stylistPhotoUri, setStylistPhotoUri] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posePresets, setPosePresets] = useState<PosePreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [poseCategory, setPoseCategory] = useState<string>('all');

  const loadPosePresets = useCallback(async () => {
    setLoadingPresets(true);
    const res = await apiGet<PosePreset[]>('/api/pose/presets');
    if (res.ok && res.data) setPosePresets(res.data);
    setLoadingPresets(false);
  }, []);

  useEffect(() => { if (params.tab === 'poses') setTab('poses'); }, [params.tab]);
  useEffect(() => { loadPosePresets(); }, [loadPosePresets]);

  const poseCategories = ['all', ...Array.from(new Set(posePresets.map((p) => p.category)))];
  const filteredPresets = poseCategory === 'all' ? posePresets : posePresets.filter((p) => p.category === poseCategory);

  const clearStylistSession = () => {
    setStylistPhotoUri(null);
    setSelectedCategory(null);
    setConversationId(null);
    setMessages([]);
    setChatInput('');
  };

  const pickStylistPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setStylistPhotoUri(uri);
      const res = await apiUpload('/api/stylist/upload-photo', uri, 'file');
      if (res.ok && res.data) {
        const data = res.data as { id?: number };
        if (data.id) setConversationId(data.id);
        setSelectedCategory(null);
        setMessages([]);
      } else {
        Alert.alert('Upload failed', (res.error as string) || 'Could not upload your photo.');
        setStylistPhotoUri(null);
        setConversationId(null);
      }
    }
  };

  const selectStylistCategory = (id: StylistCategoryId) => {
    setSelectedCategory(id);
    setMessages([{ role: 'ai', text: STYLIST_WELCOME[id] }]);
    setChatInput('');
  };

  const ensureConversation = async (): Promise<number | null> => {
    if (conversationId) return conversationId;
    try {
      const response = await apiFetch('/api/stylist/start-from-tryon', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setConversationId(data.id);
        return data.id;
      }
    } catch {}
    if (stylistPhotoUri) {
      const uploadRes = await apiUpload('/api/stylist/upload-photo', stylistPhotoUri, 'file');
      if (uploadRes.ok && uploadRes.data) {
        const data = uploadRes.data as { id?: number };
        if (data.id) { setConversationId(data.id); return data.id; }
      }
    }
    return null;
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isSending) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const convId = await ensureConversation();
      if (!convId) {
        setMessages((prev) => [...prev, { role: 'ai', text: 'Could not start a session. Please upload your photo again.' }]);
        setIsSending(false);
        return;
      }
      const chatBody: Record<string, unknown> = { conversation_id: convId, message: userMsg };
      if (selectedCategory) chatBody.category = selectedCategory;
      const response = await apiFetch('/api/stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatBody),
      });
      if (response.ok) {
        const data = await response.json();
        const botText = data.bot_message?.content || data.response || data.message || 'No response';
        setMessages((prev) => [...prev, { role: 'ai', text: botText }]);
      } else {
        const err = await response.json().catch(() => null);
        setMessages((prev) => [...prev, { role: 'ai', text: err?.detail || 'Sorry, I could not process that.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    }
    setIsSending(false);
  };

  const pickPosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPosePhotoUri(result.assets[0].uri);
      setPoseResults([]);
    }
  };

  const togglePresetSelection = (id: number) => {
    const preset = posePresets.find((p) => p.id === id);
    if (preset?.is_premium && !user?.is_pro) {
      Alert.alert('Pro Feature', 'Premium poses are available for Pro members. Upgrade to unlock all poses.');
      return;
    }
    setSelectedPresetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else {
        if (next.size >= 3) { Alert.alert('Limit Reached', 'You can select up to 3 poses at a time.'); return prev; }
        next.add(id);
      }
      return next;
    });
  };

  const generatePose = async () => {
    if (!posePhotoUri || selectedPresetIds.size === 0) {
      Alert.alert('Missing', 'Please select a photo and at least one pose.');
      return;
    }
    setIsGeneratingPose(true);
    const res = await apiUpload('/api/pose/generate-from-presets', posePhotoUri, 'file', {
      preset_ids: JSON.stringify(Array.from(selectedPresetIds)),
    });
    setIsGeneratingPose(false);
    if (res.ok && res.data) {
      const data = res.data as { generated_image_urls?: string[] };
      if (data.generated_image_urls && data.generated_image_urls.length > 0) {
        const urls = data.generated_image_urls.map((url) => url.startsWith('http') ? url : `${API_URL}${url}`);
        setPoseResults(urls);
        setPoseFeedback((res.data as any)?.ai_feedback || null);
        const count = urls.length;
        sendLocalNotification('Image Ready!', `Your ${count > 1 ? `${count} poses are` : 'pose is'} ready.`);
      }
    } else {
      Alert.alert('Error', (res.error as string) || 'Generation failed');
    }
  };

  const stylistCategoryTitle = selectedCategory === 'ai_stylist' ? 'AI Stylist' : selectedCategory === 'travel' ? 'Travel & Packing' : selectedCategory === 'search' ? 'Search Products' : '';

  return (
    <View style={styles.container}>
      <GeneratingOverlay visible={isGeneratingPose} message="Transforming your pose..." />

      {/* Header + tabs */}
      <View style={[styles.headerArea, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.headerTitle}>Style</Text>
        <View style={styles.tabRow}>
          {([['stylist', 'sparkles-outline', 'AI Stylist'], ['poses', 'camera-outline', 'Pose Studio']] as const).map(([t, icon, label]) => (
            <Pressable
              key={t}
              onPress={() => setTab(t as Tab)}
              style={[styles.tabButton, tab === t && styles.tabButtonActive]}
            >
              <Ionicons name={icon as any} size={16} color={tab === t ? theme.textInverse : theme.textSecondary} />
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === 'stylist' ? (
        stylistPhotoUri === null ? (
          <ScrollView style={s.flex} contentContainerStyle={styles.stylistOnboard} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeIn} style={styles.stylistOnboardInner}>
              <View style={styles.stylistIconBadge}>
                <Ionicons name="sparkles" size={36} color={theme.gold} />
              </View>
              <Text style={styles.stylistHeroTitle}>AI Fashion Stylist</Text>
              <Text style={styles.stylistHeroSub}>Get personalized styling advice, outfit ideas & product recommendations</Text>
              <Pressable onPress={pickStylistPhoto} style={styles.stylistUploadArea}>
                <Ionicons name="camera-outline" size={36} color={theme.gold} />
                <Text style={styles.stylistUploadText}>Upload Your Photo</Text>
                <Text style={styles.stylistUploadHint}>Full body or outfit photo works best</Text>
              </Pressable>
              <GoldButton title="Choose Photo" icon="image-outline" onPress={pickStylistPhoto} size="lg" fullWidth />
              <Text style={styles.privacyNote}>Your photo is used only for styling analysis and is never shared.</Text>
            </Animated.View>
          </ScrollView>
        ) : selectedCategory === null ? (
          <ScrollView style={s.flex} contentContainerStyle={styles.categoryScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.photoRow}>
              <Image source={{ uri: stylistPhotoUri }} style={styles.photoThumb} />
              <View style={s.flex}>
                <Text style={styles.photoReady}>Photo uploaded</Text>
                <Text style={styles.photoReadySub}>Choose a styling mode below</Text>
                <Pressable onPress={clearStylistSession}><Text style={styles.changeBtn}>Change photo</Text></Pressable>
              </View>
            </View>
            <View style={styles.categoryGrid}>
              {STYLIST_CATEGORIES.map((cat, i) => (
                <Pressable key={cat.id} onPress={() => selectStylistCategory(cat.id)} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
                  <Animated.View entering={FadeInDown.delay(i * 60)} style={styles.categoryCard}>
                    <View style={[styles.categoryIcon, { backgroundColor: cat.accent + '18' }]}>
                      <Ionicons name={cat.icon} size={24} color={cat.accent} />
                    </View>
                    <View style={s.flex}>
                      <Text style={styles.categoryTitle}>{cat.title}</Text>
                      <Text style={styles.categorySub}>{cat.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                  </Animated.View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : (
          <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}>
            <View style={s.flex}>
              <View style={styles.chatHeader}>
                <Pressable onPress={() => { setSelectedCategory(null); setMessages([]); setChatInput(''); }} style={styles.chatBack} hitSlop={8}>
                  <Ionicons name="chevron-back" size={22} color={theme.text} />
                  <Text style={styles.chatBackText}>Back</Text>
                </Pressable>
                <Text style={styles.chatHeaderTitle} numberOfLines={1}>{stylistCategoryTitle}</Text>
                <View style={{ width: 56 }} />
              </View>
              <ScrollView style={s.flex} contentContainerStyle={styles.chatMsgContent} keyboardShouldPersistTaps="handled">
                {messages.map((msg, i) => (
                  <Animated.View key={i} entering={FadeInDown.delay(Math.min(i * 50, 200))} style={[styles.chatBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                    <Text style={[styles.chatBubbleText, msg.role === 'user' && styles.userBubbleText]}>
                      {msg.text.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) return <Text key={j} style={{ fontWeight: '700', color: theme.gold }}>{part.slice(2, -2)}</Text>;
                        return <Text key={j}>{part}</Text>;
                      })}
                    </Text>
                  </Animated.View>
                ))}
                {isSending && (
                  <View style={[styles.chatBubble, styles.aiBubble]}><ActivityIndicator size="small" color={theme.gold} /></View>
                )}
              </ScrollView>
              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Ask me anything about style..."
                  placeholderTextColor={theme.placeholder}
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                  multiline
                  selectionColor={theme.gold}
                />
                <Pressable onPress={sendMessage} disabled={isSending || !chatInput.trim()} style={({ pressed }) => [styles.sendButton, { opacity: pressed ? 0.7 : 1 }]}>
                  <Ionicons name="send" size={18} color={chatInput.trim() ? theme.gold : theme.textMuted} />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        )
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.poseContent}>
          {/* Upload */}
          <Pressable onPress={pickPosePhoto} style={({ pressed }) => [styles.poseUpload, { opacity: pressed ? 0.9 : 1 }]}>
            {posePhotoUri ? (
              <Image source={{ uri: posePhotoUri }} style={styles.poseUploadImage} />
            ) : (
              <View style={styles.poseUploadPlaceholder}>
                <View style={styles.poseUploadIcon}>
                  <Ionicons name="image-outline" size={28} color={theme.gold} />
                </View>
                <Text style={styles.poseUploadText}>Select your photo</Text>
              </View>
            )}
          </Pressable>

          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.poseCategoryScroll} contentContainerStyle={styles.poseCategoryRow}>
            {poseCategories.map((cat) => (
              <Pressable key={cat} onPress={() => setPoseCategory(cat)} style={[styles.poseCatChip, poseCategory === cat && styles.poseCatChipActive]}>
                <Text style={[styles.poseCatText, poseCategory === cat && styles.poseCatTextActive]}>
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.poseGridTitle}>
            Choose Poses ({selectedPresetIds.size}/3) · {filteredPresets.length} available
          </Text>

          {loadingPresets ? (
            <ActivityIndicator size="large" color={theme.gold} style={{ marginVertical: Spacing.xl }} />
          ) : (
            <View style={styles.poseGrid}>
              {filteredPresets.map((preset) => {
                const isSelected = selectedPresetIds.has(preset.id);
                const localThumb = PRESET_THUMBNAIL_MAP[preset.slug];
                const imageSource = localThumb || (preset.thumbnail_url ? { uri: preset.thumbnail_url.startsWith('http') ? preset.thumbnail_url : `${API_URL}${preset.thumbnail_url}` } : null);
                return (
                  <Pressable
                    key={preset.id}
                    onPress={() => togglePresetSelection(preset.id)}
                    style={[styles.poseGridItem, { width: POSE_SIZE, height: POSE_SIZE * 1.3 }, isSelected && styles.poseGridItemSelected]}
                  >
                    {imageSource ? (
                      <Image source={imageSource} style={styles.poseGridImage} />
                    ) : (
                      <LinearGradient
                        colors={preset.is_premium
                          ? ['rgba(201,169,110,0.15)', 'rgba(201,169,110,0.05)']
                          : ['rgba(100,100,140,0.15)', 'rgba(60,60,80,0.08)']}
                        style={[styles.poseGridImage, styles.poseGridPlaceholder]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      >
                        <View style={styles.placeholderIconBg}>
                          <Ionicons name={preset.is_premium ? 'diamond-outline' : 'body-outline'} size={24} color={preset.is_premium ? theme.gold : theme.textMuted} />
                        </View>
                      </LinearGradient>
                    )}
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.poseGridOverlay}>
                      <Text style={styles.poseGridName} numberOfLines={1}>{preset.name}</Text>
                    </LinearGradient>
                    {isSelected && (
                      <View style={styles.poseCheck}>
                        <Ionicons name="checkmark-circle" size={22} color={theme.gold} />
                      </View>
                    )}
                    {preset.is_premium && (
                      <View style={styles.premiumBadge}>
                        <Ionicons name="diamond" size={10} color={theme.gold} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={{ marginTop: Spacing.lg }}>
            <GoldButton
              title={`Generate ${selectedPresetIds.size > 0 ? `${selectedPresetIds.size} Pose${selectedPresetIds.size > 1 ? 's' : ''}` : 'Pose'}`}
              icon="sparkles"
              onPress={generatePose}
              loading={isGeneratingPose}
              disabled={!posePhotoUri || selectedPresetIds.size === 0 || isGeneratingPose}
              size="lg"
              fullWidth
            />
          </View>

          {poseResults.map((url, i) => (
            <ImageResult key={`${url}-${i}`} imageUrl={url} title={poseResults.length > 1 ? `Pose Result ${i + 1}` : 'Your Pose Result'} aiFeedback={i === 0 ? poseFeedback : null} />
          ))}

          <View style={{ height: TAB_BAR_SPACER }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({ flex: { flex: 1 } });

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  headerArea: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: theme.text, marginBottom: Spacing.md, letterSpacing: -0.3 },
  tabRow: { flexDirection: 'row', gap: Spacing.sm },
  tabButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: theme.borderLight, backgroundColor: theme.surface,
  },
  tabButtonActive: { backgroundColor: theme.gold, borderColor: theme.gold },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: theme.textSecondary },
  tabTextActive: { color: theme.textInverse },

  // Stylist onboarding
  stylistOnboard: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingBottom: Spacing['2xl'] },
  stylistOnboardInner: { paddingTop: Spacing['2xl'], alignItems: 'center', gap: Spacing.base },
  stylistIconBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.goldMuted, borderWidth: 1, borderColor: theme.goldBorder, justifyContent: 'center', alignItems: 'center' },
  stylistHeroTitle: { fontSize: FontSize['2xl'], fontWeight: '800', color: theme.text, textAlign: 'center' },
  stylistHeroSub: { fontSize: FontSize.sm, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.md },
  stylistUploadArea: {
    width: '100%', minHeight: 140, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.borderLight,
    alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface, paddingVertical: Spacing.xl, gap: Spacing.sm, marginTop: Spacing.sm,
  },
  stylistUploadText: { fontSize: FontSize.md, fontWeight: '600', color: theme.text },
  stylistUploadHint: { fontSize: FontSize.xs, color: theme.textMuted },
  privacyNote: { fontSize: FontSize.xs, color: theme.textMuted, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 18 },

  // Category selection
  categoryScroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['2xl'] },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl, marginTop: Spacing.base },
  photoThumb: { width: 64, height: 84, borderRadius: BorderRadius.md, backgroundColor: theme.surface },
  photoReady: { fontSize: FontSize.sm, fontWeight: '700', color: theme.text },
  photoReadySub: { fontSize: FontSize.xs, color: theme.textSecondary, marginTop: 2 },
  changeBtn: { fontSize: FontSize.sm, fontWeight: '700', color: theme.gold, marginTop: Spacing.xs },
  categoryGrid: { gap: Spacing.md },
  categoryCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: theme.card, borderRadius: BorderRadius.lg, padding: Spacing.base,
    borderWidth: 1, borderColor: theme.border,
  },
  categoryIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  categoryTitle: { fontSize: FontSize.base, fontWeight: '700', color: theme.text },
  categorySub: { fontSize: FontSize.xs, color: theme.textSecondary, marginTop: 2, lineHeight: 18 },

  // Chat
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  chatBack: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  chatBackText: { fontSize: FontSize.base, fontWeight: '600', color: theme.text },
  chatHeaderTitle: { flex: 1, fontSize: FontSize.md, fontWeight: '700', color: theme.text, textAlign: 'center' },
  chatMsgContent: { paddingTop: Spacing.base, paddingBottom: Spacing.base, paddingHorizontal: Spacing.xl },
  chatBubble: { maxWidth: '80%', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: theme.gold },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  chatBubbleText: { fontSize: FontSize.base, color: theme.textSecondary, lineHeight: 22 },
  userBubbleText: { color: theme.textInverse },
  chatInputRow: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : TAB_BAR_SPACER + 12,
    borderTopWidth: 1, borderTopColor: theme.border, gap: Spacing.sm, backgroundColor: theme.background,
  },
  chatInput: {
    flex: 1, fontSize: FontSize.base, color: theme.text, minHeight: 44, maxHeight: 100,
    backgroundColor: theme.inputBg, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    borderWidth: 1, borderColor: theme.inputBorder,
  },
  sendButton: { padding: Spacing.sm, width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 22, borderWidth: 1, borderColor: theme.border },

  // Pose studio
  poseContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },
  poseUpload: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.borderLight, marginBottom: Spacing.base, backgroundColor: theme.surface },
  poseUploadPlaceholder: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  poseUploadIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.goldMuted, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  poseUploadText: { fontSize: FontSize.sm, color: theme.textSecondary },
  poseUploadImage: { width: '100%', height: 200, resizeMode: 'cover' },
  poseCategoryScroll: { marginBottom: Spacing.md },
  poseCategoryRow: { gap: Spacing.sm },
  poseCatChip: { paddingHorizontal: Spacing.base, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: theme.borderLight, backgroundColor: theme.surface },
  poseCatChipActive: { backgroundColor: theme.gold, borderColor: theme.gold },
  poseCatText: { fontSize: FontSize.sm, color: theme.textSecondary, fontWeight: '500' },
  poseCatTextActive: { color: theme.textInverse, fontWeight: '600' },
  poseGridTitle: { fontSize: FontSize.sm, fontWeight: '700', color: theme.textSecondary, marginBottom: Spacing.md },
  poseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  poseGridItem: { borderRadius: BorderRadius.md, overflow: 'hidden', position: 'relative', borderWidth: 2, borderColor: 'transparent' },
  poseGridItemSelected: { borderColor: theme.gold },
  poseGridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  poseGridPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  poseGridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 6, paddingBottom: 6, paddingTop: 20 },
  poseGridName: { fontSize: 10, fontWeight: '600', color: '#fff' },
  poseCheck: { position: 'absolute', top: 4, right: 4 },
  premiumBadge: { position: 'absolute', top: 4, left: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
});
