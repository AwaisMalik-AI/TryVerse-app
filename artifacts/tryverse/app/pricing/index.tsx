import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text, ActivityIndicator, Linking } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { UserAvatar } from '@/components/UserAvatar';

interface SubStatus {
  is_pro?: boolean;
  plan?: string;
  status?: string;
}

const PRO_FEATURES = [
  { icon: 'infinite-outline' as const, label: 'Unlimited AI generations' },
  { icon: 'sparkles-outline' as const, label: 'No watermarks on results' },
  { icon: 'flash-outline' as const, label: 'Priority AI processing' },
  { icon: 'cloud-download-outline' as const, label: 'HD downloads' },
];

export default function PricingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [status, setStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await apiGet<SubStatus>('/api/subscription/status');
    if (res.ok && res.data) setStatus(res.data);
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const isPro = status?.is_pro === true;

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setError(null);
    setActionLoading(true);
    const res = await apiPost<{ checkout_url?: string }>('/api/subscription/create-checkout', { platform: 'mobile' });
    setActionLoading(false);
    if (res.ok && res.data?.checkout_url) {
      Linking.openURL(res.data.checkout_url);
    } else {
      setError(res.error || 'Could not start checkout. Please try again.');
    }
  };

  const handlePortal = async () => {
    setError(null);
    setActionLoading(true);
    const res = await apiPost<{ portal_url?: string }>('/api/subscription/portal', { platform: 'mobile' });
    setActionLoading(false);
    if (res.ok && res.data?.portal_url) {
      Linking.openURL(res.data.portal_url);
    } else {
      setError(res.error || 'Could not open billing portal. Please try again.');
    }
  };

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <UserAvatar size={32} onPress={() => router.push(isAuthenticated ? '/profile' : '/login')} />
        </View>

        <View style={styles.titleSection}>
          <TypographyText variant="h1" style={styles.title}>TryVerse <Text style={{ color: '#c084fc' }}>Pro</Text></TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Unlock unlimited try-ons, poses, videos, and AI styling.</TypographyText>
        </View>

        {loading ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <ActivityIndicator color="#c084fc" />
          </View>
        ) : (
          <>
            <View style={styles.balanceCard}>
              <LinearGradient colors={['#7a3bff', '#c93bff']} style={styles.balanceIcon}>
                <Ionicons name={isPro ? 'diamond' : 'person-outline'} size={16} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{isPro ? 'Pro plan' : 'Free plan'}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>
                  {isPro ? 'You have full access to Pro features' : 'Upgrade to unlock everything'}
                </Text>
              </View>
            </View>

            <View style={{ marginHorizontal: 20, marginTop: 24 }}>
              <Text style={styles.sectionTitle}>What's included</Text>
              <View style={{ gap: 8 }}>
                {PRO_FEATURES.map((f) => (
                  <View key={f.label} style={styles.usageRow}>
                    <Ionicons name={f.icon} size={18} color="#c084fc" />
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500', marginLeft: 12 }}>{f.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={isPro ? handlePortal : handleUpgrade} disabled={actionLoading}>
              {actionLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>{isPro ? 'Manage Billing' : 'Upgrade to Pro'}</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center' },
  titleSection: { paddingHorizontal: 20, marginTop: 20 },
  title: { fontSize: 24, color: '#fff' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  balanceCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 20, padding: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  balanceIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sectionTitle: { color: '#fff', fontSize: 16, fontFamily: Typography.heading.fontFamily, marginBottom: 12 },
  usageRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  primaryBtn: { marginHorizontal: 20, marginTop: 28, backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  errorBox: { marginHorizontal: 20, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)', backgroundColor: 'rgba(248,113,113,0.1)', padding: 12 },
  errorText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#fca5a5' },
});
