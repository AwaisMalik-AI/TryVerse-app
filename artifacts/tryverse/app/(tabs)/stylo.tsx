import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { TextInput } from '@/components/TextInput';
import { Colors } from '@/constants/theme';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  role: 'user' | 'stylo';
  content: string;
}

const SUGGESTIONS = [
  'What should I wear today?',
  'What colors suit me?',
  'Style this blazer',
  'Find me something similar',
];

export default function StyloScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'stylo', content: 'Hi! I am Stylo, your personal AI fashion assistant. How can I help you style your look today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

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
      const errorMsg: Message = { id: Date.now().toString(), role: 'stylo', content: 'Sorry, I am having trouble connecting right now.' };
      setMessages(prev => [errorMsg, ...prev]);
    }
    
    setIsLoading(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperStylo]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={16} color={Colors.text} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleStylo]}>
          <TypographyText variant="body" color={isUser ? Colors.text : Colors.text}>{item.content}</TypographyText>
        </View>
      </View>
    );
  };

  return (
    <Screen safeArea withBottomNav style={styles.container}>
      <View style={styles.header}>
        <TypographyText variant="h2" style={styles.title}>Stylo</TypographyText>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          inverted
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isLoading ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : null
          }
          ListFooterComponent={
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
              {SUGGESTIONS.map(s => (
                <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => sendMessage(s)}>
                  <TypographyText variant="small" color={Colors.primary}>{s}</TypographyText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          }
        />

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom + 80, 24) }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Ask Stylo..."
              value={input}
              onChangeText={setInput}
              style={styles.input}
              onSubmitEditing={() => sendMessage(input)}
              returnKeyType="send"
            />
            <TouchableOpacity 
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} 
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color={input.trim() ? Colors.text : Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    textAlign: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    gap: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageWrapperUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageWrapperStylo: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: 'rgba(160, 32, 240, 0.3)',
    borderBottomRightRadius: 4,
  },
  bubbleStylo: {
    backgroundColor: Colors.surfaceHighlight,
    borderBottomLeftRadius: 4,
  },
  loadingWrapper: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  suggestionsContainer: {
    marginBottom: 32,
    marginTop: 16,
    flexDirection: 'row',
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(160, 32, 240, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(160, 32, 240, 0.3)',
    marginRight: 12,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    paddingRight: 48,
    marginBottom: 0,
  },
  sendButton: {
    position: 'absolute',
    right: 12,
    top: 18,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surfaceHighlight,
  }
});
