import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { sendLocalNotification } from '@/lib/notifications';
import { Ionicons } from '@expo/vector-icons';
import { theme, Gradients, Spacing, FontSize, BorderRadius, TAB_BAR_SPACER, Shadows } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { GoldButton } from '@/components/ui/GoldButton';
import { apiUpload, apiFetch, API_URL } from '@/lib/api';
import { GeneratingOverlay } from '@/components/GeneratingOverlay';
import { ImageResult } from '@/components/ImageResult';
import { useAuth } from '@/lib/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TryOnScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const pickImage = useCallback(async (useCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult;

    if (useCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to take a selfie.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Gallery access is needed to select a photo.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    }

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelfieUri(uri);
      setResultImageUrl(null);
      setAiFeedback(null);
      uploadSelfie(uri);
    }
  }, []);

  const uploadSelfie = async (uri: string) => {
    setIsUploading(true);
    const res = await apiUpload('/api/tryon/upload-user-photo', uri, 'file');
    setIsUploading(false);
    if (res.ok && res.data) {
      setFileId('uploaded');
    } else {
      Alert.alert('Upload Failed', (res.error as string) || 'Could not upload image');
    }
  };

  const handleGenerate = async () => {
    if (!fileId) {
      Alert.alert('Upload First', 'Please upload a selfie first.');
      return;
    }
    if (!productUrl.trim()) {
      Alert.alert('Missing URL', 'Please paste a product URL.');
      return;
    }

    setIsGenerating(true);
    setResultImageUrl(null);

    try {
      const response = await apiFetch('/api/tryon/fetch-and-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        const resultUrl = data.result_image_url || data.result_photo_url;
        if (data.generation_success && resultUrl) {
          const url = resultUrl.startsWith('http') ? resultUrl : `${API_URL}${resultUrl}`;
          setResultImageUrl(url);
          setAiFeedback(data.ai_feedback || null);
          sendLocalNotification(
            'Image Ready!',
            'Your try-on image has been generated. Open the app to view and save it.',
          );
        } else if (data.error) {
          Alert.alert('Generation Failed', data.error);
        }
      } else {
        const err = await response.json().catch(() => null);
        Alert.alert('Generation Failed', err?.detail || 'Could not generate try-on');
      }
    } catch {
      Alert.alert('Error', 'Connection failed. Please check your internet.');
    }
    setIsGenerating(false);
  };

  const showImagePicker = () => {
    Alert.alert('Upload Photo', 'Choose how to upload your selfie', [
      { text: 'Take Photo', onPress: () => pickImage(true) },
      { text: 'Choose from Gallery', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <GeneratingOverlay visible={isGenerating} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.sm }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Virtual Try-On</Text>
            <Text style={styles.subtitle}>See any outfit on yourself with AI</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="shirt" size={20} color={theme.gold} />
          </View>
        </View>

        {/* Steps indicator */}
        <View style={styles.stepsRow}>
          <View style={[styles.stepPill, fileId ? styles.stepDone : styles.stepActive]}>
            <Ionicons
              name={fileId ? 'checkmark-circle' : 'camera-outline'}
              size={14}
              color={fileId ? theme.success : theme.gold}
            />
            <Text style={[styles.stepText, (fileId || !fileId) && styles.stepTextActive]}>
              1. Upload Photo
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={[styles.stepPill, resultImageUrl ? styles.stepDone : productUrl.trim() ? styles.stepActive : null]}>
            <Ionicons
              name={resultImageUrl ? 'checkmark-circle' : 'link-outline'}
              size={14}
              color={resultImageUrl ? theme.success : productUrl.trim() ? theme.gold : theme.textMuted}
            />
            <Text style={[styles.stepText, (productUrl.trim() || resultImageUrl) && styles.stepTextActive]}>
              2. Product URL
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={[styles.stepPill, resultImageUrl ? styles.stepDone : null]}>
            <Ionicons
              name={resultImageUrl ? 'checkmark-circle' : 'sparkles-outline'}
              size={14}
              color={resultImageUrl ? theme.success : theme.textMuted}
            />
            <Text style={[styles.stepText, resultImageUrl && styles.stepTextActive]}>
              3. Generate
            </Text>
          </View>
        </View>

        {/* Selfie upload area */}
        <Pressable
          onPress={showImagePicker}
          style={({ pressed }) => [styles.uploadArea, { opacity: pressed ? 0.9 : 1 }]}
        >
          {selfieUri ? (
            <View style={styles.selfieContainer}>
              <Image source={{ uri: selfieUri }} style={styles.selfieImage} />
              {isUploading && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="large" color={theme.gold} />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
              {fileId && !isUploading && (
                <View style={styles.uploadedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={styles.uploadedText}>Ready</Text>
                </View>
              )}
              <Pressable
                onPress={showImagePicker}
                style={({ pressed }) => [styles.changePhotoButton, { opacity: pressed ? 0.8 : 1 }]}
              >
                <Ionicons name="camera" size={16} color="#fff" />
                <Text style={styles.changePhotoText}>Change</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="camera-outline" size={32} color={theme.gold} />
              </View>
              <Text style={styles.uploadTitle}>Upload Your Photo</Text>
              <Text style={styles.uploadDesc}>Take a selfie or choose from gallery</Text>
              <View style={styles.uploadHint}>
                <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
                <Text style={styles.uploadHintText}>Full body photos work best</Text>
              </View>
            </View>
          )}
        </Pressable>

        {/* Product URL */}
        <Input
          icon="link-outline"
          label="Product URL"
          placeholder="Paste product URL here..."
          value={productUrl}
          onChangeText={setProductUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        {/* Generate button */}
        <View style={styles.generateSection}>
          <GoldButton
            title={isGenerating ? 'Generating...' : 'Generate Try-On'}
            icon={isGenerating ? undefined : 'sparkles'}
            onPress={handleGenerate}
            loading={isGenerating}
            disabled={!fileId || isGenerating}
            size="lg"
            fullWidth
          />
          <Text style={styles.privacyNote}>
            <Ionicons name="shield-checkmark-outline" size={12} color={theme.textMuted} /> Your photos are processed securely
          </Text>
        </View>

        {/* Result */}
        {resultImageUrl && (
          <View style={styles.resultSection}>
            <ImageResult imageUrl={resultImageUrl} title="Your Try-On Result" aiFeedback={aiFeedback} />
          </View>
        )}

        <View style={{ height: TAB_BAR_SPACER }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: theme.textSecondary,
    marginTop: 4,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.goldMuted,
    borderWidth: 1,
    borderColor: theme.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Steps
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: theme.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  stepActive: {},
  stepDone: {},
  stepConnector: {
    width: 20,
    height: 1,
    backgroundColor: theme.borderLight,
    marginHorizontal: 4,
  },
  stepText: {
    fontSize: FontSize.xs,
    color: theme.textMuted,
    fontWeight: '500',
  },
  stepTextActive: {
    color: theme.textSecondary,
  },

  // Upload area
  uploadArea: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    borderWidth: 1.5,
    borderColor: theme.borderLight,
    borderStyle: 'dashed',
    backgroundColor: theme.surface,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: theme.goldBorder,
  },
  uploadTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: theme.text,
  },
  uploadDesc: {
    fontSize: FontSize.sm,
    color: theme.textSecondary,
    marginTop: 4,
  },
  uploadHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
    backgroundColor: theme.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  uploadHintText: {
    fontSize: FontSize.xs,
    color: theme.textMuted,
  },
  selfieContainer: {
    position: 'relative',
  },
  selfieImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    resizeMode: 'cover',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  uploadedBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  uploadedText: {
    color: theme.success,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  changePhotoText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  // Generate
  generateSection: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  privacyNote: {
    fontSize: FontSize.xs,
    color: theme.textMuted,
    textAlign: 'center',
  },

  // Result
  resultSection: {
    marginTop: Spacing.xl,
  },
});
