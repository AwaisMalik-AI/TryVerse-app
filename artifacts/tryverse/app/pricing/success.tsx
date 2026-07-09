import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface SubStatus {
  is_pro?: boolean;
  plan?: string;
  status?: string;
  credits?: { is_pro?: boolean };
}

export default function SuccessScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    await refreshUser();
    const res = await apiGet<SubStatus>('/api/subscription/status');
    if (res.ok && res.data) {
      setStatus(res.data);
    } else {
      setLoadError(res.error || 'Could not confirm your subscription status.');
    }
    setLoading(false);
  }, [refreshUser]);

  useEffect(() => {
    load();
  }, [load]);

  const isPro =
    status?.is_pro === true ||
    status?.credits?.is_pro === true ||
    (!!status?.plan && status.plan !== 'free');

  return (
    <Screen safeArea>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.iconBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <LinearGradient colors={['#7a3bff', '#c93bff']} style={styles.iconCircle}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </LinearGradient>

          <TypographyText variant="h1" style={styles.title}>You're all set</TypographyText>
          <TypographyText variant="body" style={styles.subtitle}>Thanks for subscribing to TryVerse.</TypographyText>

          <View style={styles.receiptCard}>
            {loading ? (
              <ActivityIndicator color="#c084fc" />
            ) : loadError ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{loadError}</Text>
                <TouchableOpacity
                  onPress={load}
                  style={{ marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
                >
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.row}><Text style={styles.rowLabel}>Plan</Text><Text style={[styles.rowValue, { color: '#c084fc', fontWeight: 'bold' }]}>{isPro ? 'Pro' : (status?.plan || 'Free')}</Text></View>
                {status?.status ? <View style={styles.row}><Text style={styles.rowLabel}>Status</Text><Text style={styles.rowValue}>{status.status}</Text></View> : null}
              </>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(tabs)/try-on')}>
              <Text style={styles.primaryBtnText}>Start Try-On</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/pose-studio')}>
              <Text style={styles.secondaryBtnText}>Open Pose Studio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => router.push('/(tabs)/home')}>
              <Text style={styles.linkText}>Back Home</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 20 },
  title: { fontSize: 24, color: '#fff', marginTop: 24, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center' },
  receiptCard: { width: '100%', marginTop: 32, padding: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  rowValue: { color: '#fff', fontSize: 13, fontWeight: '500' },
  actions: { width: '100%', marginTop: 32, gap: 12 },
  primaryBtn: { backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.08)', height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily },
  linkText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', textDecorationLine: 'underline' }
});
