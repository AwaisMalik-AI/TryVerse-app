import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { UserAvatar } from '@/components/UserAvatar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { useTryVerse } from '@/lib/local-store';
import { apiGet, apiFetch } from '@/lib/api';

type SheetKey = null | "measurements" | "history" | "help" | "support";

interface Measurements {
  height: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  shoulder_cm: number | null;
  unit: 'cm' | 'in';
}

interface HistoryItem {
  id: number | string;
  feature: string;
  result_image_url?: string;
  created_at?: string;
}

const emptyMeasurements: Measurements = { height: null, chest_cm: null, waist_cm: null, shoulder_cm: null, unit: 'cm' };

const featureLabel: Record<string, string> = {
  tryon: 'Try-On',
  pose: 'Pose Studio',
  stylist: 'Stylo',
  store_tryon: 'Store Try-On',
  video: 'Video Studio',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { saved } = useTryVerse();

  const [sheet, setSheet] = useState<SheetKey>(null);

  const [measurements, setMeasurements] = useState<Measurements>(emptyMeasurements);
  const [savingMeasurements, setSavingMeasurements] = useState(false);
  const [measurementsError, setMeasurementsError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const savedCount = saved.length;
  const isPro = user?.is_pro === true;

  const loadMeasurements = useCallback(async () => {
    if (!isAuthenticated) return;
    setMeasurementsError(null);
    const res = await apiGet<Measurements>('/api/user/measurements');
    if (res.ok && res.data) {
      setMeasurements({ ...emptyMeasurements, ...res.data });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadMeasurements();
  }, [loadMeasurements]);

  const saveMeasurements = async () => {
    setSavingMeasurements(true);
    setMeasurementsError(null);
    try {
      const response = await apiFetch('/api/user/measurements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(measurements),
      });
      setSavingMeasurements(false);
      if (response.ok) {
        setSheet(null);
      } else {
        setMeasurementsError('Could not save measurements. Please try again.');
      }
    } catch {
      setSavingMeasurements(false);
      setMeasurementsError('Connection failed. Please try again.');
    }
  };

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    const res = await apiGet<HistoryItem[]>('/api/user/history?limit=50');
    if (res.ok && Array.isArray(res.data)) {
      setHistory(res.data);
    } else {
      setHistoryError(res.error || 'Could not load your history.');
    }
    setHistoryLoading(false);
  }, []);

  const openHistory = () => {
    setSheet('history');
    loadHistory();
  };

  const Row = ({ label, hint, onClick }: { label: string, hint?: string, onClick?: () => void }) => (
    <TouchableOpacity style={styles.row} onPress={onClick}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.4)" />
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <Screen safeArea withBottomNav>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TryVerseLogo height={26} width={100} />
          </View>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.signInBox}>
          <Text style={styles.sectionTitle}>You're not signed in</Text>
          <Text style={styles.footerText}>Sign in to view your profile, measurements, and history.</Text>
          <TouchableOpacity style={[styles.btnPrimary, { marginTop: 20, height: 48, width: 200 }]} onPress={() => router.push('/login')}>
            <Text style={styles.btnPrimaryText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea withBottomNav>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TryVerseLogo height={26} width={100} />
          </View>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.heroCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <UserAvatar size={56} />
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName}>{user?.full_name || 'TryVerse User'}</Text>
                <Text style={styles.heroEmail}>{user?.email || ''}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  <View style={styles.miniPill}>
                    <Text style={styles.miniPillText}>{isPro ? 'Pro plan' : 'Free plan'}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setSheet('measurements')}>
                <Text style={styles.btnSecondaryText}>Measurements</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/credits')}>
                <Text style={styles.btnPrimaryText}>{isPro ? 'Manage Plan' : 'Upgrade'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Activity</Text>
          <View style={styles.group}>
            <Row label="Saved Looks" hint={`${savedCount} ${savedCount === 1 ? 'item' : 'items'}`} onClick={() => router.push('/(tabs)/saved')} />
            <Row label="History" hint="Recent" onClick={openHistory} />
            <Row label="Stylo" onClick={() => router.push('/(tabs)/stylo')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.group}>
            <Row label="Body Measurements" onClick={() => setSheet('measurements')} />
            <Row label="Subscription" hint={isPro ? 'Pro' : 'Free'} onClick={() => router.push('/credits')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.group}>
            <Row label="Help Center" onClick={() => setSheet('help')} />
            <Row label="Contact Support" onClick={() => setSheet('support')} />
          </View>
        </View>

        <View style={[styles.section, { marginTop: 30, marginBottom: 20 }]}>
          <TouchableOpacity
            style={[styles.btnSecondary, { height: 48, borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'transparent' }]}
            onPress={async () => { await logout(); router.replace('/welcome'); }}
          >
            <Text style={[styles.btnSecondaryText, { color: '#ef4444' }]}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>TryVerse v1.0</Text>
        </View>
      </ScrollView>

      <Modal visible={!!sheet} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <View style={styles.sheetScrim}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSheet(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {sheet === 'measurements' ? 'Body Measurements' :
                 sheet === 'history' ? 'History' :
                 sheet === 'help' ? 'Help Center' :
                 sheet === 'support' ? 'Contact Support' : 'Information'}
              </Text>
              <TouchableOpacity onPress={() => setSheet(null)} style={styles.iconBtnSmall}><Ionicons name="close" size={16} color="#fff" /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 440 }} contentContainerStyle={{ padding: 20 }}>

              {sheet === 'measurements' && (
                <View>
                  <View style={styles.unitRow}>
                    {(['cm', 'in'] as const).map((u) => (
                      <TouchableOpacity key={u} onPress={() => setMeasurements({ ...measurements, unit: u })} style={[styles.chip, measurements.unit === u && styles.chipActive]}>
                        <Text style={styles.chipText}>{u === 'cm' ? 'Centimeters' : 'Inches'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {([
                    { key: 'height' as const, label: 'Height' },
                    { key: 'chest_cm' as const, label: 'Chest' },
                    { key: 'waist_cm' as const, label: 'Waist' },
                    { key: 'shoulder_cm' as const, label: 'Shoulder' },
                  ]).map(({ key, label }) => (
                    <View key={key} style={{ marginBottom: 14 }}>
                      <Text style={styles.inputLabel}>{label}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="numeric"
                        value={measurements[key] != null ? String(measurements[key]) : ''}
                        onChangeText={(t) => { const v = parseFloat(t); setMeasurements({ ...measurements, [key]: t && !isNaN(v) ? v : null }); }}
                      />
                    </View>
                  ))}
                  {measurementsError ? <Text style={styles.errorText}>{measurementsError}</Text> : null}
                  <TouchableOpacity style={[styles.btnPrimary, { marginTop: 12, height: 44 }]} onPress={saveMeasurements} disabled={savingMeasurements}>
                    {savingMeasurements ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnPrimaryText}>Save Measurements</Text>}
                  </TouchableOpacity>
                </View>
              )}

              {sheet === 'history' && (
                <View style={{ gap: 8 }}>
                  {historyLoading ? (
                    <View style={{ paddingVertical: 30, alignItems: 'center' }}><ActivityIndicator color="#c084fc" /></View>
                  ) : historyError ? (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <Text style={styles.errorText}>{historyError}</Text>
                      <TouchableOpacity style={[styles.btnPrimary, { marginTop: 14, height: 40, width: 140 }]} onPress={loadHistory}>
                        <Text style={styles.btnPrimaryText}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  ) : history.length === 0 ? (
                    <Text style={styles.footerText}>No history yet.</Text>
                  ) : (
                    history.map((h) => (
                      <View key={String(h.id)} style={styles.historyCard}>
                        <Ionicons name="time-outline" size={16} color="#c084fc" />
                        <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Montserrat_500Medium', marginLeft: 8 }}>
                          {featureLabel[h.feature] || h.feature}
                          {h.created_at ? ` · ${new Date(h.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              )}

              {sheet === 'help' && (
                <Text style={styles.footerText}>Visit our Help Center for FAQs about try-ons, poses, videos, and your subscription.</Text>
              )}

              {sheet === 'support' && (
                <TouchableOpacity onPress={() => Linking.openURL('mailto:support@tryverse.app')}>
                  <Text style={[styles.footerText, { textDecorationLine: 'underline' }]}>support@tryverse.app</Text>
                </TouchableOpacity>
              )}

            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 15, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  signInBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  heroCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  heroName: { fontSize: 18, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  heroEmail: { fontSize: 11.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  miniPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  miniPillText: { fontSize: 10, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  btnSecondary: { flex: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btnSecondaryText: { color: '#fff', fontSize: 12.5, fontFamily: 'Montserrat_500Medium' },
  btnPrimary: { flex: 1, height: 40, backgroundColor: '#c084fc', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 12.5, fontFamily: 'Montserrat_600SemiBold' },
  sectionTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff', marginBottom: 8 },
  group: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rowLabel: { fontSize: 12.5, fontFamily: 'Montserrat_500Medium', color: 'rgba(255,255,255,0.9)' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowHint: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.5)' },
  footerText: { textAlign: 'center', fontSize: 11.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 16 },

  sheetScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#11071c', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginTop: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 16 },
  sheetTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  iconBtnSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  unitRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  inputLabel: { fontSize: 11, fontFamily: 'Montserrat_500Medium', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, height: 44, paddingHorizontal: 16, color: '#fff', fontSize: 14, fontFamily: 'Montserrat_400Regular', marginTop: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipActive: { backgroundColor: '#c084fc', borderColor: 'transparent' },
  chipText: { fontSize: 12, color: '#fff', fontFamily: 'Montserrat_500Medium' },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', padding: 12, borderRadius: 12 },
  errorText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#fca5a5', textAlign: 'center' },
});
