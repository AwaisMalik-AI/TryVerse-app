import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiGet, apiFetch, apiUpload, API_URL, getToken, authUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Product {
  id: number;
  store_id: number;
  store_name: string;
  name: string;
  brand: string | null;
  description?: string;
  gender?: 'women' | 'men';
  price: string | null;
  image_url: string;
  source_url?: string;
}

function resolveUrl(u?: string | null): string {
  if (!u) return '';
  return u.startsWith('http') ? u : `${API_URL}${u}`;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id, storeId } = useLocalSearchParams<{ id: string; storeId: string }>();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || !storeId) {
      setError('Missing product reference.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const PAGE = 50;
    const MAX_PAGES = 20;
    let found: Product | undefined;
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await apiGet<Product[]>(`/api/store/brands/${storeId}/products?limit=${PAGE}&offset=${page * PAGE}`);
      if (!res.ok || !res.data) {
        setError(res.error || 'Could not load product details.');
        setLoading(false);
        return;
      }
      found = res.data.find((p) => String(p.id) === String(id));
      if (found || res.data.length < PAGE) break;
    }
    if (found) setProduct(found);
    else setError('This product could not be found.');
    setLoading(false);
  }, [id, storeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getToken().then(setTokenState);
  }, [isAuthenticated]);

  const pickImage = async () => {
    setUploadError(null);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelfieUri(uri);
      setResultUrl(null);
      setSessionId(null);
      await uploadSelfie(uri);
    }
  };

  const uploadSelfie = async (uri: string) => {
    setUploading(true);
    setUploadError(null);
    const res = await apiUpload('/api/store/upload-user-image?body_type=full_body', uri, 'file');
    if (res.ok && res.data) {
      const data = res.data as { session_id?: number };
      setSessionId(data.session_id ?? null);
    } else {
      setUploadError(res.error || 'Could not upload image.');
    }
    setUploading(false);
  };

  const handleGenerate = async () => {
    if (!sessionId || !product) return;
    setGenerating(true);
    setGenError(null);
    setResultUrl(null);

    const MAX_RETRIES = 4;
    const RETRY_DELAY = 15000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await apiFetch('/api/store/try-on', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: product.id,
            session_id: sessionId,
            store_id: product.store_id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.output_file_id) {
            const path = `/api/store/download/${data.output_file_id}`;
            const t = token || (await getToken());
            setResultUrl(t ? authUrl(path, t) : `${API_URL}${path}`);
            setAiFeedback(data.ai_feedback || null);
          }
          break;
        } else if (response.status === 409 && attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          continue;
        } else {
          let msg = 'Generation failed. Please try again.';
          try {
            const err = await response.json();
            if (typeof err.detail === 'string') msg = err.detail;
          } catch {}
          setGenError(msg);
          break;
        }
      } catch {
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          continue;
        }
        setGenError('Connection failed. Please check your connection and try again.');
        break;
      }
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <Screen safeArea>
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#c084fc" />
          <Text style={styles.stateText}>Loading product...</Text>
        </View>
      </Screen>
    );
  }

  if (error || !product) {
    return (
      <Screen safeArea>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TryVerseLogo height={26} width={100} />
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.stateBox}>
          <Ionicons name="alert-circle-outline" size={32} color="rgba(255,255,255,0.6)" />
          <Text style={styles.stateText}>{error || 'Product not found.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const p = product;

  return (
    <Screen safeArea>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TryVerseLogo height={26} width={100} />
          <TouchableOpacity 
            onPress={() => setSaved(!saved)} 
            style={[styles.iconBtn, saved && styles.iconBtnActive]}
          >
            <Ionicons name={saved ? "heart" : "heart-outline"} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.heroContainer}>
            <Image source={{ uri: resolveUrl(p.image_url) }} style={styles.heroImg} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.cat}>{p.brand || p.store_name}{p.gender ? ` · ${p.gender === 'women' ? 'Women' : 'Men'}` : ''}</Text>
          <Text style={styles.title}>{p.name}</Text>
          {!!p.price && <Text style={styles.price}>{p.price}</Text>}
        </View>

        {!!p.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descText}>{p.description}</Text>
          </View>
        )}

        {!!p.source_url && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(p.source_url as string)}>
              <Ionicons name="open-outline" size={16} color="#d8b4fe" />
              <Text style={styles.linkText}>View on {p.store_name}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* In-store try-on */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Try It On</Text>
          {!isAuthenticated ? (
            <View style={styles.signInBox}>
              <Text style={styles.signInText}>Sign in to try this on with your photo.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => router.push('/login')}>
                <Text style={styles.retryText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.uploadArea} onPress={pickImage} activeOpacity={0.85}>
                {selfieUri ? (
                  <View>
                    <Image source={{ uri: selfieUri }} style={styles.selfiePreview} />
                    {uploading && (
                      <View style={styles.overlay}>
                        <ActivityIndicator size="large" color="#fff" />
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera-outline" size={30} color="#d8b4fe" />
                    <Text style={styles.uploadText}>Upload your photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {!!uploadError && <Text style={styles.errorText}>{uploadError}</Text>}
            </>
          )}
        </View>

        {/* Result */}
        {generating && (
          <View style={styles.section}>
            <View style={styles.generatingBox}>
              <ActivityIndicator size="large" color="#c084fc" />
              <Text style={styles.stateText}>Generating your try-on. This can take a moment...</Text>
            </View>
          </View>
        )}
        {!!genError && !generating && (
          <View style={styles.section}>
            <Text style={styles.errorText}>{genError}</Text>
            <TouchableOpacity style={[styles.retryBtn, { alignSelf: 'flex-start', marginTop: 10 }]} onPress={handleGenerate}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {!!resultUrl && !generating && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Try-On</Text>
            <View style={styles.resultContainer}>
              <Image source={{ uri: resultUrl }} style={styles.resultImg} />
            </View>
            {!!aiFeedback && <Text style={styles.descText}>{aiFeedback}</Text>}
          </View>
        )}

        <View style={[styles.section, { gap: 10, marginTop: 30 }]}>
          {isAuthenticated ? (
            <TouchableOpacity
              style={[styles.cta, (!sessionId || generating) && { opacity: 0.5 }]}
              disabled={!sessionId || generating}
              onPress={handleGenerate}
            >
              <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
                <Text style={styles.ctaText}>{generating ? 'Generating...' : 'Try On'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cta} onPress={() => router.push('/login')}>
              <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
                <Text style={styles.ctaText}>Sign in to Try On</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.ctaSecondary} onPress={() => setSaved(!saved)}>
            <Text style={styles.ctaSecondaryText}>{saved ? "Saved" : "Save item"}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  iconBtnActive: { backgroundColor: '#c084fc', borderColor: '#d946ef' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  stateBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  stateText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'Montserrat_400Regular', textAlign: 'center', paddingHorizontal: 40 },
  retryBtn: { marginTop: 4, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 16, backgroundColor: 'rgba(124,58,237,0.4)', borderWidth: 1, borderColor: 'rgba(216,180,254,0.5)' },
  retryText: { color: '#fff', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' },
  errorText: { color: '#fca5a5', fontSize: 12.5, fontFamily: 'Montserrat_400Regular', marginTop: 8 },
  heroContainer: { width: '100%', height: 420, borderRadius: 24, overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(255,255,255,0.04)' },
  heroImg: { width: '100%', height: '100%', resizeMode: 'contain' },
  cat: { fontSize: 11, textTransform: 'uppercase', fontFamily: 'Montserrat_600SemiBold', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  title: { fontSize: 22, color: '#fff', fontFamily: 'ClashDisplay-Semibold', marginTop: 4 },
  price: { fontSize: 20, color: '#d8b4fe', fontFamily: 'ClashDisplay-Semibold', marginTop: 8 },
  sectionTitle: { fontSize: 14, color: '#fff', fontFamily: 'Montserrat_600SemiBold', marginBottom: 8 },
  descText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat_400Regular', lineHeight: 20 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkText: { color: '#d8b4fe', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' },
  signInBox: { alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  signInText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Montserrat_400Regular' },
  uploadArea: { borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)' },
  uploadPlaceholder: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  uploadText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'Montserrat_400Regular' },
  selfiePreview: { width: '100%', height: 280, resizeMode: 'contain', backgroundColor: 'rgba(255,255,255,0.03)' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,4,20,0.5)', justifyContent: 'center', alignItems: 'center' },
  generatingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  resultContainer: { width: '100%', height: 420, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 12 },
  resultImg: { width: '100%', height: '100%', resizeMode: 'contain' },
  cta: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  ctaGradient: { height: 48, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat_500Medium' },
  ctaSecondary: { height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  ctaSecondaryText: { color: 'rgba(255,255,255,0.85)', fontSize: 13.5, fontFamily: 'Montserrat_500Medium' }
});
