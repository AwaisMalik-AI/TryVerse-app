import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { Ionicons } from '@expo/vector-icons';
import { apiGet, API_URL } from '@/lib/api';

const cats = ["All", "Women", "Men"];
const PAGE_SIZE = 10;

interface Brand {
  id: number;
  name: string;
  product_count: number;
}

interface Product {
  id: number;
  store_id: number;
  store_name: string;
  name: string;
  brand: string | null;
  gender?: 'women' | 'men';
  price: string | null;
  image_url: string;
}

function resolveUrl(u?: string | null): string {
  if (!u) return '';
  return u.startsWith('http') ? u : `${API_URL}${u}`;
}

export default function StoreDetailScreen() {
  const router = useRouter();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const genderParam = cat === "Women" ? "women" : cat === "Men" ? "men" : undefined;

  const fetchPage = useCallback(async (nextOffset: number, replace: boolean, searchTerm: string, gender?: string) => {
    if (!storeId) return;
    if (replace) { setLoading(true); setError(null); } else { setLoadingMore(true); }
    let qs = `limit=${PAGE_SIZE}&offset=${nextOffset}`;
    if (gender) qs += `&gender=${gender}`;
    if (searchTerm) qs += `&search=${encodeURIComponent(searchTerm)}`;
    const res = await apiGet<Product[]>(`/api/store/brands/${storeId}/products?${qs}`);
    if (res.ok && res.data) {
      const data = res.data;
      setProducts((prev) => replace ? data : [...prev, ...data]);
      setHasMore(data.length >= PAGE_SIZE);
      setOffset(nextOffset + data.length);
    } else if (replace) {
      setError(res.error || 'Could not load products.');
    }
    if (replace) setLoading(false); else setLoadingMore(false);
  }, [storeId]);

  const loadBrand = useCallback(async () => {
    if (!storeId) return;
    const res = await apiGet<Brand[]>('/api/store/brands');
    if (res.ok && res.data) {
      const found = res.data.find((b) => String(b.id) === String(storeId));
      if (found) setBrand(found);
    }
  }, [storeId]);

  useEffect(() => {
    loadBrand();
  }, [loadBrand]);

  useEffect(() => {
    fetchPage(0, true, search.trim(), genderParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, cat]);

  const runSearch = () => {
    fetchPage(0, true, search.trim(), genderParam);
  };

  const name = brand?.name ?? "Store";

  return (
    <Screen safeArea withBottomNav>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const nearEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          if (nearEnd && hasMore && !loadingMore && !loading) {
            fetchPage(offset, false, search.trim(), genderParam);
          }
        }}
        scrollEventThrottle={200}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TryVerseLogo height={26} width={100} />
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.headingMain}>{name}</Text>
          {brand && <Text style={styles.headingDesc}>{brand.product_count} products available for virtual try-on.</Text>}
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              placeholder={`Search ${name}...`}
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={runSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {cats.map((c) => (
            <TouchableOpacity 
              key={c} 
              onPress={() => setCat(c)} 
              style={[styles.chip, cat === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, cat === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color="#c084fc" />
            <Text style={styles.stateText}>Loading products...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Ionicons name="alert-circle-outline" size={32} color="rgba(255,255,255,0.6)" />
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={runSearch}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>No products found.</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.prodGrid}>
              {products.map((p) => (
                <TouchableOpacity 
                  key={p.id} 
                  style={styles.prodCard}
                  onPress={() => router.push(`/store/product/${p.id}?storeId=${storeId}`)}
                >
                  <View style={styles.prodMedia}>
                    <Image source={{ uri: resolveUrl(p.image_url) }} style={styles.prodImg} />
                  </View>
                  <View style={styles.prodBody}>
                    <Text style={styles.prodCat}>{p.brand || p.store_name}</Text>
                    <Text style={styles.prodName} numberOfLines={1}>{p.name}</Text>
                    <View style={styles.prodRow}>
                      <Text style={styles.prodPrice}>{p.price || ''}</Text>
                      <View style={styles.tryBtn}>
                        <Text style={styles.tryBtnText}>View</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {loadingMore && (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#c084fc" />
              </View>
            )}
            {!hasMore && (
              <Text style={styles.endText}>No more products</Text>
            )}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  headingMain: { fontSize: 24, color: '#c084fc', fontFamily: 'ClashDisplay-Semibold' },
  headingDesc: { fontSize: 12.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  searchSection: { paddingHorizontal: 20, marginTop: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 13, fontFamily: 'Montserrat_400Regular' },
  chipRow: { paddingHorizontal: 20, marginTop: 16, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  chipActive: { backgroundColor: 'rgba(124,58,237,0.4)', borderColor: 'rgba(216,180,254,0.5)' },
  chipText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'Montserrat_500Medium' },
  chipTextActive: { color: '#fff' },
  stateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  stateText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'Montserrat_400Regular', textAlign: 'center', paddingHorizontal: 40 },
  retryBtn: { marginTop: 4, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 16, backgroundColor: 'rgba(124,58,237,0.4)', borderWidth: 1, borderColor: 'rgba(216,180,254,0.5)' },
  retryText: { color: '#fff', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' },
  endText: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Montserrat_400Regular', marginTop: 16 },
  prodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  prodCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  prodMedia: { width: '100%', aspectRatio: 3/4, position: 'relative', backgroundColor: 'rgba(255,255,255,0.04)' },
  prodImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  prodBody: { padding: 10 },
  prodCat: { fontSize: 9, textTransform: 'uppercase', fontFamily: 'Montserrat_600SemiBold', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 },
  prodName: { fontSize: 12, fontFamily: 'Montserrat_500Medium', color: '#fff', marginTop: 4 },
  prodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  prodPrice: { fontSize: 13, fontFamily: 'ClashDisplay-Semibold', color: '#d8b4fe' },
  tryBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tryBtnText: { fontSize: 10, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
});
