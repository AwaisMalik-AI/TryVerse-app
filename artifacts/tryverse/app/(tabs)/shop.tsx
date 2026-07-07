import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme, Spacing, FontSize, BorderRadius, TAB_BAR_SPACER, Shadows } from '@/constants/theme';
import { apiGet, API_URL } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Store {
  id: number;
  name: string;
  logo_url: string | null;
  product_count: number;
}

interface Product {
  id: number;
  name: string;
  brand: string | null;
  image_url: string;
  price: string | null;
  gender: string;
  source_url?: string | null;
  store_name?: string | null;
  store_id?: number;
}

const PAGE_SIZE = 10;

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const PRODUCT_WIDTH = (width - Spacing.xl * 2 - Spacing.md) / 2;
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gender, setGender] = useState<'all' | 'men' | 'women'>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadData = async (reset = true) => {
    if (reset) { setPage(0); setHasMore(true); }
    const currentPage = reset ? 0 : page;

    const storeRes = await apiGet<Store[]>('/api/store/brands');
    const brandList = storeRes.ok && storeRes.data ? storeRes.data : [];
    setStores(brandList);

    if (!selectedStore) {
      setProducts([]);
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      return;
    }

    let url = `/api/store/brands/${selectedStore}/products?limit=${PAGE_SIZE}&offset=${currentPage * PAGE_SIZE}`;
    if (gender !== 'all') url += `&gender=${gender}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
    const prodRes = await apiGet<Product[]>(url);
    let newProducts: Product[] = [];
    if (prodRes.ok && prodRes.data) {
      newProducts = prodRes.data;
      if (prodRes.data.length < PAGE_SIZE) setHasMore(false);
    }

    if (reset) setProducts(newProducts);
    else setProducts((prev) => [...prev, ...newProducts]);

    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  };

  useEffect(() => { loadData(true); }, [selectedStore, gender]);
  useEffect(() => { if (page > 0) loadData(false); }, [page]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadData(true); }, [selectedStore, gender, search]);
  const handleSearch = () => { setLoading(true); loadData(true); };
  const loadMore = () => { if (!hasMore || loadingMore || loading) return; setLoadingMore(true); setPage((p) => p + 1); };
  const resolveImageUrl = (url: string) => url.startsWith('http') ? url : `${API_URL}${url}`;

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 300))}>
      <Pressable
        onPress={() => {
          if (!item.store_id) { Alert.alert('Error', 'This product is missing store information.'); return; }
          router.push(`/store-tryon?product=${item.id}&store=${item.store_id}`);
        }}
        style={({ pressed }) => [styles.productCard, { width: PRODUCT_WIDTH, opacity: pressed ? 0.9 : 1 }]}
      >
        <Image source={{ uri: resolveImageUrl(item.image_url) }} style={styles.productImage} />
        <View style={styles.productInfo}>
          {item.store_name && (
            <Text style={styles.productBrand} numberOfLines={1}>{item.store_name}</Text>
          )}
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.productBottom}>
            {item.price ? <Text style={styles.productPrice}>{item.price}</Text> : <View />}
            <View style={styles.tryOnBadge}>
              <Ionicons name="shirt-outline" size={11} color={theme.gold} />
              <Text style={styles.tryOnBadgeText}>Try On</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Fashion Store</Text>
            <Text style={styles.headerSub}>
              {!selectedStore
                ? `${stores.length} brands · ${stores.reduce((sum, s) => sum + s.product_count, 0).toLocaleString()} products`
                : `${products.length} products`}
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="storefront" size={20} color={theme.gold} />
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={theme.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          selectionColor={theme.gold}
        />
        {search.length > 0 && (
          <Pressable onPress={() => { setSearch(''); setLoading(true); loadData(true); }}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Gender filter */}
      {selectedStore && (
        <View style={styles.filterRow}>
          {(['all', 'women', 'men'] as const).map((g) => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              style={[styles.filterChip, gender === g && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, gender === g && styles.filterChipTextActive]}>
                {g === 'all' ? 'All' : g === 'women' ? 'Women' : 'Men'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Selected store bar */}
      {selectedStore && (
        <View style={styles.selectedBrandBar}>
          <Text style={styles.selectedBrandName} numberOfLines={1}>
            {stores.find((s) => s.id === selectedStore)?.name || 'Store'}
          </Text>
          <Pressable onPress={() => setSelectedStore(null)} style={styles.selectedBrandClose}>
            <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            <Text style={styles.selectedBrandCloseText}>All Brands</Text>
          </Pressable>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.gold} />
        </View>
      ) : !selectedStore ? (
        <ScrollView
          contentContainerStyle={styles.brandGrid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.gold} colors={[theme.gold]} progressBackgroundColor={theme.surface} />
          }
        >
          <Text style={styles.brandGridTitle}>Explore Fashion Stores</Text>
          <Text style={styles.brandGridSub}>
            Browse {stores.length} brands and {stores.reduce((sum, s) => sum + s.product_count, 0).toLocaleString()} products
          </Text>

          <View style={styles.brandGridContainer}>
            {stores.map((store) => (
              <Pressable
                key={store.id}
                onPress={() => setSelectedStore(store.id)}
                style={({ pressed }) => [styles.brandGridCard, { width: PRODUCT_WIDTH, opacity: pressed ? 0.85 : 1 }]}
              >
                {store.logo_url ? (
                  <Image source={{ uri: resolveImageUrl(store.logo_url) }} style={styles.brandGridLogo} />
                ) : (
                  <View style={styles.brandGridLogoPlaceholder}>
                    <Text style={styles.brandGridInitial}>{store.name.charAt(0)}</Text>
                  </View>
                )}
                <Text style={styles.brandGridName} numberOfLines={1}>{store.name}</Text>
                <Text style={styles.brandGridCount}>{store.product_count} products</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ height: TAB_BAR_SPACER }} />
        </ScrollView>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={theme.gold} />
                <Text style={styles.loadMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.gold} colors={[theme.gold]} progressBackgroundColor={theme.surface} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bag-outline" size={48} color={theme.textMuted} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: theme.text, letterSpacing: -0.3 },
  headerSub: { fontSize: FontSize.xs, color: theme.textSecondary, marginTop: 2 },
  headerBadge: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: theme.goldMuted,
    borderWidth: 1, borderColor: theme.goldBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.xl,
    paddingHorizontal: Spacing.md, height: 44,
    backgroundColor: theme.inputBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: theme.inputBorder,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: theme.text },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl,
    gap: Spacing.sm, marginTop: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: theme.borderLight,
    backgroundColor: theme.surface,
  },
  filterChipActive: { backgroundColor: theme.gold, borderColor: theme.gold },
  filterChipText: { fontSize: FontSize.sm, color: theme.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: theme.textInverse, fontWeight: '600' },
  brandGrid: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  brandGridTitle: { fontSize: FontSize.xl, fontWeight: '800', color: theme.text, marginBottom: 4 },
  brandGridSub: { fontSize: FontSize.sm, color: theme.textSecondary, marginBottom: Spacing.xl },
  brandGridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  brandGridCard: {
    backgroundColor: theme.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1, borderColor: theme.border,
    ...Shadows.sm,
  },
  brandGridLogo: {
    width: 60, height: 60, borderRadius: 30,
    marginBottom: Spacing.md, backgroundColor: theme.surface,
  },
  brandGridLogoPlaceholder: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: theme.goldMuted,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1, borderColor: theme.goldBorder,
  },
  brandGridInitial: { fontSize: FontSize.xl, fontWeight: '700', color: theme.gold },
  brandGridName: { fontSize: FontSize.sm, fontWeight: '700', color: theme.text, textAlign: 'center' },
  brandGridCount: { fontSize: FontSize.xs, color: theme.textMuted, marginTop: 4 },
  selectedBrandBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: theme.goldMuted,
    borderBottomWidth: 1, borderBottomColor: theme.goldBorder,
    marginTop: Spacing.sm,
  },
  selectedBrandName: { fontSize: FontSize.md, fontWeight: '700', color: theme.goldLight, flex: 1, marginRight: Spacing.sm },
  selectedBrandClose: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectedBrandCloseText: { fontSize: FontSize.sm, color: theme.textMuted, fontWeight: '500' },
  loadMoreContainer: { paddingVertical: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
  loadMoreText: { fontSize: FontSize.xs, color: theme.textMuted },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  productList: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base, paddingBottom: TAB_BAR_SPACER },
  productRow: { gap: Spacing.md, marginBottom: Spacing.base },
  productCard: {
    borderRadius: BorderRadius.lg,
    backgroundColor: theme.card,
    overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border,
    ...Shadows.sm,
  },
  productImage: { width: '100%', aspectRatio: 5 / 6, resizeMode: 'cover', backgroundColor: theme.surface },
  productInfo: { padding: Spacing.sm },
  productBrand: { fontSize: FontSize.xs, color: theme.gold, fontWeight: '600', marginBottom: 2 },
  productName: { fontSize: FontSize.sm, color: theme.text, fontWeight: '500', lineHeight: 18 },
  productBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  productPrice: { fontSize: FontSize.sm, color: theme.text, fontWeight: '700' },
  tryOnBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: theme.goldMuted,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tryOnBadgeText: { fontSize: 9, fontWeight: '700', color: theme.gold },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: FontSize.base, color: theme.textMuted, marginTop: Spacing.md },
});
