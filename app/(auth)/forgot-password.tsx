import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme, Gradients, Spacing, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { apiPost } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    const result = await apiPost('/api/auth/forgot-password', { email: email.trim() });
    setIsLoading(false);
    if (result.ok) {
      setSent(true);
    } else {
      Alert.alert('Error', result.error || 'Could not send reset email');
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={[styles.centerContent, { paddingTop: insets.top }]}>
          <Animated.View entering={FadeIn.delay(100)} style={styles.successIconWrapper}>
            <View style={styles.successRing}>
              <Ionicons name="checkmark-circle" size={64} color={theme.gold} />
            </View>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={styles.successTitle}>Check Your Email</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300)}>
            <Text style={styles.successDesc}>
              We've sent a password reset link to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400)}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backToLoginBtn, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Ionicons name="arrow-back" size={18} color={theme.gold} />
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.iconBadge}>
            <Ionicons name="key-outline" size={28} color={theme.gold} />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Input
            icon="mail-outline"
            label="Email Address"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPress={handleReset}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.resetButton,
              { opacity: pressed ? 0.85 : isLoading ? 0.6 : 1 },
            ]}
          >
            <LinearGradient
              colors={Gradients.gold}
              style={styles.resetButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.textInverse} />
              ) : (
                <>
                  <Ionicons name="send-outline" size={18} color={theme.textInverse} />
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  header: {
    marginBottom: Spacing['2xl'],
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.goldMuted,
    borderWidth: 1,
    borderColor: theme.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: theme.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  resetButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    ...Shadows.gold,
  },
  resetButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  resetButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: theme.textInverse,
  },
  successIconWrapper: {
    marginBottom: Spacing.xl,
  },
  successRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.goldMuted,
    borderWidth: 2,
    borderColor: theme.goldBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: theme.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: FontSize.base,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: theme.gold,
    fontWeight: '600',
  },
  backToLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing['2xl'],
    paddingVertical: Spacing.sm,
  },
  backToLoginText: {
    fontSize: FontSize.base,
    color: theme.gold,
    fontWeight: '700',
  },
});
