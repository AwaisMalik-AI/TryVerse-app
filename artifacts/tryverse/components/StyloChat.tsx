import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, Gradients, Spacing, FontSize, BorderRadius, Shadows, TAB_BAR_HEIGHT } from '@/constants/theme';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CHAT_HEIGHT = SCREEN_HEIGHT * 0.7;

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface StyloChatProps {
  visible: boolean;
  onClose: () => void;
}

const QUICK_SUGGESTIONS = [
  'What features do you offer?',
  'How does Virtual Try-On work?',
  'Tell me about pricing',
  'How to use Pose Studio?',
];

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={i} style={{ fontWeight: '700', color: theme.gold }}>{part.slice(2, -2)}</Text>;
    }
    return <Text key={i}>{part}</Text>;
  });
}

export function StyloChat({ visible, onClose }: StyloChatProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const slideAnim = useRef(new Animated.Value(CHAT_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);

  const initSession = useCallback(async () => {
    if (initialized) return;
    const newConvId = generateUUID();
    setConversationId(newConvId);

    try {
      const endpoint = user ? '/api/stylo/init' : '/api/stylo/init-public';
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: newConvId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation_id) setConversationId(data.conversation_id);
        const greeting = data.greeting || data.message || data.response;
        if (greeting) {
          setMessages([{
            id: 'welcome',
            role: 'bot',
            content: greeting,
            timestamp: new Date(),
            suggestions: QUICK_SUGGESTIONS,
          }]);
        }
      }
    } catch {
      /* Fallback to local greeting */
    }

    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'bot',
        content: "Hi! I'm Stylo, your TryVerse AI assistant. Ask me anything about our features, virtual try-on, pricing, or how to get started!",
        timestamp: new Date(),
        suggestions: QUICK_SUGGESTIONS,
      }]);
    }
    setInitialized(true);
  }, [initialized, user]);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      initSession();
    } else if (shouldRender) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: CHAT_HEIGHT, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible]);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || sending) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const body: Record<string, unknown> = { message: text };
      if (conversationId) body.conversation_id = conversationId;

      const endpoint = user ? '/api/stylo/chat' : '/api/stylo/chat-public';
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const botText = data.response || data.bot_message?.content || data.message || "I couldn't process that. Please try again.";
        if (data.conversation_id) setConversationId(data.conversation_id);

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: botText,
          timestamp: new Date(),
          suggestions: data.suggestions || data.quick_replies,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const err = await res.json().catch(() => null);
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: err?.detail || "Sorry, I'm having trouble right now. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Connection error. Please check your internet and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }

    setSending(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <View>
      <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
        {item.role === 'bot' && (
          <View style={styles.botAvatarRow}>
            <LinearGradient colors={Gradients.gold} style={styles.botAvatar}>
              <Ionicons name="sparkles" size={10} color="#fff" />
            </LinearGradient>
            <Text style={styles.botName}>Stylo</Text>
          </View>
        )}
        <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>
          {renderMarkdown(item.content)}
        </Text>
      </View>
      {item.suggestions && item.suggestions.length > 0 && index === messages.length - 1 && (
        <View style={styles.suggestionsRow}>
          {item.suggestions.map((s, i) => (
            <Pressable key={i} onPress={() => sendMessage(s)} style={({ pressed }) => [styles.suggestionChip, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={styles.suggestionText} numberOfLines={1}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  if (!shouldRender) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="auto">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.chatPositioner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.chatContainer, { transform: [{ translateY: slideAnim }] }]} pointerEvents="auto">
          <LinearGradient colors={Gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']} style={styles.styloAvatar}>
                <Ionicons name="sparkles" size={18} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.chatHeaderTitle}>Stylo</Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.chatHeaderSub}>Online · TryVerse Assistant</Text>
                </View>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.textInverse} />
            </Pressable>
          </LinearGradient>

          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />

          {sending && (
            <View style={styles.typingRow}>
              <LinearGradient colors={Gradients.gold} style={styles.typingAvatar}>
                <Ionicons name="sparkles" size={8} color="#fff" />
              </LinearGradient>
              <View style={styles.typingDots}>
                <View style={styles.dot} />
                <View style={[styles.dot, { opacity: 0.6 }]} />
                <View style={[styles.dot, { opacity: 0.3 }]} />
              </View>
              <Text style={styles.typingText}>Stylo is typing...</Text>
            </View>
          )}

          <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TextInput
              style={styles.input}
              placeholder="Ask Stylo anything..."
              placeholderTextColor={theme.placeholder}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              multiline
              maxLength={500}
              selectionColor={theme.gold}
            />
            <Pressable
              onPress={() => sendMessage()}
              disabled={!input.trim() || sending}
              style={({ pressed }) => [styles.sendBtn, { opacity: pressed ? 0.7 : input.trim() ? 1 : 0.4 }]}
            >
              <LinearGradient colors={Gradients.gold} style={styles.sendBtnGradient}>
                <Ionicons name="send" size={16} color={theme.textInverse} />
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

export function StyloFAB({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const bottomOffset = TAB_BAR_HEIGHT + Math.max(insets.bottom, 10) + 10;

  return (
    <Animated.View style={[styles.fabContainer, { bottom: bottomOffset, transform: [{ scale: pulseAnim }] }]}>
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
        <LinearGradient colors={Gradients.gold} style={styles.fab}>
          <Ionicons name="sparkles" size={24} color={theme.textInverse} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  chatPositioner: { flex: 1, justifyContent: 'flex-end' },
  chatContainer: {
    height: CHAT_HEIGHT,
    backgroundColor: theme.background,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },

  chatHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  styloAvatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  chatHeaderTitle: { fontSize: FontSize.md, fontWeight: '700', color: theme.textInverse },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  chatHeaderSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  messageList: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, paddingBottom: Spacing.sm },
  bubble: { maxWidth: '85%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: theme.gold, borderBottomRightRadius: 4 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderBottomLeftRadius: 4 },
  botAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  botAvatar: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  botName: { fontSize: 10, fontWeight: '700', color: theme.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  bubbleText: { fontSize: FontSize.base, color: theme.text, lineHeight: 22 },
  userBubbleText: { color: theme.textInverse },

  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md, paddingLeft: 4 },
  suggestionChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: theme.goldBorder,
    backgroundColor: theme.goldMuted,
  },
  suggestionText: { fontSize: FontSize.xs, color: theme.gold, fontWeight: '600' },

  typingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  typingAvatar: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  typingDots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.gold },
  typingText: { fontSize: FontSize.xs, color: theme.textMuted },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
  input: {
    flex: 1, fontSize: FontSize.base, color: theme.text,
    backgroundColor: theme.inputBg, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    borderWidth: 1, borderColor: theme.inputBorder,
    minHeight: 42, maxHeight: 100,
  },
  sendBtn: {},
  sendBtnGradient: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },

  fabContainer: {
    position: 'absolute', right: 20,
    zIndex: 999,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.gold,
  },
});
