import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, TextInput, Image } from 'react-native';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { Colors } from '@/constants/theme';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  id: string;
  role: 'user' | 'stylo';
  content: string;
}

const SUGGESTIONS = [
  'What should I wear with a lavender blazer?',
  'Help me find a summer look',
  'Which color suits me best?',
  'Style me for work',
];

const CHIPS = [
  "Rate my outfit",
  "What colors suit me?",
  "Style this item",
  "Find similar products",
];

export default function StyloScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async (): Promise<string | null> => {
    const endpoint = isAuthenticated ? '/api/stylo/init' : '/api/stylo/init-public';
    const res = await apiPost<{ conversation_id: string }>(endpoint, {});
    if (res.ok && res.data) {
      setConversationId(res.data.conversation_id);
      return res.data.conversation_id;
    }
    return null;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [userMsg, ...prev]);
    setInput('');
    setIsLoading(true);

    let convId = conversationId;
    if (!convId) {
      convId = await initChat();
    }

    const endpoint = isAuthenticated ? '/api/stylo/chat' : '/api/stylo/chat-public';
    const res = await apiPost<{ response: string }>(endpoint, {
      conversation_id: convId,
      message: text
    });

    if (res.ok && res.data) {
      const styloMsg: Message = { id: Date.now().toString(), role: 'stylo', content: res.data.response };
      setMessages(prev => [styloMsg, ...prev]);
    } else {
      console.warn('[Stylo] chat request failed:', res.error);
      const errorMsg: Message = { id: Date.now().toString(), role: 'stylo', content: "I couldn't reach the styling service right now. Please check your connection and try again." };
      setMessages(prev => [errorMsg, ...prev]);
    }
    
    setIsLoading(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowStylo]}>
        {!isUser && (
          <View style={styles.styloAvatarSmall}>
            <Ionicons name="sparkles" size={12} color="#fff" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleStylo]}>
          <Text style={styles.msgText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  const HeaderComponent = () => (
    <View style={styles.listHeader}>
      <View style={styles.heroBox}>
        <View style={styles.heroAvatar}>
          <Ionicons name="sparkles" size={24} color="#fff" />
        </View>
        <Text style={styles.heroSub}>Stylo</Text>
        <Text style={styles.heroTitle}>Hi Hussnain, I'm Stylo. What are we styling today?</Text>
        <View style={styles.chipGrid}>
          {CHIPS.map(c => (
            <TouchableOpacity key={c} style={styles.chip} onPress={() => sendMessage(c)}>
              <Text style={styles.chipText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {isLoading && (
        <View style={[styles.msgRow, styles.msgRowStylo, { marginTop: 24 }]}>
          <View style={styles.styloAvatarSmall}>
            <Ionicons name="sparkles" size={12} color="#fff" />
          </View>
          <View style={[styles.bubble, styles.bubbleStylo, { paddingHorizontal: 20 }]}>
            <ActivityIndicator size="small" color="#c084fc" />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <Screen safeArea withBottomNav>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TryVerseLogo height={30} width={120} />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            <View style={styles.dotBadge} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>HK</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.headingMain}><Text style={styles.gradText}>AI Stylist</Text></Text>
        <Text style={styles.headingDesc}>Ask Stylo for outfit advice, color matching, size guidance, and product ideas.</Text>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          inverted
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<HeaderComponent />}
        />

        {messages.length <= 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>TRY ASKING</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
              {SUGGESTIONS.map(s => (
                <TouchableOpacity key={s} style={styles.suggestionBox} onPress={() => sendMessage(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#fff" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom + 80, 24) }]}>
          <TouchableOpacity style={styles.plusBtn} onPress={() => setSheet(true)}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
          <TextInput
            placeholder="Ask Stylo anything..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={input}
            onChangeText={setInput}
            style={styles.input}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]} 
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            <Ionicons name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {sheet && (
        <View style={styles.sheetScrim}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSheet(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add to chat</Text>
              <TouchableOpacity style={styles.iconBtnSmall} onPress={() => setSheet(false)}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetBody}>
              {[
                { icon: "camera-outline", title: "Upload outfit photo", desc: "Snap or choose a full-body outfit" },
                { icon: "images-outline", title: "Choose saved look", desc: "Restyle one of your saved outfits" },
                { icon: "link-outline", title: "Paste product link", desc: "Style around a specific clothing item" }
              ].map((opt) => (
                <TouchableOpacity key={opt.title} style={styles.sheetOpt} onPress={() => { setSheet(false); sendMessage(`I'd like to ${opt.title.toLowerCase()}`); }}>
                  <View style={styles.sheetOptIcon}><Ionicons name={opt.icon as any} size={20} color="#fff" /></View>
                  <View style={styles.sheetOptText}>
                    <Text style={styles.sheetOptTitle}>{opt.title}</Text>
                    <Text style={styles.sheetOptDesc}>{opt.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dotBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#c084fc', borderWidth: 1, borderColor: '#1a0730' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontFamily: 'ClashDisplay-Semibold' },
  titleSection: { paddingHorizontal: 20, marginTop: 16 },
  headingMain: { fontSize: 24, color: '#fff', fontFamily: 'ClashDisplay-Semibold' },
  gradText: { color: '#c084fc' },
  headingDesc: { fontSize: 12.5, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  
  keyboardAvoid: { flex: 1, marginTop: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  listHeader: { paddingBottom: 24 },
  
  heroBox: { alignItems: 'center', padding: 24, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  heroAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(124,58,237,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(216,180,254,0.3)' },
  heroSub: { fontSize: 10, fontFamily: 'Montserrat_600SemiBold', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: 2, marginTop: 12 },
  heroTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff', textAlign: 'center', marginTop: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipText: { fontSize: 11, fontFamily: 'Montserrat_500Medium', color: 'rgba(255,255,255,0.8)' },
  
  msgRow: { flexDirection: 'row', marginBottom: 12 },
  msgRowUser: { justifyContent: 'flex-end', paddingLeft: 40 },
  msgRowStylo: { justifyContent: 'flex-start', paddingRight: 40, gap: 10 },
  styloAvatarSmall: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(124,58,237,0.5)', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  bubbleUser: { backgroundColor: 'rgba(124,58,237,0.4)', borderBottomRightRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  bubbleStylo: { backgroundColor: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  msgText: { fontSize: 13, fontFamily: 'Montserrat_400Regular', color: '#fff', lineHeight: 20 },
  
  suggestionsContainer: { paddingVertical: 12 },
  suggestionsTitle: { fontSize: 10.5, fontFamily: 'Montserrat_600SemiBold', color: 'rgba(255,255,255,0.4)', paddingHorizontal: 20, letterSpacing: 1, marginBottom: 8 },
  suggestionsScroll: { paddingHorizontal: 20, gap: 8 },
  suggestionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 8 },
  suggestionText: { fontSize: 12, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#06010f', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', gap: 8 },
  plusBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22, paddingHorizontal: 16, color: '#fff', fontSize: 13, fontFamily: 'Montserrat_400Regular', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#c084fc', alignItems: 'center', justifyContent: 'center' },
  
  sheetScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', zIndex: 100 },
  sheet: { backgroundColor: '#11071c', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 20 },
  sheetTitle: { fontSize: 16, fontFamily: 'ClashDisplay-Semibold', color: '#fff' },
  iconBtnSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  sheetBody: { paddingHorizontal: 16, gap: 8 },
  sheetOpt: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 16 },
  sheetOptIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  sheetOptText: { flex: 1 },
  sheetOptTitle: { fontSize: 13, fontFamily: 'Montserrat_500Medium', color: '#fff' },
  sheetOptDesc: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 2 },
});