import { GoldButton } from '@/components/ui/GoldButton';
import { BorderRadius, FontSize, Gradients, Shadows, Spacing, TAB_BAR_SPACER, theme } from '@/constants/theme';
import { apiFetch, apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NOTIF_PREFS_KEY = 'notification_preferences';

type Section = 'main' | 'measurements' | 'notifications';

interface Measurements {
  height: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  shoulder_cm: number | null;
  unit: 'cm' | 'in';
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<Section>('main');
  const [measurements, setMeasurements] = useState<Measurements>({ height: null, chest_cm: null, waist_cm: null, shoulder_cm: null, unit: 'cm' });
  const [savingMeasurements, setSavingMeasurements] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [promoNotifications, setPromoNotifications] = useState(true);
  const [resultNotifications, setResultNotifications] = useState(true);

  useEffect(() => {
    loadMeasurements();
    loadNotificationPrefs();
  }, []);

  const loadNotificationPrefs = async () => {
    try {
      const data = Platform.OS === 'web'
        ? (typeof localStorage !== 'undefined' ? localStorage.getItem(NOTIF_PREFS_KEY) : null)
        : await SecureStore.getItemAsync(NOTIF_PREFS_KEY);
      if (data) {
        const prefs = JSON.parse(data);
        setNotificationsEnabled(prefs.enabled ?? false);
        setPromoNotifications(prefs.promo ?? true);
        setResultNotifications(prefs.results ?? true);
      }
    } catch {}
  };

  const saveNotificationPref = async (key: string, value: boolean) => {
    const prefs = {
      enabled: key === 'enabled' ? value : notificationsEnabled,
      promo: key === 'promo' ? value : promoNotifications,
      results: key === 'results' ? value : resultNotifications,
    };
    if (key === 'enabled') setNotificationsEnabled(value);
    if (key === 'promo') setPromoNotifications(value);
    if (key === 'results') setResultNotifications(value);
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
    } else {
      await SecureStore.setItemAsync(NOTIF_PREFS_KEY, JSON.stringify(prefs));
    }
  };

  const loadMeasurements = async () => {
    const res = await apiGet<Measurements>('/api/user/measurements');
    if (res.ok && res.data) setMeasurements(res.data);
  };

  const saveMeasurements = async () => {
    setSavingMeasurements(true);
    const response = await apiFetch('/api/user/measurements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(measurements),
    });
    setSavingMeasurements(false);
    if (response.ok) { Alert.alert('Saved', 'Measurements updated successfully.'); setSection('main'); }
    else Alert.alert('Error', 'Could not save measurements.');
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'User';

  if (section === 'measurements') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.sm }]} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => setSection('main')} style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={styles.sectionTitle}>Body Measurements</Text>
          <Text style={styles.sectionDesc}>Used for size recommendations</Text>
          <View style={styles.unitRow}>
            {(['cm', 'in'] as const).map((u) => (
              <Pressable key={u} onPress={() => setMeasurements({ ...measurements, unit: u })} style={[styles.unitButton, measurements.unit === u && styles.unitButtonActive]}>
                <Text style={[styles.unitText, measurements.unit === u && styles.unitTextActive]}>{u === 'cm' ? 'Centimeters' : 'Inches'}</Text>
              </Pressable>
            ))}
          </View>
          {[
            { key: 'height' as const, label: 'Height', icon: 'resize-outline' as const },
            { key: 'chest_cm' as const, label: 'Chest', icon: 'body-outline' as const },
            { key: 'waist_cm' as const, label: 'Waist', icon: 'ellipse-outline' as const },
            { key: 'shoulder_cm' as const, label: 'Shoulder', icon: 'expand-outline' as const },
          ].map(({ key, label, icon }) => (
            <View key={key} style={styles.measureField}>
              <View style={styles.measureLabelRow}>
                <Ionicons name={icon} size={16} color={theme.gold} />
                <Text style={styles.measureLabel}>{label}</Text>
              </View>
              <View style={styles.measureInputRow}>
                <TextInput
                  style={styles.measureInput}
                  placeholder="0"
                  placeholderTextColor={theme.placeholder}
                  value={measurements[key] != null ? String(measurements[key]) : ''}
                  onChangeText={(t) => { const v = parseFloat(t); setMeasurements({ ...measurements, [key]: t && !isNaN(v) ? v : null }); }}
                  keyboardType="numeric"
                  selectionColor={theme.gold}
                />
                <Text style={styles.measureUnit}>{measurements.unit}</Text>
              </View>
            </View>
          ))}
          <GoldButton title="Save Measurements" icon="checkmark-circle-outline" onPress={saveMeasurements} loading={savingMeasurements} size="lg" fullWidth />
          <View style={{ height: TAB_BAR_SPACER }} />
        </ScrollView>
      </View>
    );
  }

  if (section === 'notifications') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.sm }]} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => setSection('main')} style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Text style={styles.sectionDesc}>Manage your notification preferences</Text>
          {[
            { key: 'enabled', val: notificationsEnabled, icon: 'notifications-outline', label: 'Push Notifications', desc: 'Enable all push notifications' },
            { key: 'results', val: resultNotifications, icon: 'image-outline', label: 'Generation Complete', desc: 'Notify when try-on images are ready' },
            { key: 'promo', val: promoNotifications, icon: 'megaphone-outline', label: 'Promotions & Tips', desc: 'Style tips and special offers' },
          ].map((item) => (
            <View key={item.key} style={styles.notifRow}>
              <View style={styles.notifInfo}>
                <View style={styles.notifIconBg}><Ionicons name={item.icon as any} size={18} color={theme.gold} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifLabel}>{item.label}</Text>
                  <Text style={styles.notifDesc}>{item.desc}</Text>
                </View>
              </View>
              <Switch
                value={item.val}
                onValueChange={(v) => saveNotificationPref(item.key, v)}
                trackColor={{ false: theme.border, true: theme.gold + '60' }}
                thumbColor={item.val ? theme.gold : theme.textMuted}
              />
            </View>
          ))}
          <View style={{ height: TAB_BAR_SPACER }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.sm }]} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.profileHeader}>
          <LinearGradient colors={Gradients.gold} style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{firstName.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.profileName} numberOfLines={1}>{user?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail} numberOfLines={1}>{user?.email || ''}</Text>
          {user?.is_pro ? (
            <View style={styles.proBadge}>
              <Ionicons name="diamond" size={14} color={theme.goldLight} />
              <Text style={styles.proBadgeText}>Pro Member</Text>
            </View>
          ) : (
            <Pressable
              onPress={async () => {
                try { const res = await apiFetch('/api/subscription/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: 'mobile' }) }); if (res.ok) { const data = await res.json(); if (data.checkout_url) { await Linking.openURL(data.checkout_url); return; } } } catch {}
                Alert.alert('Upgrade', 'Upgrade to Pro for unlimited try-ons and exclusive features.');
              }}
              style={styles.freeBadge}
            >
              <Text style={styles.freeBadgeText}>Free Plan</Text>
              <Text style={styles.upgradeText}>Upgrade →</Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Menu */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <MenuItem icon="body-outline" label="Body Measurements" desc="Size recommendations" onPress={() => setSection('measurements')} />
          <MenuItem icon="card-outline" label="Subscription" desc={user?.is_pro ? 'Pro Plan' : 'Free Plan'} onPress={async () => {
            if (user?.is_pro) {
              try { const res = await apiFetch('/api/subscription/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: 'mobile' }) }); if (res.ok) { const data = await res.json(); if (data.portal_url) { await Linking.openURL(data.portal_url); return; } } } catch {}
              Alert.alert('Pro Plan', 'Unlimited try-ons, HD quality, and no watermarks.');
            } else {
              try { const res = await apiFetch('/api/subscription/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: 'mobile' }) }); if (res.ok) { const data = await res.json(); if (data.checkout_url) { await Linking.openURL(data.checkout_url); return; } } } catch {}
              Alert.alert('Upgrade', 'Upgrade to Pro for unlimited try-ons and exclusive features.');
            }
          }} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Preferences</Text>
          <MenuItem icon="notifications-outline" label="Notifications" desc="Manage push notifications" onPress={() => setSection('notifications')} />
          <MenuItem icon="shield-outline" label="Privacy" desc="Data & privacy settings" onPress={() => router.push('/privacy-policy')} />
          <MenuItem icon="help-circle-outline" label="Help & Support" desc="FAQ and contact us" onPress={() => router.push('/contact-us')} />
          <MenuItem icon="information-circle-outline" label="About" desc="App info and version" onPress={() => router.push('/about')} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutButton, { opacity: pressed ? 0.8 : 1 }]}>
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.versionText}>TryVerse v1.0.0</Text>
        <View style={{ height: TAB_BAR_SPACER }} />
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label, desc, onPress }: { icon: string; label: string; desc: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.8 : 1 }]}>
      <View style={styles.menuItemIconBg}>
        <Ionicons name={icon as any} size={18} color={theme.gold} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemLabel}>{label}</Text>
        <Text style={styles.menuItemDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingHorizontal: Spacing.xl },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '800', color: theme.text, letterSpacing: -0.3 },
  sectionDesc: { fontSize: FontSize.sm, color: theme.textSecondary, marginTop: 4, marginBottom: Spacing.xl },
  unitRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  unitButton: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: theme.borderLight, alignItems: 'center', backgroundColor: theme.surface },
  unitButtonActive: { backgroundColor: theme.gold, borderColor: theme.gold },
  unitText: { fontSize: FontSize.sm, fontWeight: '600', color: theme.textSecondary },
  unitTextActive: { color: theme.textInverse },
  measureField: { marginBottom: Spacing.lg },
  measureLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  measureLabel: { fontSize: FontSize.sm, fontWeight: '600', color: theme.text },
  measureInputRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.inputBorder,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 50, backgroundColor: theme.inputBg,
  },
  measureInput: { flex: 1, fontSize: FontSize.md, color: theme.text },
  measureUnit: { fontSize: FontSize.sm, color: theme.textMuted, fontWeight: '500' },

  // Profile header
  profileHeader: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.base, ...Shadows.gold,
  },
  avatarLargeText: { fontSize: FontSize['2xl'], fontWeight: '800', color: theme.textInverse },
  profileName: { fontSize: FontSize.lg, fontWeight: '700', color: theme.text },
  profileEmail: { fontSize: FontSize.sm, color: theme.textSecondary, marginTop: 2 },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm,
    backgroundColor: theme.goldMuted, paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: theme.goldBorder,
  },
  proBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: theme.goldLight },
  freeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm,
    borderWidth: 1, borderColor: theme.borderLight, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
  },
  freeBadgeText: { fontSize: FontSize.xs, color: theme.textSecondary },
  upgradeText: { fontSize: FontSize.xs, fontWeight: '700', color: theme.gold },

  // Menu
  menuSection: { marginBottom: Spacing.xl },
  menuSectionTitle: { fontSize: FontSize.xs, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  menuItemIconBg: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: theme.goldMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  menuItemContent: { flex: 1 },
  menuItemLabel: { fontSize: FontSize.base, fontWeight: '600', color: theme.text },
  menuItemDesc: { fontSize: FontSize.xs, color: theme.textSecondary, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.base, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: theme.dangerMuted, marginTop: Spacing.base, backgroundColor: theme.dangerMuted,
  },
  logoutText: { fontSize: FontSize.base, fontWeight: '600', color: theme.danger },
  versionText: { textAlign: 'center', fontSize: FontSize.xs, color: theme.textMuted, marginTop: Spacing.xl },

  // Notifications
  notifRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  notifInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  notifIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.goldMuted, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  notifLabel: { fontSize: FontSize.base, fontWeight: '600', color: theme.text },
  notifDesc: { fontSize: FontSize.xs, color: theme.textSecondary, marginTop: 2 },
});
