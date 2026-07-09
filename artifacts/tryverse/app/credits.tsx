import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Credits {
  used?: number;
  remaining?: number;
  extra?: number;
  limit?: number;
  unlimited?: boolean;
  is_pro?: boolean;
  reset_at?: string;
}

interface SubStatus {
  is_pro?: boolean;
  plan?: string;
  subscription_status?: string;
  subscription_ends_at?: string;
  credits?: Credits;
}

const PRO_FEATURES = ['Unlimited AI generations', 'No watermarks on results', 'Priority AI processing', 'HD downloads'];

function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function capitalize(value?: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function CreditsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [status, setStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await apiGet<SubStatus>('/api/subscription/status');
    if (res.ok && res.data) {
      setStatus(res.data);
    } else {
      setError(res.error || 'Could not load your subscription.');
    }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const isPro =
    status?.is_pro === true ||
    status?.credits?.is_pro === true ||
    (!!status?.plan && status.plan !== 'free');
  const credits = status?.credits;
  const unlimited = credits?.unlimited === true;
  const planName = capitalize(status?.plan) || (isPro ? 'Pro' : 'Free');
  const resetDate = formatDate(credits?.reset_at);

  const handleUpgrade = async () => {
    setActionError(null);
    setActionLoading(true);
    const res = await apiPost<{ checkout_url?: string }>('/api/subscription/create-checkout', { platform: 'mobile' });
    setActionLoading(false);
    if (res.ok && res.data?.checkout_url) {
      Linking.openURL(res.data.checkout_url);
    } else {
      setActionError(res.error || 'Could not start checkout. Please try again.');
    }
  };

  const handlePortal = async () => {
    setActionError(null);
    setActionLoading(true);
    const res = await apiPost<{ portal_url?: string }>('/api/subscription/portal', { platform: 'mobile' });
    setActionLoading(false);
    if (res.ok && res.data?.portal_url) {
      Linking.openURL(res.data.portal_url);
    } else {
      setActionError(res.error || 'Could not open billing portal. Please try again.');
    }
  };

  return (
    <Screen safeArea withBottomNav>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {authLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#a855f7" size="large" />
          </View>
        ) : !isAuthenticated ? (
          <View style={styles.section}>
            <View style={styles.stateBox}>
              <Text style={styles.stateTitle}>Sign in to view your plan</Text>
              <Text style={styles.stateDesc}>Log in to manage your TryVerse subscription.</Text>
              <TouchableOpacity style={styles.cta} onPress={() => router.push('/login')}>
                <LinearGradient colors={['#7a3bff', '#c93bff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
                  <Text style={styles.ctaText}>Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#c084fc" />
          </View>
        ) : error ? (
          <View style={styles.section}>
            <View style={styles.stateBox}>
              <Text style={styles.stateTitle}>Something went wrong</Text>
              <Text style={styles.stateDesc}>{error}</Text>
              <TouchableOpacity style={styles.cta} onPress={load}>
                <LinearGradient colors={['#7a3bff', '#c93bff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
                  <Text style={styles.ctaText}>Retry</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.heroCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View>
                    <Text style={styles.heroSub}>Current plan</Text>
                    <Text style={styles.heroTitle}>
                      <Text style={styles.gradText}>{planName}</Text> plan
                    </Text>
                    {status?.subscription_status ? <Text style={styles.heroDesc}>Status: {status.subscription_status}</Text> : null}
                  </View>
                  <View style={styles.proAvatar}>
                    <Ionicons name={isPro ? 'diamond' : 'person-outline'} size={18} color="#fff" />
                  </View>
                </View>

                {credits ? (
                  <View style={styles.creditsBlock}>
                    <Text style={styles.creditsLabel}>Credits remaining</Text>
                    <Text style={styles.creditsValue}>{unlimited ? 'Unlimited' : (credits.remaining ?? 0)}</Text>
                    {!unlimited ? (
                      <View style={styles.creditsBreakdown}>
                        {typeof credits.used === 'number' ? (
                          <View style={styles.breakItem}>
                            <Text style={styles.breakNum}>{credits.used}</Text>
                            <Text style={styles.breakLabel}>Used</Text>
                          </View>
                        ) : null}
                        {typeof credits.limit === 'number' ? (
                          <View style={styles.breakItem}>
                            <Text style={styles.breakNum}>{credits.limit}</Text>
                            <Text style={styles.breakLabel}>Limit</Text>
                          </View>
                        ) : null}
                        {typeof credits.extra === 'number' ? (
                          <View style={styles.breakItem}>
                            <Text style={styles.breakNum}>{credits.extra}</Text>
                            <Text style={styles.breakLabel}>Extra</Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                    {resetDate ? <Text style={styles.resetText}>Resets on {resetDate}</Text> : null}
                  </View>
                ) : null}

                {isPro ? (
                  <View style={styles.featuresGrid}>
                    {PRO_FEATURES.map((b) => (
                      <View key={b} style={styles.featureItem}>
                        <LinearGradient colors={['#7a3bff', '#c93bff']} style={styles.checkCircle}>
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.featureText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.heroDesc}>Upgrade to Pro for unlimited generations, HD downloads, and no watermarks.</Text>
                )}
              </View>
            </View>

            {!isPro && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upgrade to Pro</Text>
                <View style={styles.upgradeCard}>
                  {PRO_FEATURES.map((f) => (
                    <View key={f} style={styles.upgradeRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#c084fc" />
                      <Text style={styles.upgradeText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {actionError ? (
              <View style={styles.section}>
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{actionError}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <TouchableOpacity style={styles.cta} onPress={isPro ? handlePortal : handleUpgrade} disabled={actionLoading}>
                <LinearGradient colors={['#7a3bff', '#c93bff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
                  {actionLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.ctaText}>{isPro ? 'Manage Billing' : 'Upgrade to Pro'}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff', marginBottom: 12 },
  centerState: { paddingTop: 80, alignItems: 'center' },
  stateBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  stateTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff', textAlign: 'center' },
  stateDesc: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center' },
  heroCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  heroSub: { fontSize: 10.5, fontFamily: 'Montserrat_600SemiBold', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: 2 },
  heroTitle: { fontSize: 26, fontFamily: 'ClashDisplay-Semibold', color: '#fff', marginTop: 4 },
  gradText: { color: '#c084fc' },
  heroDesc: { fontSize: 11.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 18 },
  proAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 1, borderColor: '#c084fc', alignItems: 'center', justifyContent: 'center' },
  creditsBlock: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  creditsLabel: { fontSize: 10.5, fontFamily: 'Montserrat_600SemiBold', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: 2 },
  creditsValue: { fontSize: 34, fontFamily: 'ClashDisplay-Semibold', color: '#fff', marginTop: 4 },
  creditsBreakdown: { flexDirection: 'row', gap: 24, marginTop: 16 },
  breakItem: { alignItems: 'flex-start' },
  breakNum: { fontSize: 18, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  breakLabel: { fontSize: 10, fontFamily: 'Montserrat_500Medium', color: 'rgba(255,255,255,0.55)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  resetText: { fontSize: 11.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 14 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, gap: 10 },
  featureItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkCircle: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.8)' },
  upgradeCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
  upgradeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  upgradeText: { fontSize: 12.5, fontFamily: 'Montserrat_500Medium', color: 'rgba(255,255,255,0.9)' },
  cta: { borderRadius: 24, overflow: 'hidden' },
  ctaGradient: { height: 48, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: 14, fontFamily: 'Montserrat_600SemiBold', color: '#fff' },
  errorBox: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)', backgroundColor: 'rgba(248,113,113,0.1)', padding: 12 },
  errorText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#fca5a5' },
});
