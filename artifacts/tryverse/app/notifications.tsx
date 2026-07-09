import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { Ionicons } from '@expo/vector-icons';

const featPose = require('@/assets/images/design/tv-feat-pose.jpg');
const featStylist = require('@/assets/images/design/tv-feat-stylist.jpg');
const featStore = require('@/assets/images/design/tv-feat-store.jpg');
const featSaved = require('@/assets/images/design/tv-feat-saved.jpg');

type Notif = {
  id: string;
  title: string;
  text: string;
  time: string;
  image: any;
  to: string;
  cta: string;
  group: "Today" | "Earlier";
};

const INITIAL: Notif[] = [
  { id: "n1", group: "Today", title: "Your Pose Studio result is ready", text: "Tap to view your generated pose variations.", time: "2m", image: featPose, to: "/pose-studio/result", cta: "View Result" },
  { id: "n2", group: "Today", title: "New AI Stylist tip from Stylo", text: "Lavender and cream tones are trending for your saved looks.", time: "1h", image: featStylist, to: "/(tabs)/stylo", cta: "Ask Stylo" },
  { id: "n3", group: "Today", title: "Credits updated", text: "You have 182 credits remaining.", time: "3h", image: featSaved, to: "/credits", cta: "View Credits" },
  { id: "n4", group: "Earlier", title: "New store added", text: "Browse new outfits available for virtual try-on.", time: "Yesterday", image: featStore, to: "/(tabs)/store", cta: "Open Store" },
  { id: "n5", group: "Earlier", title: "Saved look reminder", text: "Compare your saved looks before checkout.", time: "2d", image: featSaved, to: "/(tabs)/saved", cta: "Saved Looks" },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Notif[]>(INITIAL);
  const [unread, setUnread] = useState<Set<string>>(new Set(INITIAL.map((i) => i.id)));
  const [confirmClear, setConfirmClear] = useState(false);

  const groups: Array<"Today" | "Earlier"> = ["Today", "Earlier"];

  function open(n: Notif) {
    setUnread((u) => { const c = new Set(u); c.delete(n.id); return c; });
    router.push(n.to as any);
  }
  
  function del(id: string) {
    setItems((it) => it.filter((n) => n.id !== id));
  }

  return (
    <Screen safeArea withBottomNav>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TryVerseLogo height={26} width={100} />
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>HK</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.headingMain}>Notifications</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setUnread(new Set())}>
              <Text style={styles.actionBtnText}>Mark all as read</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setConfirmClear(true)}>
              <Text style={styles.actionBtnText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyDesc}>Updates about your outfits, credits, and results will appear here.</Text>
          </View>
        ) : (
          groups.map((g) => {
            const list = items.filter((i) => i.group === g);
            if (!list.length) return null;
            return (
              <View key={g} style={styles.section}>
                <Text style={styles.groupTitle}>{g}</Text>
                <View style={styles.list}>
                  {list.map((n) => (
                    <View key={n.id} style={styles.card}>
                      <View style={styles.cardMedia}>
                        <Image source={n.image} style={styles.cardImg} />
                      </View>
                      <TouchableOpacity style={styles.cardBody} onPress={() => open(n)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.cardTitle} numberOfLines={1}>{n.title}</Text>
                          {unread.has(n.id) && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.cardText}>{n.text}</Text>
                        <View style={styles.cardMeta}>
                          <Text style={styles.cardCta}>{n.cta} →</Text>
                          <Text style={styles.cardTime}>· {n.time}</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.delBtn} onPress={() => del(n.id)}>
                        <Ionicons name="trash-outline" size={16} color="rgba(255,255,255,0.6)" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={confirmClear} transparent animationType="fade" onRequestClose={() => setConfirmClear(false)}>
        <View style={styles.modalScrim}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Clear all notifications?</Text>
            <Text style={styles.confirmDesc}>This cannot be undone.</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setConfirmClear(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#c084fc', borderColor: 'transparent' }]} 
                onPress={() => { setItems([]); setUnread(new Set()); setConfirmClear(false); }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff', fontFamily: 'Montserrat_600SemiBold' }]}>Clear all</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontFamily: 'ClashDisplay-Semibold' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  headingMain: { fontSize: 22, color: '#fff', fontFamily: 'ClashDisplay-Semibold' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  actionBtnText: { color: '#fff', fontSize: 11.5, fontFamily: 'Montserrat_500Medium' },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  emptyDesc: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 8, textAlign: 'center', maxWidth: 240 },
  groupTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff', marginBottom: 12 },
  list: { gap: 10 },
  card: { flexDirection: 'row', padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'flex-start', gap: 12 },
  cardMedia: { width: 46, height: 46, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' },
  cardImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 12.5, fontFamily: 'Montserrat_600SemiBold', color: '#fff', flexShrink: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#c084fc' },
  cardText: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 2, lineHeight: 16 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  cardCta: { fontSize: 10.5, fontFamily: 'Montserrat_500Medium', color: '#c4b5fd' },
  cardTime: { fontSize: 10.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.4)' },
  delBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)' },
  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  confirmBox: { width: '100%', maxWidth: 320, backgroundColor: '#11071c', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  confirmTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff', textAlign: 'center' },
  confirmDesc: { fontSize: 11.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center' },
  modalBtn: { flex: 1, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalBtnText: { color: '#fff', fontSize: 12, fontFamily: 'Montserrat_500Medium' }
});