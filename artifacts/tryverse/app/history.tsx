import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { theme, Spacing, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { apiGet, API_URL, getToken } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HistoryItem {
  id: number;
  feature: string;
  result_image_url?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [saving, setSaving] = useState(false);

  const loadHistory = useCallback(async () => {
    const res = await apiGet<HistoryItem[]>('/api/user/history?limit=50');
    if (res.ok && res.data) setItems(res.data);
    else if (!res.ok) Alert.alert('Error', res.error || 'Could not load history.');
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const onRefresh = () => { setRefreshing(true); loadHistory(); };

  const resolveUrl = (url: string) => url.startsWith('http') ? url : `${API_URL}${url}`;

  const featureLabel = (f: string) => {
    const map: Record<string, string> = { tryon: 'Try-On', pose: 'Pose', stylist: 'Stylist', store_tryon: 'Store Try-On', video: 'Video' };
    return map[f] || f;
  };

  const handleSave = async (imageUrl: string) => {
    try {
      setSaving(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images to your gallery.');
        setSaving(false);
        return;
      }
      const ext = imageUrl.includes('.png') ? 'png' : 'jpg';
      const filename = `tryverse_${Date.now()}.${ext}`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const headers: Record<string, string> = {};
      if (imageUrl.startsWith(API_URL)) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const download = await FileSystem.downloadAsync(imageUrl, fileUri, { headers });
      await MediaLibrary.saveToLibraryAsync(download.uri);
      Alert.alert('Saved!', 'Image has been saved to your gallery.');
    } catch {
      Alert.alert('Error', 'Could not save the image.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Pressable
      onPress={() => item.result_image_url ? setSelectedItem(item) : null}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
    >
      {item.result_image_url ? (
        <Image source={{ uri: resolveUrl(item.result_image_url) }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardPlaceholder]}>
          <Ionicons name="image-outline" size={24} color={theme.textMuted} />
        </View>
      )}
      <View style={styles.cardInfo}>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{featureLabel(item.feature)}</Text>
        </View>
        <Text style={styles.cardDate}>
          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.gold} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="time-outline" size={48} color={theme.textMuted} />
          <Text style={styles.emptyTitle}>No History Yet</Text>
          <Text style={styles.emptyDesc}>Your generated images will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.gold} colors={[theme.gold]} progressBackgroundColor={theme.surface} />
          }
        />
      )}

      {/* Fullscreen Image Modal */}
      <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + Spacing.sm }]}>
            <Pressable onPress={() => setSelectedItem(null)} style={styles.modalClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.modalTitle}>{selectedItem ? featureLabel(selectedItem.feature) : ''}</Text>
            {selectedItem?.result_image_url && (
              <Pressable
                onPress={() => handleSave(resolveUrl(selectedItem.result_image_url!))}
                disabled={saving}
                style={styles.modalSave}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="download-outline" size={24} color="#fff" />
                )}
              </Pressable>
            )}
          </View>
          {selectedItem?.result_image_url && (
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: resolveUrl(selectedItem.result_image_url) }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </View>
          )}
          <Text style={styles.modalDate}>
            {selectedItem ? new Date(selectedItem.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: theme.text },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '700', color: theme.text },
  emptyDesc: { fontSize: FontSize.sm, color: theme.textSecondary },
  listContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base, paddingBottom: 24 },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  card: {
    flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden',
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
    ...Shadows.sm,
  },
  cardImage: { width: '100%', aspectRatio: 4 / 5, resizeMode: 'cover', backgroundColor: theme.surface },
  cardPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cardInfo: { padding: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBadge: { backgroundColor: theme.goldMuted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  cardBadgeText: { fontSize: FontSize.xs, fontWeight: '600', color: theme.gold },
  cardDate: { fontSize: FontSize.xs, color: theme.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'space-between' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  modalClose: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
  modalSave: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  modalImageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: SCREEN_WIDTH - 32, height: SCREEN_WIDTH * 1.2, borderRadius: BorderRadius.md },
  modalDate: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingBottom: 40, paddingTop: Spacing.md },
});
