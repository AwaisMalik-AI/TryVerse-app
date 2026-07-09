import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { useTryVerse } from '@/lib/local-store';

type SheetKey = null | "edit" | "history" | "measurements" | "sizes" | "styles" | "colors" | "manage-data" | "help" | "support" | "legal";

const sizeOptions = ["XS", "S", "M", "L", "XL"];
const styleOptions = ["Casual", "Formal", "Streetwear", "Minimal", "Modest", "Luxury"];
const colorOptions = [
  { name: "Lavender", hex: "#c8b6ff" },
  { name: "Cream", hex: "#f2e8cf" },
  { name: "Black", hex: "#141018" },
  { name: "Olive", hex: "#7a8450" },
  { name: "Navy", hex: "#1e2a4a" },
  { name: "Beige", hex: "#d9c4a3" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { saved } = useTryVerse();
  
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [name, setName] = useState(user?.full_name || "Hussnain");
  const [email, setEmail] = useState(user?.email || "hussnain@tryverse.app");
  const [sizes, setSizes] = useState({ tops: "M", bottoms: "M", dresses: "S" });
  const [stylesList, setStylesList] = useState(["Minimal", "Casual"]);
  const [colors, setColors] = useState(["Lavender", "Black"]);

  const savedCount = saved.length || 12;
  const initial = user?.full_name?.charAt(0).toUpperCase() || 'H';

  const toggleList = (list: string[], v: string, setFn: (l: string[]) => void) => {
    setFn(list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  };

  const Row = ({ label, hint, onClick }: { label: string, hint?: string, onClick?: () => void }) => (
    <TouchableOpacity style={styles.row} onPress={onClick}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {hint && <Text style={styles.rowHint}>{hint}</Text>}
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.4)" />
      </View>
    </TouchableOpacity>
  );

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
              <View style={styles.avatarBig}><Text style={styles.avatarBigText}>{initial}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName}>{name}</Text>
                <Text style={styles.heroEmail}>{email}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  <View style={styles.miniPill}><Text style={styles.miniPillText}>Pro</Text></View>
                  <View style={styles.miniPill}>
                    <View style={styles.dot} />
                    <Text style={styles.miniPillText}>182 credits</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setSheet("edit")}>
                <Text style={styles.btnSecondaryText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/credits')}>
                <Text style={styles.btnPrimaryText}>Credits</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { label: "Saved Looks", value: savedCount },
              { label: "Try-Ons", value: 38 },
              { label: "Stylo Chats", value: 9 },
            ].map(s => (
              <View key={s.label} style={styles.statBox}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Activity</Text>
          <View style={styles.group}>
            <Row label="Saved Looks" hint={`${savedCount} items`} onClick={() => router.push('/(tabs)/saved')} />
            <Row label="Try-On History" hint="Recent" onClick={() => setSheet("history")} />
            <Row label="Stylo Conversations" hint="9 chats" onClick={() => router.push('/(tabs)/stylo')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.group}>
            <Row label="Body Measurements" hint="Add" onClick={() => setSheet("measurements")} />
            <Row label="Preferred Sizes" hint={`${sizes.tops} · ${sizes.bottoms}`} onClick={() => setSheet("sizes")} />
            <Row label="Style Preferences" hint={stylesList.length ? `${stylesList.length} picked` : "Add"} onClick={() => setSheet("styles")} />
            <Row label="Color Palette" hint={colors.length ? `${colors.length} picked` : "Add"} onClick={() => setSheet("colors")} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.group}>
            <Row label="Help Center" hint="FAQs" onClick={() => setSheet("help")} />
            <Row label="Contact Support" hint="Email" onClick={() => setSheet("support")} />
          </View>
        </View>

        <View style={[styles.section, { marginTop: 30, marginBottom: 20 }]}>
          <TouchableOpacity 
            style={[styles.btnSecondary, { height: 48, borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'transparent' }]} 
            onPress={async () => { await logout(); router.replace('/welcome'); }}
          >
            <Text style={[styles.btnSecondaryText, { color: '#ef4444' }]}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>TryVerse v1.0 · Made with love</Text>
        </View>

      </ScrollView>

      {/* Very simplified modal implementation for sheets to save file size/complexity */}
      <Modal visible={!!sheet} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <View style={styles.sheetScrim}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSheet(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {sheet === 'edit' ? 'Edit Profile' : 
                 sheet === 'sizes' ? 'Preferred Sizes' : 
                 sheet === 'styles' ? 'Style Preferences' : 
                 sheet === 'colors' ? 'Color Palette' : 'Information'}
              </Text>
              <TouchableOpacity onPress={() => setSheet(null)} style={styles.iconBtnSmall}><Ionicons name="close" size={16} color="#fff" /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ padding: 20 }}>
              
              {sheet === 'edit' && (
                <View>
                  <Text style={styles.inputLabel}>Full name</Text>
                  <TextInput value={name} onChangeText={setName} style={styles.input} />
                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>Email</Text>
                  <TextInput value={email} onChangeText={setEmail} style={styles.input} />
                </View>
              )}

              {sheet === 'sizes' && (
                <View>
                  {["tops", "bottoms", "dresses"].map(k => (
                    <View key={k} style={{ marginBottom: 16 }}>
                      <Text style={styles.inputLabel}>{k}</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                        {sizeOptions.map(s => (
                          <TouchableOpacity 
                            key={s} 
                            style={[styles.chip, sizes[k as keyof typeof sizes] === s && styles.chipActive]}
                            onPress={() => setSizes({...sizes, [k]: s})}
                          >
                            <Text style={styles.chipText}>{s}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {(sheet === 'styles' || sheet === 'colors') && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {(sheet === 'styles' ? styleOptions : colorOptions.map(c=>c.name)).map(o => {
                    const active = (sheet === 'styles' ? stylesList : colors).includes(o);
                    return (
                      <TouchableOpacity 
                        key={o} 
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => toggleList(sheet==='styles'?stylesList:colors, o, sheet==='styles'?setStylesList:setColors)}
                      >
                        <Text style={styles.chipText}>{o}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}

              {sheet === 'history' && (
                <View style={{ gap: 8 }}>
                  {["Lavender Blazer · Today", "Cream Knit Set · Yesterday", "Olive Trench · 3d ago"].map(h => (
                    <View key={h} style={styles.historyCard}>
                      <Ionicons name="time-outline" size={16} color="#c084fc" />
                      <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Montserrat_500Medium', marginLeft: 8 }}>{h}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={[styles.btnPrimary, { marginTop: 24, height: 44 }]} onPress={() => setSheet(null)}>
                <Text style={styles.btnPrimaryText}>{sheet === 'history' ? 'Close' : 'Save'}</Text>
              </TouchableOpacity>
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
  heroCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  avatarBig: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 1, borderColor: '#c084fc', alignItems: 'center', justifyContent: 'center' },
  avatarBigText: { fontSize: 20, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  heroName: { fontSize: 18, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  heroEmail: { fontSize: 11.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  miniPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  miniPillText: { fontSize: 10, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#c084fc' },
  btnSecondary: { flex: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btnSecondaryText: { color: '#fff', fontSize: 12.5, fontFamily: 'Montserrat_500Medium' },
  btnPrimary: { flex: 1, height: 40, backgroundColor: '#c084fc', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 12.5, fontFamily: 'Montserrat_600SemiBold' },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statVal: { fontSize: 20, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  statLabel: { fontSize: 10.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff', marginBottom: 8 },
  group: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rowLabel: { fontSize: 12.5, fontFamily: 'Montserrat_500Medium', color: 'rgba(255,255,255,0.9)' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowHint: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.5)' },
  footerText: { textAlign: 'center', fontSize: 10.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.4)', marginTop: 16 },
  
  sheetScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#11071c', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginTop: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 16 },
  sheetTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  iconBtnSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  inputLabel: { fontSize: 11, fontFamily: 'Montserrat_500Medium', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, height: 44, paddingHorizontal: 16, color: '#fff', fontSize: 14, fontFamily: 'Montserrat_400Regular', marginTop: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipActive: { backgroundColor: '#c084fc', borderColor: 'transparent' },
  chipText: { fontSize: 12, color: '#fff', fontFamily: 'Montserrat_500Medium' },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', padding: 12, borderRadius: 12 }
});