import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { Logo } from '@/components/Logo';
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
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken = googleResponse.authentication?.idToken;
      if (idToken) {
        handleGoogleToken(idToken);
      } else {
        setIsGoogleLoading(false);
        Alert.alert('Google Sign-In', 'Could not get authentication token. Please try again.');
      }
    } else if (googleResponse?.type === 'error') {
      setIsGoogleLoading(false);
      Alert.alert('Google Sign-In Failed', 'Authentication was cancelled or failed.');
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Subtle background image */}
      <Image
        source={require('@/assets/images/poses/sunlight-portrait.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={styles.bgOverlay} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Logo area */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.logoArea}>
          <Logo size="lg" />
          <Text style={styles.tagline}>Try It Before You Buy It</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.light.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.light.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.light.textSecondary}
              />
            </Pressable>
          </View>

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </Link>

          <Pressable onPress={handleLogin} disabled={isLoading} style={styles.loginButton}>
            <LinearGradient
              colors={['#c9a96e', '#e8c98a']}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              {isLoading ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Divider */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* Google login */}
        <Animated.View entering={FadeInDown.delay(350)}>
          <Pressable
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}>
            {isGoogleLoading ? (
              <ActivityIndicator color={Colors.light.charcoal} size="small" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={Colors.light.charcoal} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* Sign up link */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </Link>
        </Animated.View>

        {/* Privacy reassurance */}
        <Animated.View entering={FadeInDown.delay(450)} style={styles.privacyRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.light.textMuted} />
          <Text style={styles.privacyText}>We never save your photos</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    gap: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surfaceSecondary,
    paddingHorizontal: Spacing.base,
    height: 54,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.light.text,
  },
  eyeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  forgotButton: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.light.gold,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonGradient: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.light.charcoal,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    fontSize: FontSize.sm,
    color: Colors.light.textMuted,
    marginHorizontal: Spacing.base,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  googleButtonText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.light.charcoal,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: Spacing.lg,
  },
  signupText: {
    fontSize: FontSize.base,
    color: Colors.light.charcoal,
    fontWeight: '500',
  },
  signupLink: {
    fontSize: FontSize.base,
    color: Colors.light.gold,
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
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
});
