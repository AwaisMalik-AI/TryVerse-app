import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { sendLocalNotification } from '@/lib/notifications';
import { Ionicons } from '@expo/vector-icons';
import { theme, Gradients, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { apiGet, apiFetch, apiUpload, API_URL } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GeneratingOverlay } from '@/components/GeneratingOverlay';
import { ImageResult } from '@/components/ImageResult';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { useAuth } from '@/lib/auth';

interface Product {
  id: number;
  name: string;
  brand: string | null;
  image_url: string;
  price: string | null;
  source_url?: string | null;
  store_id?: number;
  sizes?: { size: string; available: boolean }[];
}

export default function StoreTryOnScreen() {
  const { user } = useAuth();
  const [showProPopup, setShowProPopup] = useState(false);
  const { product: productId, store: storeId } = useLocalSearchParams<{
    product: string;
    store: string;
  }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [bodyType, setBodyType] = useState<'full_body' | 'upper_body'>('full_body');

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    if (!productId || !storeId) {
      setLoading(false);
      return;
    }
    const res = await apiGet<Product[]>(`/api/store/brands/${storeId}/products`);
    if (res.ok && res.data) {
      const found = res.data.find((p) => p.id === parseInt(productId));
      if (found) setProduct(found);
      else Alert.alert('Not Found', 'This product could not be found.');
    } else {
      Alert.alert('Error', 'Could not load product details.');
    }
    setLoading(false);
  };

  const pickImage = async (useCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult;
    if (useCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelfieUri(uri);
      setResultImageUrl(null);
      uploadSelfie(uri);
    }
  };

  const uploadSelfie = async (uri: string) => {
    if (__DEV__) console.log('[UPLOAD] Store Try-On: upload started');
    setIsUploading(true);
    const res = await apiUpload(
      `/api/store/upload-user-image?body_type=${bodyType}`,
      uri,
      'file',
    );
    if (res.ok && res.data) {
      const data = res.data as { session_id?: number };
      if (__DEV__) console.log('[UPLOAD] Store Try-On: upload completed', { sessionId: data.session_id });
      setSessionId(data.session_id ?? null);
    } else {
      if (__DEV__) console.log('[UPLOAD] Store Try-On: upload failed', { error: res.error });
      Alert.alert('Upload Failed', res.error || 'Could not upload image');
    }
    setIsUploading(false);
  };

  const handleGenerate = async () => {
    if (!sessionId || !productId) return;
    const endpoint = `${API_URL}/api/store/try-on`;
    if (__DEV__) console.log('[GENERATION] Store Try-On: generation started', { endpoint, productId, sessionId });
    setIsGenerating(true);

    const MAX_RETRIES = 4;
    const RETRY_DELAY = 15000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await apiFetch('/api/store/try-on', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: parseInt(productId),
            session_id: sessionId,
            store_id: storeId ? parseInt(storeId) : undefined,
          }),
        });
        if (__DEV__) console.log('[GENERATION] Store Try-On: response received', { status: response.status, ok: response.ok, attempt });

        if (response.ok) {
          const data = await response.json();
          if (data.output_file_id) {
            if (__DEV__) console.log('[GENERATION] Store Try-On: generation completed', { outputFileId: data.output_file_id });
            setResultImageUrl(`${API_URL}/api/store/download/${data.output_file_id}`);
            setAiFeedback(data.ai_feedback || null);
            sendLocalNotification('Image Ready!', 'Your store try-on is ready. Open the app to view and save it.');
            Alert.alert(
              'Image Ready!',
              'Your store try-on image has been generated. Save it to your gallery before leaving.'
            );
            if (!user?.is_pro) {
              setTimeout(() => setShowProPopup(true), 2000);
            }
          }
          break;
        } else if (response.status === 409 && attempt < MAX_RETRIES) {
          if (__DEV__) console.log(`[GENERATION] Store Try-On: 409 conflict, retrying in ${RETRY_DELAY / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          continue;
        } else {
          const err = await response.json().catch(() => null);
          if (__DEV__) console.log('[GENERATION] Store Try-On: generation failed', { endpoint, status: response.status, err });
          Alert.alert('Error', err?.detail || 'Generation failed');
          break;
        }
      } catch (e) {
        if (__DEV__) console.log('[GENERATION] Store Try-On: generation error', { endpoint, error: e, attempt });
        if (attempt < MAX_RETRIES) {
          if (__DEV__) console.log(`[GENERATION] Retrying after connection error in ${RETRY_DELAY / 1000}s`);
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          continue;
        }
        Alert.alert('Error', 'Connection failed. Please check your connection and try again.');
        break;
      }
    }
    setIsGenerating(false);
  };

  const resolveImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.gold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GeneratingOverlay visible={isGenerating} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Store Try-On</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Product Info */}
        {product && (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.productCard}>
            <Image
              source={{ uri: resolveImageUrl(product.image_url) }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              {product.price && <Text style={styles.productPrice}>{product.price}</Text>}
              {product.sizes && product.sizes.length > 0 && (
                <View style={styles.sizesRow}>
                  {product.sizes.slice(0, 6).map((s) => (
                    <View key={s.size} style={[styles.sizeChip, !s.available && styles.sizeChipUnavailable]}>
                      <Text style={[styles.sizeChipText, !s.available && styles.sizeChipTextUnavailable]}>
                        {s.size}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Upload */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Pressable
            onPress={() =>
              Alert.alert('Upload Photo', '', [
                { text: 'Camera', onPress: () => pickImage(true) },
                { text: 'Gallery', onPress: () => pickImage(false) },
                { text: 'Cancel', style: 'cancel' },
              ])
            }
            style={styles.uploadArea}>
            {selfieUri ? (
              <View>
                <Image source={{ uri: selfieUri }} style={styles.selfiePreview} />
                {isUploading && (
                  <View style={styles.overlay}>
                    <ActivityIndicator size="large" color={theme.text} />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="camera-outline" size={32} color={theme.gold} />
                <Text style={styles.uploadText}>Upload your photo</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        {/* Generate */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Pressable
            onPress={handleGenerate}
            disabled={isGenerating || !sessionId}
            style={[styles.generateButton, (!sessionId || isGenerating) && { opacity: 0.5 }]}>
            <LinearGradient
              colors={sessionId ? Gradients.gold : [theme.border, theme.borderLight]}
              style={styles.generateGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              {isGenerating ? (
                <>
                  <ActivityIndicator color={theme.textInverse} />
                  <Text style={styles.generateText}>Generating...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color={theme.textInverse} />
                  <Text style={styles.generateText}>Try It On</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Result */}
        {resultImageUrl && (
          <ImageResult imageUrl={resultImageUrl} title="Your Store Try-On" aiFeedback={aiFeedback} />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      <ProUpgradeModal visible={showProPopup} onClose={() => setShowProPopup(false)} variant="compact" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  scrollContent: { paddingHorizontal: Spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: FontSize.md, fontWeight: '700', color: theme.text },
  productCard: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  productImage: { width: 100, height: 120, resizeMode: 'cover' },
  productInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  productName: { fontSize: FontSize.base, fontWeight: '600', color: theme.text },
  productPrice: { fontSize: FontSize.base, fontWeight: '700', color: theme.gold, marginTop: 4 },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: Spacing.sm },
  sizeChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sizeChipUnavailable: { opacity: 0.4 },
  sizeChipText: { fontSize: 10, color: theme.text },
  sizeChipTextUnavailable: { textDecorationLine: 'line-through' },
  uploadArea: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.border,
    marginBottom: Spacing.xl,
  },
  uploadPlaceholder: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  uploadText: { fontSize: FontSize.sm, color: theme.textSecondary, marginTop: Spacing.sm },
  selfiePreview: { width: '100%', height: 250, resizeMode: 'cover' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: theme.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  generateText: { fontSize: FontSize.md, fontWeight: '700', color: theme.textInverse },
});
