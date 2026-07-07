import { useState, useEffect } from 'react';
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
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { theme, Spacing, FontSize, BorderRadius, Gradients, Shadows } from '@/constants/theme';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [_request, googleResponse, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (!googleResponse) return;
    if (googleResponse.type === 'success') {
      const idToken = googleResponse.authentication?.idToken;
      if (idToken) {
        handleGoogleToken(idToken);
      } else {
        setIsGoogleLoading(false);
        Alert.alert('Google Sign-In', 'Could not get authentication token.');
      }
    } else if (googleResponse.type === 'error') {
      setIsGoogleLoading(false);
      Alert.alert('Google Sign-In Failed', 'Authentication was cancelled or failed.');
    } else if (googleResponse.type === 'dismiss' || googleResponse.type === 'cancel') {
      setIsGoogleLoading(false);
    }
  }, [googleResponse]);

  const handleGoogleToken = async (idToken: string) => {
    const result = await googleLogin(idToken);
    setIsGoogleLoading(false);
    if (result.ok) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Google Sign-In Failed', result.error || 'Could not sign in with Google');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await promptAsync();
    } catch {
      setIsGoogleLoading(false);
      Alert.alert('Error', 'Could not open Google Sign-In');
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);
    if (result.ok) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
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
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.logoArea}>
          <Logo size="xl" />
          <Text style={styles.tagline}>Try It Before You Buy It</Text>
        </Animated.View>

        {/* Welcome text */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.welcomeArea}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <Input
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </Link>

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.loginButton,
              { opacity: pressed ? 0.85 : isLoading ? 0.6 : 1 },
            ]}
          >
            <LinearGradient
              colors={Gradients.gold}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.textInverse} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Divider */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* Google */}
        <Animated.View entering={FadeInDown.delay(350).springify()}>
          <Pressable
            style={({ pressed }) => [styles.googleButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={theme.text} size="small" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={theme.text} />
                <Text style={styles.googleButtonText}>Google</Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* Sign up link */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </Link>
        </Animated.View>

        {/* Privacy */}
        <Animated.View entering={FadeInDown.delay(450).springify()} style={styles.privacyRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={theme.textMuted} />
          <Text style={styles.privacyText}>Your photos are never saved</Text>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: theme.textMuted,
    marginTop: Spacing.xs,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  welcomeArea: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  welcomeTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: FontSize.base,
    color: theme.textSecondary,
    marginTop: 4,
  },
  form: {
    gap: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
  },
  forgotText: {
    fontSize: FontSize.sm,
    color: theme.gold,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.xs,
    ...Shadows.gold,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: theme.textInverse,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerText: {
    fontSize: FontSize.sm,
    color: theme.textMuted,
    marginHorizontal: Spacing.base,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: theme.borderLight,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    backgroundColor: theme.surface,
  },
  googleButtonText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: theme.text,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  signupText: {
    fontSize: FontSize.base,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  signupLink: {
    fontSize: FontSize.base,
    color: theme.gold,
    fontWeight: '700',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.base,
    marginBottom: Spacing.lg,
  },
  privacyText: {
    fontSize: FontSize.xs,
    color: theme.textMuted,
    fontWeight: '500',
  },
});
