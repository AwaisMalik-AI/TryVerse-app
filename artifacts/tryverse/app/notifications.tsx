import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { UserAvatar } from '@/components/UserAvatar';
import { Ionicons } from '@expo/vector-icons';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface NotificationItem {
  id: number | string;
  type?: string;
  title?: string;
  body?: string;
  link_url?: string;
  is_read?: boolean;
  created_at?: string;
}

function relativeTime(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await apiGet<NotificationItem[]>('/api/notifications');
    if (res.ok && Array.isArray(res.data)) {
      setItems(res.data);
    } else {
      setError(res.error || 'Could not load notifications.');
    }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const hasUnread = items.some((n) => n.is_read === false);

  const markRead = async (id: NotificationItem['id']) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await apiPost(`/api/notifications/${id}/read`, {});
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await apiPost('/api/notifications/mark-all-read', {});
  };

  return (
    <Screen safeArea withBottomNav>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TryVerseLogo height={26} width={100} />
          <UserAvatar size={36} onPress={() => router.push('/profile')} />
        </View>

        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.headingMain}>Notifications</Text>
            {hasUnread ? (
              <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {authLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#a855f7" size="large" />
          </View>
        ) : !isAuthenticated ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.emptyTitle}>Sign in to view notifications</Text>
            <Text style={styles.emptyDesc}>Log in to see updates about your outfits, results, and account.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => router.push('/login')}>
              <Text style={styles.retryText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#c084fc" />
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="alert-circle-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptyDesc}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyDesc}>Updates about your outfits, results, and account will appear here.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((n) => {
              const unread = n.is_read === false;
              return (
                <TouchableOpacity
                  key={String(n.id)}
                  style={[styles.card, unread && styles.cardUnread]}
                  onPress={() => (unread ? markRead(n.id) : undefined)}
                  activeOpacity={unread ? 0.7 : 1}
                >
                  <View style={styles.cardIcon}>
                    <Ionicons name="notifications-outline" size={16} color="#c084fc" />
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{n.title || 'Notification'}</Text>
                      {unread ? <View style={styles.unreadDot} /> : null}
                    </View>
                    {n.body ? <Text style={styles.cardText}>{n.body}</Text> : null}
                    {n.created_at ? <Text style={styles.cardTime}>{relativeTime(n.created_at)}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headingMain: { fontSize: 22, color: '#fff', fontFamily: 'ClashDisplay-Semibold' },
  markAllBtn: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  markAllText: { fontSize: 11, fontFamily: 'Montserrat_500Medium', color: '#c4b5fd' },
  centerState: { paddingTop: 80, alignItems: 'center' },
  list: { paddingHorizontal: 20, marginTop: 16, gap: 8 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardUnread: { backgroundColor: 'rgba(124,58,237,0.12)', borderColor: 'rgba(192,132,252,0.3)' },
  cardIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(124,58,237,0.2)', alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 13, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#c084fc' },
  cardText: { fontSize: 11.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.65)', marginTop: 4, lineHeight: 17 },
  cardTime: { fontSize: 10.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff', textAlign: 'center' },
  emptyDesc: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 8, textAlign: 'center', maxWidth: 240 },
  retryBtn: { marginTop: 18, backgroundColor: '#c084fc', paddingHorizontal: 28, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  retryText: { fontSize: 13, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
});
