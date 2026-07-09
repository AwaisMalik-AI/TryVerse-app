import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { TypographyText } from '@/components/Typography';
import { Ionicons } from '@expo/vector-icons';
import { apiGet, API_URL } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const categories = ["All", "Dresses", "Blazers", "Shirts", "Jackets", "Hoodies", "Pants"];

interface Brand {
  id: number;
  name: string;
  logo_url: string | null;
  website_url?: string;
  product_count: number;
  men_count?: number;
  women_count?: number;
  preview_images: string[];
  partner_status?: 'gold' | 'standard';
}

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

function initialsFrom(name?: string | null): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function StoreScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeCat, setActiveCat] = useState("All");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const initials = initialsFrom(user?.full_name);

  const load = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    setError(null);
    const brandsRes = await apiGet<Brand[]>('/api/store/brands');
    if (!brandsRes.ok || !brandsRes.data) {
      setError(brandsRes.error || 'Could not load stores.');
      setLoading(false);
      return;
    }
    const brandList = brandsRes.data;
    setBrands(brandList);

    if (brandList.length > 0) {
      const firstId = brandList[0].id;
      const qs = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const prodRes = await apiGet<Product[]>(`/api/store/brands/${firstId}/products?limit=10&offset=0${qs}`);
      if (prodRes.ok && prodRes.data) {
        setProducts(prodRes.data);
      } else {
        setProducts([]);
        setError(prodRes.error || 'Could not load products.');
        setLoading(false);
        return;
      }
    } else {
      setProducts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runSearch = async () => {
    setSearching(true);
    await load(search.trim() || undefined);
    setSearching(false);
  };

  const visible = activeCat === "All"
    ? products
    : products.filter((p) => {
        const hay = `${p.name} ${p.brand ?? ''}`.toLowerCase();
        const term = activeCat.toLowerCase();
        const singular = term.slice(0, -1);
        return hay.includes(term) || hay.includes(singular);
      });

  return (
    <Screen safeArea withBottomNav>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TryVerseLogo height={30} width={120} />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatar}>
              {isAuthenticated && initials ? (
                <Text style={styles.avatarText}>{initials}</Text>
              ) : (
                <Ionicons name="person" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Heading */}
        <View style={styles.section}>
          <Text style={styles.headingMain}>Explore <Text style={styles.gradText}>Fashion Stores</Text></Text>
          <Text style={styles.headingDesc}>Browse clothing from curated stores and try outfits on yourself instantly.</Text>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput 
              placeholder="Search dresses, blazers, shirts..." 
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={runSearch}
              returnKeyType="search"
            />
            {searching && <ActivityIndicator size="small" color="#c084fc" />}
          </View>
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {categories.map((c) => (
            <TouchableOpacity 
              key={c} 
              onPress={() => setActiveCat(c)} 
              style={[styles.chip, activeCat === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeCat === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color="#c084fc" />
            <Text style={styles.stateText}>Loading stores...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Ionicons name="alert-circle-outline" size={32} color="rgba(255,255,255,0.6)" />
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Featured stores */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TypographyText variant="subheading" style={styles.sectionTitle}>Featured Stores</TypographyText>
                <Text style={styles.sectionCount}>{brands.length} stores</Text>
              </View>
              {brands.length === 0 ? (
                <Text style={styles.emptyText}>No stores available.</Text>
              ) : (
                <View style={styles.storeList}>
                  {brands.map((s) => {
                    const previews = (s.preview_images || []).slice(0, 3);
                    return (
                      <TouchableOpacity key={s.id} style={styles.storeCard} onPress={() => router.push(`/store/${s.id}`)}>
                        <View style={styles.storeThumbs}>
                          {previews.length > 0 ? previews.map((img, idx) => (
                            <Image
                              key={idx}
                              source={{ uri: resolveUrl(img) }}
                              style={[styles.storeThumb, { zIndex: 3 - idx, marginLeft: idx === 0 ? 0 : -12, opacity: 1 - idx * 0.15 }]}
                            />
                          )) : (
                            <View style={[styles.storeThumb, styles.storeThumbEmpty]} />
                          )}
                        </View>
                        <View style={styles.storeInfo}>
                          <Text style={styles.storeName} numberOfLines={1}>{s.name}</Text>
                          <Text style={styles.storeCount}>{s.product_count} products</Text>
                        </View>
                        <View style={styles.arrowIcon}>
                          <Ionicons name="chevron-forward" size={14} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Trending outfits */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TypographyText variant="subheading" style={styles.sectionTitle}>Trending Outfits</TypographyText>
                <Text style={styles.sectionCount}>{visible.length} looks</Text>
              </View>
              {visible.length === 0 ? (
                <Text style={styles.emptyText}>No products found.</Text>
              ) : (
                <View style={styles.prodGrid}>
                  {visible.map((p) => {
                    const key = String(p.id);
                    return (
                      <View key={key} style={styles.prodCard}>
                        <TouchableOpacity 
                          style={styles.prodMedia} 
                          onPress={() => router.push(`/store/product/${p.id}?storeId=${p.store_id}`)}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: resolveUrl(p.image_url) }} style={styles.prodImg} />
                          <TouchableOpacity 
                            style={[styles.heartBtn, saved[key] && styles.heartBtnActive]} 
                            onPress={() => setSaved(s => ({ ...s, [key]: !s[key] }))}
                          >
                            <Ionicons name={saved[key] ? "heart" : "heart-outline"} size={14} color={saved[key] ? "#fff" : "rgba(255,255,255,0.7)"} />
                          </TouchableOpacity>
                        </TouchableOpacity>
                        <View style={styles.prodBody}>
                          <Text style={styles.prodCat}>{p.brand || p.store_name}</Text>
                          <Text style={styles.prodName} numberOfLines={1}>{p.name}</Text>
                          <View style={styles.prodRow}>
                            <Text style={styles.prodPrice}>{p.price || ''}</Text>
                            <TouchableOpacity onPress={() => router.push(`/store/product/${p.id}?storeId=${p.store_id}`)} style={styles.tryBtn}>
                              <Text style={styles.tryBtnText}>Try On</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontFamily: 'ClashDisplay-Semibold' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  headingMain: { fontSize: 24, color: '#fff', fontFamily: 'ClashDisplay-Semibold' },
  gradText: { color: '#c084fc' },
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
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 12.5, fontFamily: 'Montserrat_400Regular', marginTop: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, color: '#fff' },
  sectionCount: { fontSize: 10.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.45)' },
  storeList: { gap: 10, marginTop: 12 },
  storeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  storeThumbs: { flexDirection: 'row', width: 64 },
  storeThumb: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#11071c' },
  storeThumbEmpty: { backgroundColor: 'rgba(255,255,255,0.08)' },
  storeInfo: { flex: 1, marginLeft: 8 },
  storeName: { fontSize: 14, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
  storeCount: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  arrowIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  prodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  prodCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  prodMedia: { width: '100%', aspectRatio: 3/4, position: 'relative', backgroundColor: 'rgba(255,255,255,0.04)' },
  prodImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  heartBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(10,4,20,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heartBtnActive: { backgroundColor: '#c084fc', borderColor: '#d946ef' },
  prodBody: { padding: 10 },
  prodCat: { fontSize: 9, textTransform: 'uppercase', fontFamily: 'Montserrat_600SemiBold', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 },
  prodName: { fontSize: 12, fontFamily: 'Montserrat_500Medium', color: '#fff', marginTop: 4 },
  prodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  prodPrice: { fontSize: 13, fontFamily: 'ClashDisplay-Semibold', color: '#d8b4fe' },
  tryBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tryBtnText: { fontSize: 10, fontFamily: 'Montserrat_600SemiBold', color: '#fff' }
});
