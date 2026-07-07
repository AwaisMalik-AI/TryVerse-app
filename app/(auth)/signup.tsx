import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme, Gradients, Spacing, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Missing Fields', 'Please enter your name and email.');
      return;
    }
    setIsLoading(true);
    const result = await signup(email.trim(), fullName.trim());
    setIsLoading(false);
    if (result.ok) {
      Alert.alert(
        'Check Your Email',
        'We sent a verification link to your email where you can set your password. Please check your inbox, then come back and sign in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
      );
    } else {
      Alert.alert('Signup Failed', result.error || 'Could not create account');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Logo size="lg" style={styles.logo} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join TryVerse and discover your style</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <Input
            icon="person-outline"
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <Input
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Flow hint */}
          <View style={styles.hintCard}>
            <Ionicons name="information-circle-outline" size={18} color={theme.gold} />
            <Text style={styles.flowHint}>
              We'll send a verification link to your email where you can set your password.
            </Text>
          </View>

          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.signupButton,
              { opacity: pressed ? 0.85 : isLoading ? 0.6 : 1 },
            ]}
          >
            <LinearGradient
              colors={Gradients.gold}
              style={styles.signupButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.textInverse} />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={18} color={theme.textInverse} />
                  <Text style={styles.signupButtonText}>Create Account</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Login link */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </Link>
        </Animated.View>

        {/* Terms note */}
        <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.termsRow}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing['2xl'],
  },
  logo: {
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: theme.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    gap: 4,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: theme.goldMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: theme.goldBorder,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  flowHint: {
    flex: 1,
    fontSize: FontSize.sm,
    color: theme.goldLight,
    lineHeight: 20,
  },
  signupButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    ...Shadows.gold,
  },
  signupButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  signupButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: theme.textInverse,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
  },
  loginText: {
    fontSize: FontSize.base,
    color: theme.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.base,
    color: theme.gold,
    fontWeight: '700',
  },
  termsRow: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  termsText: {
    fontSize: FontSize.xs,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: theme.gold,
    fontWeight: '600',
  },
});
