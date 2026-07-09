import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform, Text, TextInput as RNTextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const OUTFITS = [
  { slug: "lavender-blazer", name: "Lavender Oversized Blazer", image: require('@/assets/images/design/tv-blazer-lavender.jpg'), tint: ['#b48cff', '#6d3bff'], price: "$88", store: "TryVerse Store", color: "Lavender" },
  { slug: "cream-sweater", name: "Cream Sweater", image: require('@/assets/images/design/tv-top.jpg'), tint: ['#e9d9c4', '#b39a7a'], price: "$62", store: "TryVerse Store", color: "Cream" },
  { slug: "pink-dress", name: "Pink Midi Dress", image: require('@/assets/images/design/tv-pink-dress.jpg'), tint: ['#f7c6d3', '#c86a92'], price: "$74", store: "TryVerse Store", color: "Pink" },
  { slug: "white-shirt", name: "White Shirt", image: require('@/assets/images/design/tv-white-shirt.jpg'), tint: ['#e8ecf3', '#a6b0c2'], price: "$54", store: "TryVerse Store", color: "White" },
];

export default function TryOnScreen() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [outfit, setOutfit] = useState<any>(null);
  const [tab, setTab] = useState<"link" | "browse">("browse");
  const [linkUrl, setLinkUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const step = !photo ? 1 : !outfit ? 2 : 3;
  const canGenerate = !!photo && !!outfit && !generating;

  const handlePickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleDemoPhoto = () => {
    setPhoto(Image.resolveAssetSource(require('@/assets/images/design/tv-user.jpg')).uri);
  };

  const handleFetchLink = () => {
    if (!linkUrl) return;
    setFetching(true);
    setTimeout(() => {
      setFetched(OUTFITS[0]);
      setFetching(false);
    }, 700);
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      router.push({ pathname: '/try-on-result', params: { photo, outfitSlug: outfit.slug } });
    }, 1600);
  };

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>HK</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <TypographyText variant="h1" style={styles.title}>Virtual Try-On</TypographyText>
          <TypographyText variant="small" style={styles.subtitle}>Upload your photo and see how clothes look on you before checkout.</TypographyText>
        </View>

        <View style={styles.stepIndicator}>
          {[
            { n: 1, label: "Photo" },
            { n: 2, label: "Outfit" },
            { n: 3, label: "Result" }
          ].map((s, i, arr) => (
            <React.Fragment key={s.n}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, step >= s.n && styles.stepDotActive, step === s.n && styles.stepDotCurrent]}>
                  {step > s.n ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Text style={[styles.stepDotText, step === s.n && styles.stepDotTextCurrent]}>{s.n}</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, step === s.n && styles.stepLabelCurrent]}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.stepLine, step > s.n && styles.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>

        <GlassCard style={styles.card}>
          <TypographyText variant="bodySemibold" style={styles.cardTitle}>Your Photo</TypographyText>
          {!photo ? (
            <View style={styles.uploadArea}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <TypographyText variant="bodyMedium" style={{ marginTop: 8, color: '#fff' }}>Upload your photo</TypographyText>
              <TypographyText variant="small" style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Full-body photo works best</TypographyText>
              
              <TouchableOpacity style={styles.secondaryBtn} onPress={handlePickFile}>
                <Text style={styles.secondaryBtnText}>Choose Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleDemoPhoto} style={{ marginTop: 12 }}>
                <Text style={styles.demoBtnText}>Use demo photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewArea}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
                <Text style={styles.checkBadgeText}>Photo uploaded</Text>
              </View>
              <TouchableOpacity onPress={() => setPhoto(null)} style={styles.changeBtn}>
                <Text style={styles.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        <View style={{ opacity: !photo ? 0.5 : 1 }} pointerEvents={!photo ? 'none' : 'auto'}>
          <GlassCard style={styles.card}>
            <TypographyText variant="bodySemibold" style={styles.cardTitle}>Choose Outfit</TypographyText>
            
            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, tab === 'link' && styles.tabActive]} onPress={() => setTab('link')}>
                <Text style={[styles.tabText, tab === 'link' && styles.tabTextActive]}>Paste Link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, tab === 'browse' && styles.tabActive]} onPress={() => setTab('browse')}>
                <Text style={[styles.tabText, tab === 'browse' && styles.tabTextActive]}>Browse Store</Text>
              </TouchableOpacity>
            </View>

            {tab === 'link' ? (
              <View style={{ marginTop: 16 }}>
                <View style={styles.inputContainer}>
                  <Ionicons name="link-outline" size={18} color="rgba(255,255,255,0.5)" />
                  <RNTextInput
                    style={styles.input}
                    placeholder="Paste clothing product URL"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={linkUrl}
                    onChangeText={setLinkUrl}
                  />
                </View>
                <TouchableOpacity 
                  style={[styles.secondaryBtn, { marginTop: 8, opacity: !linkUrl || fetching ? 0.5 : 1 }]} 
                  onPress={handleFetchLink}
                  disabled={!linkUrl || fetching}
                >
                  <Text style={styles.secondaryBtnText}>{fetching ? "Fetching…" : "Fetch Outfit"}</Text>
                </TouchableOpacity>

                {fetched && (
                  <View style={styles.fetchedItem}>
                    <LinearGradient colors={fetched.tint} style={styles.fetchedThumb}>
                      <Image source={fetched.image} style={styles.fetchedImg} />
                    </LinearGradient>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.fetchedName} numberOfLines={1}>{fetched.name}</Text>
                      <Text style={styles.fetchedMeta}>{fetched.price} · {fetched.store}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.selectBtn, outfit?.slug === fetched.slug && styles.selectBtnActive]}
                      onPress={() => setOutfit(fetched)}
                    >
                      <Text style={styles.selectBtnText}>{outfit?.slug === fetched.slug ? "Selected" : "Select"}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                {OUTFITS.map(o => (
                  <TouchableOpacity 
                    key={o.slug} 
                    style={[styles.outfitItem, outfit?.slug === o.slug && styles.outfitItemActive]}
                    onPress={() => setOutfit(o)}
                  >
                    <LinearGradient colors={o.tint as [string, string]} style={styles.outfitThumb}>
                      <Image source={o.image} style={styles.outfitImg} />
                    </LinearGradient>
                    <Text style={styles.outfitName} numberOfLines={1}>{o.name}</Text>
                    <View style={[styles.selectBtnBadge, outfit?.slug === o.slug && styles.selectBtnActive]}>
                      <Text style={styles.selectBtnText}>{outfit?.slug === o.slug ? "Selected" : "Select"}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {outfit && (
              <View style={styles.selectedOutfit}>
                <LinearGradient colors={outfit.tint} style={styles.fetchedThumb}>
                  <Image source={outfit.image} style={styles.fetchedImg} />
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: Typography.body.fontFamily }}>Selected Outfit</Text>
                  <Text style={styles.fetchedName} numberOfLines={1}>{outfit.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setOutfit(null)}>
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        </View>

        <TouchableOpacity 
          style={[styles.primaryBtn, !canGenerate && styles.primaryBtnDisabled]} 
          onPress={handleGenerate}
          disabled={!canGenerate}
        >
          {generating ? (
            <Text style={styles.primaryBtnText}>Generating your look...</Text>
          ) : (
            <Text style={styles.primaryBtnText}>Generate Try-On</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.footerNote}>Your uploaded photo is deleted after your session.</Text>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 12, fontFamily: Typography.heading.fontFamily },
  titleSection: { paddingHorizontal: 20, marginTop: 20 },
  title: { fontSize: 24, color: '#c084fc' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 20, marginTop: 16, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  stepItem: { alignItems: 'center', gap: 6, flexDirection: 'row' },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: Colors.primary },
  stepDotCurrent: { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 8 },
  stepDotText: { color: '#fff', fontSize: 10, fontFamily: Typography.heading.fontFamily },
  stepDotTextCurrent: { color: '#fff' },
  stepLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: Typography.body.fontFamily },
  stepLabelCurrent: { color: '#fff' },
  stepLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 },
  stepLineActive: { backgroundColor: Colors.primary },
  card: { marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)' },
  cardTitle: { color: '#fff', fontSize: 14, marginBottom: 12 },
  uploadArea: { alignItems: 'center', padding: 24, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed' },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily, textAlign: 'center' },
  demoBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textDecorationLine: 'underline' },
  previewArea: { position: 'relative', height: 280, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  checkBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkBadgeText: { color: '#fff', fontSize: 10 },
  changeBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  changeBtnText: { color: '#fff', fontSize: 11 },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: Typography.bodyMedium.fontFamily },
  tabTextActive: { color: '#fff' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: '#fff', fontSize: 13, marginLeft: 8 },
  fetchedItem: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12 },
  fetchedThumb: { width: 44, height: 44, borderRadius: 8, overflow: 'hidden' },
  fetchedImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  fetchedName: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily },
  fetchedMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  selectBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  selectBtnActive: { backgroundColor: Colors.primary },
  selectBtnText: { color: '#fff', fontSize: 11, fontFamily: Typography.bodyMedium.fontFamily },
  outfitItem: { width: 100, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'transparent' },
  outfitItemActive: { borderColor: Colors.primary, backgroundColor: 'rgba(168,85,247,0.1)' },
  outfitThumb: { width: '100%', height: 100, borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  outfitImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  outfitName: { color: '#fff', fontSize: 11, textAlign: 'center', marginBottom: 8 },
  selectBtnBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 4, borderRadius: 8, alignItems: 'center' },
  selectedOutfit: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 12, backgroundColor: 'rgba(168,85,247,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  primaryBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  footerNote: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginTop: 12, paddingHorizontal: 40 }
});
