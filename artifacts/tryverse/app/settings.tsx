import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [notif, setNotif] = useState({ updates: true, credits: true, tips: true, stores: false, reminders: true });
  const [privacy, setPrivacy] = useState({ uploads: true, results: true, improve: true, hide: false });
  const [appearance, setAppearance] = useState({ dark: true, motion: false, compact: false });
  const [confirm, setConfirm] = useState(false);

  const Group = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );

  const Toggle = ({ label, value, onValueChange }: { label: string, value: boolean, onValueChange: (v: boolean) => void }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#c084fc' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <Screen safeArea withBottomNav>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Group title="Account">
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowHint}>Hussnain</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowHint}>hussnain@tryverse.app</Text>
          </View>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Change Password</Text>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </Group>

        <Group title="Notifications">
          <Toggle label="Product updates" value={notif.updates} onValueChange={v => setNotif({...notif, updates: v})} />
          <Toggle label="Credit alerts" value={notif.credits} onValueChange={v => setNotif({...notif, credits: v})} />
          <Toggle label="Stylo tips" value={notif.tips} onValueChange={v => setNotif({...notif, tips: v})} />
          <Toggle label="New store alerts" value={notif.stores} onValueChange={v => setNotif({...notif, stores: v})} />
          <Toggle label="Saved look reminders" value={notif.reminders} onValueChange={v => setNotif({...notif, reminders: v})} />
        </Group>

        <Group title="Privacy">
          <Toggle label="Auto-delete uploaded photos after session" value={privacy.uploads} onValueChange={v => setPrivacy({...privacy, uploads: v})} />
          <Toggle label="Auto-delete generated results after session" value={privacy.results} onValueChange={v => setPrivacy({...privacy, results: v})} />
          <Toggle label="Do not use uploads for product improvement" value={privacy.improve} onValueChange={v => setPrivacy({...privacy, improve: v})} />
          <Toggle label="Hide profile from public showcase" value={privacy.hide} onValueChange={v => setPrivacy({...privacy, hide: v})} />
        </Group>

        <Group title="Appearance">
          <Toggle label="Dark mode" value={appearance.dark} onValueChange={v => setAppearance({...appearance, dark: v})} />
          <Toggle label="Reduced motion" value={appearance.motion} onValueChange={v => setAppearance({...appearance, motion: v})} />
          <Toggle label="Compact cards" value={appearance.compact} onValueChange={v => setAppearance({...appearance, compact: v})} />
        </Group>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.btnDanger} onPress={() => setConfirm(true)}>
            <Text style={styles.btnDangerText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={confirm} transparent animationType="fade" onRequestClose={() => setConfirm(false)}>
        <View style={styles.modalScrim}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete your account?</Text>
            <Text style={styles.confirmDesc}>This action can't be undone. All your saved looks will be removed.</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setConfirm(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'transparent' }]} 
                onPress={() => setConfirm(false)}
              >
                <Text style={[styles.modalBtnText, { color: '#ef4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  groupCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 52, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowLabel: { fontSize: 12.5, fontFamily: 'Montserrat_500Medium', color: 'rgba(255,255,255,0.9)', flex: 1, paddingRight: 16 },
  rowHint: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.5)' },
  btnDanger: { height: 48, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  btnDangerText: { color: '#ef4444', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' },
  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  confirmBox: { width: '100%', maxWidth: 320, backgroundColor: '#11071c', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  confirmTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff', textAlign: 'center' },
  confirmDesc: { fontSize: 11.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center' },
  modalBtn: { flex: 1, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalBtnText: { color: '#fff', fontSize: 12, fontFamily: 'Montserrat_500Medium' }
});