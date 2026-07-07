import { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, Gradients, Spacing, FontSize, BorderRadius, Shadows, TAB_BAR_HEIGHT } from '@/constants/theme';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const CHAT_HEIGHT = SCREEN_HEIGHT * 0.65;

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface StyloChatProps {
  visible: boolean;
  onClose: () => void;
}

export function StyloChat({ visible, onClose }: StyloChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const slideAnim = useRef(new Animated.Value(CHAT_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      if (messages.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'bot',
          content: "Hi! I'm Stylo, your TryVerse assistant. Ask me anything about our features, pricing, or how to get started!",
          timestamp: new Date(),
        }]);
      }
    } else if (shouldRender) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: CHAT_HEIGHT, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const body: Record<string, unknown> = { message: text };
      if (conversationId) body.conversation_id = conversationId;

      const endpoint = user ? '/api/stylo/chat' : '/api/stylo/public-chat';
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const botText = data.response || data.bot_message?.content || data.message || "I couldn't process that. Please try again.";
        if (data.conversation_id) setConversationId(data.conversation_id);

        const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', content: botText, timestamp: new Date() };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const err = await res.json().catch(() => null);
        const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', content: err?.detail || "Sorry, I'm having trouble right now. Please try again.", timestamp: new Date() };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', content: 'Connection error. Please check your internet and try again.', timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
    }

    setSending(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
      {item.role === 'bot' && (
        <View style={styles.botIcon}>
          <Ionicons name="sparkles" size={12} color={theme.gold} />
        </View>
      )}
      <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>
        {item.content}
      </Text>
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
          {/* Chat header */}
          <LinearGradient colors={Gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              <View style={styles.styloAvatar}>
                <Ionicons name="sparkles" size={16} color={theme.gold} />
              </View>
              <View>
                <Text style={styles.chatHeaderTitle}>Stylo</Text>
                <Text style={styles.chatHeaderSub}>TryVerse Assistant</Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={theme.textInverse} />
            </Pressable>
          </LinearGradient>

          {/* Messages */}
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
              <View style={styles.botIcon}><Ionicons name="sparkles" size={10} color={theme.gold} /></View>
              <ActivityIndicator size="small" color={theme.gold} />
              <Text style={styles.typingText}>Stylo is typing...</Text>
            </View>
          )}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask Stylo anything..."
              placeholderTextColor={theme.placeholder}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline
              maxLength={500}
              selectionColor={theme.gold}
            />
            <Pressable
              onPress={sendMessage}
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

  return (
    <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
        <LinearGradient colors={Gradients.gold} style={styles.fab}>
          <Ionicons name="sparkles" size={24} color={theme.textInverse} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
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
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  styloAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  chatHeaderTitle: { fontSize: FontSize.md, fontWeight: '700', color: theme.textInverse },
  chatHeaderSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },

  messageList: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  bubble: { maxWidth: '82%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: theme.gold },
  botBubble: { alignSelf: 'flex-start', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  botIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: theme.goldMuted, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  bubbleText: { fontSize: FontSize.base, color: theme.text, lineHeight: 22 },
  userBubbleText: { color: theme.textInverse },

  typingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  typingText: { fontSize: FontSize.xs, color: theme.textMuted },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderTopWidth: 1, borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
  input: {
    flex: 1, fontSize: FontSize.base, color: theme.text,
    backgroundColor: theme.inputBg, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: theme.inputBorder,
    minHeight: 40, maxHeight: 100,
  },
  sendBtn: {},
  sendBtnGradient: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },

  fabContainer: {
    position: 'absolute', bottom: TAB_BAR_HEIGHT + 20, right: 20,
    zIndex: 999,
  },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.gold,
  },
});
