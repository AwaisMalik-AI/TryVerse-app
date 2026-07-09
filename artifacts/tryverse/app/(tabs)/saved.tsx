import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { UserAvatar } from '@/components/UserAvatar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTryVerse, tvActions, SavedLook } from '@/lib/local-store';

const DAY = 86400000;

type Filter = "all" | "try-on" | "stylo" | "compare" | "favorites";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "try-on", label: "Try-On" },
  { id: "stylo", label: "Stylo Picks" },
  { id: "compare", label: "Compare" },
  { id: "favorites", label: "Favorites" },
];

const TAG_LABEL: Record<NonNullable<SavedLook["tag"]>, string> = {
  "try-on": "Try-On Result",
  stylo: "Stylo Pick",
  compare: "Compare",
};

function relativeDate(ts: number) {
  const diff = Date.now() - ts;
  if (diff < DAY) return "Saved today";
  if (diff < DAY * 2) return "Saved yesterday";
  if (diff < DAY * 7) return "Saved this week";
  const d = new Date(ts);
  return `Saved ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export default function SavedScreen() {
  const router = useRouter();
  const { saved } = useTryVerse();
  const [filter, setFilter] = useState<Filter>("all");

  const [detail, setDetail] = useState<SavedLook | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedLook | null>(null);

  const looks: SavedLook[] = useMemo(() => {
    return saved.map((l) => ({ ...l, tag: l.tag ?? "try-on" as const }));
  }, [saved]);

  const filtered = useMemo(() => {
    if (filter === "all") return looks;
    if (filter === "favorites") return looks.filter((l) => l.favorite);
    return looks.filter((l) => l.tag === filter);
  }, [looks, filter]);

  function confirmDelete() {
    if (!pendingDelete) return;
    tvActions.deleteLook(pendingDelete.id);
    setPendingDelete(null);
  }

  function toggleFav(l: SavedLook) {
    tvActions.toggleFavorite(l.id);
  }

  return (
    <Screen safeArea withBottomNav>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TryVerseLogo height={30} width={120} />
          </View>
          <UserAvatar size={36} onPress={() => router.push('/profile')} />
        </View>

        {/* Heading */}
        <View style={styles.section}>
          <Text style={styles.headingMain}><Text style={styles.gradText}>Saved Looks</Text></Text>
          <Text style={styles.headingDesc}>Keep your favorite outfits, compare styles, and try them again anytime.</Text>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity 
              key={f.id} 
              onPress={() => setFilter(f.id)} 
              style={[styles.chip, filter === f.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.section, { gap: 12 }]}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}><Ionicons name="images-outline" size={24} color="#fff" /></View>
              <Text style={styles.emptyTitle}>No saved looks yet</Text>
              <Text style={styles.emptyDesc}>Try on your first outfit and save the result here.</Text>
              <TouchableOpacity style={styles.cta} onPress={() => router.push('/try-on')}>
                <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
                  <Text style={styles.ctaText}>Start Try-On</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((look) => (
              <View key={look.id} style={styles.lookCard}>
                <View style={[styles.lookMedia, { backgroundColor: look.outfit.tint }]}>
                  <Image source={typeof look.result === 'string' ? { uri: look.result } : look.result} style={styles.lookImg} />
                  {look.tag === "compare" && <View style={styles.compareDiv} />}
                  <TouchableOpacity style={[styles.heartBtn, look.favorite && styles.heartBtnActive]} onPress={() => toggleFav(look)}>
                    <Ionicons name={look.favorite ? "heart" : "heart-outline"} size={14} color={look.favorite ? "#fff" : "rgba(255,255,255,0.7)"} />
                  </TouchableOpacity>
                </View>
                <View style={styles.lookBody}>
                  <View style={styles.lookTag}><Text style={styles.lookTagText}>{TAG_LABEL[look.tag ?? "try-on"]}</Text></View>
                  <Text style={styles.lookName}>{look.outfit.name}</Text>
                  <Text style={styles.lookMeta}>{relativeDate(look.createdAt)} · Size {look.size} · {look.outfit.color}</Text>
                  <View style={styles.lookActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => setDetail(look)}><Text style={styles.actionBtnText}>View</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/try-on')}><Text style={styles.actionBtnText}>Try Again</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/stylo')}><Text style={styles.actionBtnText}>Ask Stylo</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => setPendingDelete(look)}><Text style={styles.actionBtnDangerText}>Delete</Text></TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <Modal visible={!!detail} transparent animationType="fade" onRequestClose={() => setDetail(null)}>
        <View style={styles.modalScrim}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setDetail(null)}><Ionicons name="close" size={20} color="#fff" /></TouchableOpacity>
            <View style={[styles.modalMedia, { backgroundColor: detail?.outfit?.tint }]}>
              {detail?.result && <Image source={typeof detail.result === 'string' ? { uri: detail.result } : detail.result} style={styles.lookImg} />}
            </View>
            <View style={styles.modalBody}>
              <View style={styles.lookTag}><Text style={styles.lookTagText}>{TAG_LABEL[detail?.tag ?? "try-on"]}</Text></View>
              <Text style={[styles.lookName, { fontSize: 18, marginTop: 8 }]}>{detail?.outfit?.name}</Text>
              <Text style={styles.lookMeta}>{detail && relativeDate(detail.createdAt)}</Text>
              <View style={styles.dlList}>
                <View style={styles.dlRow}><Text style={styles.dt}>Size</Text><Text style={styles.dd}>{detail?.size}</Text></View>
                <View style={styles.dlRow}><Text style={styles.dt}>Fit</Text><Text style={styles.dd}>{detail?.fitNote}</Text></View>
                <View style={styles.dlRow}><Text style={styles.dt}>Color</Text><Text style={styles.dd}>{detail?.outfit?.color ?? "—"}</Text></View>
                <View style={styles.dlRow}><Text style={styles.dt}>Store</Text><Text style={styles.dd}>{detail?.outfit?.store ?? "TryVerse Store"}</Text></View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 24 }}>
                <TouchableOpacity style={styles.modalBtn} onPress={() => { setDetail(null); router.push('/try-on'); }}><Text style={styles.modalBtnText}>Try Again</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalBtn} onPress={() => { setDetail(null); router.push('/(tabs)/stylo'); }}><Text style={styles.modalBtnText}>Ask Stylo</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!pendingDelete} transparent animationType="fade" onRequestClose={() => setPendingDelete(null)}>
        <View style={styles.modalScrim}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete this saved look?</Text>
            <Text style={styles.confirmDesc}>“{pendingDelete?.outfit?.name}” will be removed from your saved looks.</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setPendingDelete(null)}><Text style={styles.modalBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'transparent' }]} onPress={confirmDelete}><Text style={[styles.modalBtnText, { color: '#ef4444' }]}>Delete</Text></TouchableOpacity>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontFamily: 'ClashDisplay-Semibold' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  headingMain: { fontSize: 24, color: '#fff', fontFamily: 'ClashDisplay-Semibold' },
  gradText: { color: '#c084fc' },
  headingDesc: { fontSize: 12.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  chipRow: { paddingHorizontal: 20, marginTop: 16, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  chipActive: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' },
  chipText: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontFamily: 'Montserrat_500Medium' },
  chipTextActive: { color: '#fff' },
  lookCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  lookMedia: { width: 100, position: 'relative' },
  lookImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  compareDiv: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  heartBtn: { position: 'absolute', top: 8, left: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(10,4,20,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heartBtnActive: { backgroundColor: '#c084fc', borderColor: '#d946ef' },
  lookBody: { flex: 1, padding: 12 },
  lookTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  lookTagText: { fontSize: 9, textTransform: 'uppercase', fontFamily: 'Montserrat_600SemiBold', color: '#c4b5fd', letterSpacing: 0.5 },
  lookName: { fontSize: 14, fontFamily: 'Montserrat_600SemiBold', color: '#fff', marginTop: 6 },
  lookMeta: { fontSize: 10.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  lookActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8 },
  actionBtnText: { fontSize: 10, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  actionBtnDanger: { backgroundColor: 'transparent' },
  actionBtnDangerText: { fontSize: 10, fontFamily: 'Montserrat_500Medium', color: '#ef4444' },
  empty: { alignItems: 'center', paddingVertical: 40, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  emptyDesc: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 6, textAlign: 'center', maxWidth: 200 },
  cta: { borderRadius: 20, overflow: 'hidden', marginTop: 20 },
  ctaGradient: { paddingHorizontal: 24, height: 40, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 13, fontFamily: 'Montserrat_500Medium' },
  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#11071c', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalMedia: { width: '100%', height: 280 },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalBody: { padding: 20 },
  dlList: { marginTop: 16, gap: 8 },
  dlRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 8 },
  dt: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.5)' },
  dd: { fontSize: 12, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  modalBtn: { flex: 1, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalBtnText: { color: '#fff', fontSize: 12.5, fontFamily: 'Montserrat_500Medium' },
  confirmBox: { width: '100%', maxWidth: 320, backgroundColor: '#11071c', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  confirmTitle: { fontSize: 18, fontFamily: 'ClashDisplay-Semibold', color: '#fff', textAlign: 'center' },
  confirmDesc: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center' },
});