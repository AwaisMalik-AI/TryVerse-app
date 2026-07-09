import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Text, TextInput as RNTextInput, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { apiGet, apiUpload, apiFetch, API_URL, getToken, authUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type StoreBrand = {
  id: number;
  name: string;
  product_count: number;
  preview_images: string[];
};

type StoreProduct = {
  id: number;
  store_id: number;
  store_name: string;
  name: string;
  brand: string | null;
  description: string | null;
  gender: string;
  price: string;
  image_url: string;
  source_url: string;
};

function resolveUrl(u: string | null | undefined): string {
  if (!u) return '';
  return u.startsWith('http') ? u : `${API_URL}${u}`;
}

function initialsFromName(name?: string | null): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

export default function TryOnScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [tab, setTab] = useState<'link' | 'browse'>('browse');
  const [linkUrl, setLinkUrl] = useState('');

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const initials = initialsFromName(user?.full_name);

  const outfitChosen = tab === 'link' ? !!linkUrl.trim() : !!selectedProduct;
  const step = !photo ? 1 : !outfitChosen ? 2 : 3;
  const canGenerate = !!photo && outfitChosen && !generating && !uploading;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoadingProducts(true);
    setProductsError(null);
    const brandsRes = await apiGet<StoreBrand[]>('/api/store/brands');
    if (!brandsRes.ok || !brandsRes.data) {
      setProductsError(brandsRes.error || 'Could not load store products.');
      setLoadingProducts(false);
      return;
    }
    const brands = brandsRes.data.filter((b) => b.product_count > 0);
    if (brands.length === 0) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }
    const prodRes = await apiGet<StoreProduct[]>(`/api/store/brands/${brands[0].id}/products?limit=10&offset=0`);
    if (!prodRes.ok || !prodRes.data) {
      setProductsError(prodRes.error || 'Could not load store products.');
      setLoadingProducts(false);
      return;
    }
    setProducts(prodRes.data);
    setLoadingProducts(false);
  };

  const handlePickFile = async () => {
    setUploadError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setPhoto(uri);
    setUploaded(false);
    if (isAuthenticated) {
      await uploadTryonPhoto(uri);
    }
  };

  const uploadTryonPhoto = async (uri: string) => {
    setUploading(true);
    setUploadError(null);
    const res = await apiUpload('/api/tryon/upload-user-photo', uri, 'file');
    setUploading(false);
    if (res.ok) {
      setUploaded(true);
    } else {
      setUploadError(res.error || 'Upload failed. Please try again.');
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate || !photo) return;
    if (!isAuthenticated) {
      setError('Please sign in to generate a try-on.');
      return;
    }
    setError(null);
    if (tab === 'link') {
      await generateFromLink();
    } else {
      await generateFromStore();
    }
  };

  const generateFromLink = async () => {
    if (!photo) return;
    setGenerating(true);
    setGenStatus('Uploading your photo...');

    if (!uploaded) {
      const upRes = await apiUpload('/api/tryon/upload-user-photo', photo, 'file');
      if (!upRes.ok) {
        setGenerating(false);
        setError(upRes.error || 'Could not upload your photo.');
        return;
      }
      setUploaded(true);
    }

    setGenStatus('Generating your look with AI...');
    try {
      const response = await apiFetch('/api/tryon/fetch-and-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkUrl.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        const resultUrl = data.result_image_url || data.result_photo_url;
        if (data.generation_success && resultUrl) {
          setGenerating(false);
          router.push({
            pathname: '/try-on-result',
            params: {
              resultUrl: resolveUrl(resultUrl),
              sourcePhoto: photo,
              outfitName: '',
              aiFeedback: data.ai_feedback || '',
              sourceLink: linkUrl.trim(),
            },
          });
          return;
        }
        setGenerating(false);
        setError(data.error || 'Generation did not produce a result. Please try another URL.');
      } else {
        let msg = `Error ${response.status}`;
        try {
          const err = await response.json();
          if (typeof err.detail === 'string') msg = err.detail;
        } catch {}
        setGenerating(false);
        setError(msg);
      }
    } catch {
      setGenerating(false);
      setError('Connection failed. Please check your internet and try again.');
    }
  };

  const generateFromStore = async () => {
    if (!photo || !selectedProduct) return;
    setGenerating(true);
    setGenStatus('Uploading your photo...');

    const upRes = await apiUpload('/api/store/upload-user-image?body_type=full_body', photo, 'file');
    if (!upRes.ok || !upRes.data) {
      setGenerating(false);
      setError(upRes.error || 'Could not upload your photo.');
      return;
    }
    const sessionId = (upRes.data as { session_id?: number }).session_id;
    if (!sessionId) {
      setGenerating(false);
      setError('Upload did not return a session. Please try again.');
      return;
    }

    setGenStatus('Generating your look with AI...');
    const MAX_RETRIES = 4;
    const RETRY_DELAY = 15000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await apiFetch('/api/store/try-on', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: selectedProduct.id,
            session_id: sessionId,
            store_id: selectedProduct.store_id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.output_file_id) {
            const token = (await getToken()) || '';
            const resultUrl = authUrl(`/api/store/download/${data.output_file_id}`, token);
            setGenerating(false);
            router.push({
              pathname: '/try-on-result',
              params: {
                resultUrl,
                sourcePhoto: photo,
                outfitName: selectedProduct.name,
                outfitImage: resolveUrl(selectedProduct.image_url),
                aiFeedback: data.ai_feedback || '',
                storeName: selectedProduct.store_name || '',
                price: selectedProduct.price || '',
              },
            });
            return;
          }
          setGenerating(false);
          setError('Generation did not produce a result. Please try again.');
          return;
        } else if (response.status === 409 && attempt < MAX_RETRIES) {
          setGenStatus('Generation busy, retrying...');
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          continue;
        } else {
          let msg = `Error ${response.status}`;
          try {
            const err = await response.json();
            if (typeof err.detail === 'string') msg = err.detail;
          } catch {}
          setGenerating(false);
          setError(msg);
          return;
        }
      } catch {
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          continue;
        }
        setGenerating(false);
        setError('Connection failed. Please check your internet and try again.');
        return;
      }
    }
    setGenerating(false);
    setError('Generation is taking too long. Please try again later.');
  };

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          {initials ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          ) : (
            <View style={[styles.avatar, styles.avatarGeneric]}>
              <Ionicons name="person" size={16} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.titleSection}>
          <TypographyText variant="h1" style={styles.title}>Virtual Try-On</TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Upload your photo and see how clothes look on you before checkout.</TypographyText>
        </View>

        {!isAuthenticated && (
          <TouchableOpacity style={styles.signInBanner} onPress={() => router.push('/login')}>
            <Ionicons name="log-in-outline" size={18} color="#fff" />
            <Text style={styles.signInBannerText}>Sign in to generate your try-on</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={styles.stepIndicator}>
          {[
            { n: 1, label: 'Photo' },
            { n: 2, label: 'Outfit' },
            { n: 3, label: 'Result' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.n}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, step >= s.n && styles.stepDotActive, step === s.n && styles.stepDotCurrent]}>
                  {step > s.n ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Text style={[styles.stepDotText, step === s.n && styles.stepDotTextCurrent]}>{s.n}</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, step === s.n && styles.stepLabelCurrent]}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.stepLine, step > s.n && styles.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>

        <GlassCard style={styles.card}>
          <TypographyText variant="bodySemibold" style={styles.cardTitle}>Your Photo</TypographyText>
          {!photo ? (
            <View style={styles.uploadArea}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <TypographyText variant="bodyMedium" style={{ marginTop: 8, color: '#fff' }}>Upload your photo</TypographyText>
              <TypographyText variant="small" style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Full-body photo works best</TypographyText>

              <TouchableOpacity style={styles.secondaryBtn} onPress={handlePickFile}>
                <Text style={styles.secondaryBtnText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewArea}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              {uploading ? (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.uploadOverlayText}>Uploading...</Text>
                </View>
              ) : (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                  <Text style={styles.checkBadgeText}>Photo selected</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => { setPhoto(null); setUploaded(false); setUploadError(null); }} style={styles.changeBtn}>
                <Text style={styles.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>
          )}
          {uploadError && (
            <View style={styles.inlineError}>
              <Text style={styles.inlineErrorText}>{uploadError}</Text>
              <TouchableOpacity onPress={() => photo && uploadTryonPhoto(photo)}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        <View style={{ opacity: !photo ? 0.5 : 1 }} pointerEvents={!photo ? 'none' : 'auto'}>
          <GlassCard style={styles.card}>
            <TypographyText variant="bodySemibold" style={styles.cardTitle}>Choose Outfit</TypographyText>

            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, tab === 'link' && styles.tabActive]} onPress={() => setTab('link')}>
                <Text style={[styles.tabText, tab === 'link' && styles.tabTextActive]}>Paste Link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, tab === 'browse' && styles.tabActive]} onPress={() => setTab('browse')}>
                <Text style={[styles.tabText, tab === 'browse' && styles.tabTextActive]}>Browse Store</Text>
              </TouchableOpacity>
            </View>

            {tab === 'link' ? (
              <View style={{ marginTop: 16 }}>
                <View style={styles.inputContainer}>
                  <Ionicons name="link-outline" size={18} color="rgba(255,255,255,0.5)" />
                  <RNTextInput
                    style={styles.input}
                    placeholder="Paste clothing product URL"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={linkUrl}
                    onChangeText={setLinkUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </View>
                <Text style={styles.hintText}>Paste a product URL, then tap Generate Try-On below.</Text>
              </View>
            ) : (
              <View style={{ marginTop: 16 }}>
                {loadingProducts ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.loadingText}>Loading products...</Text>
                  </View>
                ) : productsError ? (
                  <View style={styles.inlineError}>
                    <Text style={styles.inlineErrorText}>{productsError}</Text>
                    <TouchableOpacity onPress={loadProducts}>
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : products.length === 0 ? (
                  <Text style={styles.emptyText}>No store products available right now.</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                    {products.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.outfitItem, selectedProduct?.id === p.id && styles.outfitItemActive]}
                        onPress={() => setSelectedProduct(p)}
                      >
                        <View style={styles.outfitThumb}>
                          <Image source={{ uri: resolveUrl(p.image_url) }} style={styles.outfitImg} />
                        </View>
                        <Text style={styles.outfitName} numberOfLines={1}>{p.name}</Text>
                        <View style={[styles.selectBtnBadge, selectedProduct?.id === p.id && styles.selectBtnActive]}>
                          <Text style={styles.selectBtnText}>{selectedProduct?.id === p.id ? 'Selected' : 'Select'}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {tab === 'browse' && selectedProduct && (
              <View style={styles.selectedOutfit}>
                <View style={styles.fetchedThumb}>
                  <Image source={{ uri: resolveUrl(selectedProduct.image_url) }} style={styles.fetchedImg} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: Typography.body.fontFamily }}>Selected Outfit</Text>
                  <Text style={styles.fetchedName} numberOfLines={1}>{selectedProduct.name}</Text>
                  <Text style={styles.fetchedMeta}>{selectedProduct.price}{selectedProduct.store_name ? ` · ${selectedProduct.store_name}` : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        </View>

        {error && (
          <View style={[styles.inlineError, { marginHorizontal: 20, marginTop: 16 }]}>
            <Text style={styles.inlineErrorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryBtn, !canGenerate && styles.primaryBtnDisabled]}
          onPress={handleGenerate}
          disabled={!canGenerate}
        >
          {generating ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.primaryBtnText}>{genStatus || 'Generating your look...'}</Text>
            </View>
          ) : (
            <Text style={styles.primaryBtnText}>Generate Try-On</Text>
          )}
        </TouchableOpacity>
        {generating && (
          <Text style={styles.footerNote}>This can take up to a minute. Please keep the app open.</Text>
        )}
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
  avatarGeneric: { backgroundColor: 'rgba(255,255,255,0.12)' },
  avatarText: { color: '#fff', fontSize: 12, fontFamily: Typography.heading.fontFamily },
  titleSection: { paddingHorizontal: 20, marginTop: 20 },
  title: { fontSize: 24, color: '#c084fc' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  signInBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: 'rgba(168,85,247,0.15)', borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  signInBannerText: { flex: 1, color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily },
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
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 12 },
  secondaryBtnText: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily, textAlign: 'center' },
  previewArea: { position: 'relative', height: 280, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'contain', backgroundColor: 'rgba(255,255,255,0.03)' },
  uploadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  uploadOverlayText: { color: '#fff', fontSize: 13, marginTop: 10, fontFamily: Typography.bodyMedium.fontFamily },
  checkBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkBadgeText: { color: '#fff', fontSize: 10 },
  changeBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  changeBtnText: { color: '#fff', fontSize: 11 },
  inlineError: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  inlineErrorText: { color: '#fca5a5', fontSize: 12, flex: 1 },
  retryText: { color: '#fff', fontSize: 12, fontFamily: Typography.bodyMedium.fontFamily, textDecorationLine: 'underline' },
  hintText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 10 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  loadingText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, paddingVertical: 12 },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: Typography.bodyMedium.fontFamily },
  tabTextActive: { color: '#fff' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: '#fff', fontSize: 13, marginLeft: 8 },
  fetchedThumb: { width: 44, height: 44, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)' },
  fetchedImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  fetchedName: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily },
  fetchedMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  selectBtnActive: { backgroundColor: Colors.primary },
  selectBtnText: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily },
  outfitItem: { width: 100, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'transparent' },
  outfitItemActive: { borderColor: Colors.primary, backgroundColor: 'rgba(168,85,247,0.1)' },
  outfitThumb: { width: '100%', height: 100, borderRadius: 8, overflow: 'hidden', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  outfitImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  outfitName: { color: '#fff', fontSize: 11, textAlign: 'center', marginBottom: 8 },
  selectBtnBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 4, borderRadius: 8, alignItems: 'center' },
  selectedOutfit: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 12, backgroundColor: 'rgba(168,85,247,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  primaryBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  footerNote: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginTop: 12, paddingHorizontal: 40 },
});
