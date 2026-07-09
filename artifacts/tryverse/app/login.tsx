import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { GoogleIcon } from '@/components/GoogleIcon';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { apiPost } from '@/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const [googleMessage, setGoogleMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.ok) {
      router.replace('/(tabs)/home');
    } else {
      setErrorMessage(res.error || 'Login failed. Please try again.');
    }
  };

  const toggleForgot = () => {
    setForgotMessage(null);
    setForgotError(null);
    setForgotEmail(email);
    setShowForgot((v) => !v);
  };

  const handleForgot = async () => {
    if (!forgotEmail || forgotLoading) return;
    setForgotMessage(null);
    setForgotError(null);
    setForgotLoading(true);
    const res = await apiPost('/api/auth/forgot-password', { email: forgotEmail });
    setForgotLoading(false);
    if (res.ok) {
      setForgotMessage('If an account exists for that email, a reset link has been sent.');
    } else {
      setForgotError(res.error || 'Could not send reset link. Please try again.');
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <TryVerseLogo height={26} />
        </View>

        <Animated.View entering={FadeInUp.delay(100)} style={styles.titleContainer}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue trying outfits with TryVerse.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { paddingRight: 60 }]}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry={!showPw}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable style={styles.toggleBtn} onPress={() => setShowPw(!showPw)}>
                <Text style={styles.toggleText}>{showPw ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.formOptions}>
            <View style={styles.checkboxWrap}>
              <View style={styles.checkbox} />
              <Text style={styles.optionText}>Remember me</Text>
            </View>
            <Pressable onPress={toggleForgot}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          {showForgot ? (
            <View style={styles.forgotBox}>
              <Text style={styles.label}>Reset your password</Text>
              <TextInput
                style={[styles.input, { marginTop: 6 }]}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={forgotEmail}
                onChangeText={setForgotEmail}
              />
              {forgotMessage ? <Text style={styles.successText}>{forgotMessage}</Text> : null}
              {forgotError ? <Text style={styles.errorText}>{forgotError}</Text> : null}
              <Pressable style={styles.ctaSecondary} onPress={handleForgot} disabled={forgotLoading}>
                <Text style={styles.ctaSecondaryText}>{forgotLoading ? 'Sending...' : 'Send reset link'}</Text>
              </Pressable>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Pressable style={styles.ctaPrimary} onPress={handleLogin} disabled={isLoading}>
            <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={[StyleSheet.absoluteFill, styles.ctaPrimaryGradient]} />
            <Text style={styles.ctaPrimaryText}>{isLoading ? "Logging in..." : "Log In"}</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.line} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.social}>
          <Pressable style={styles.ctaSecondary} onPress={() => setGoogleMessage('Google sign-in is not available yet. Please use your email address.')}>
            <GoogleIcon size={18} />
            <Text style={styles.ctaSecondaryText}>Continue with Google</Text>
          </Pressable>
          {googleMessage ? <Text style={[styles.optionText, { marginTop: 8, textAlign: 'center' }]}>{googleMessage}</Text> : null}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)} style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/signup" asChild>
              <Pressable><Text style={styles.footerLink}>Sign up</Text></Pressable>
            </Link>
          </View>
          <Text style={styles.footerNote}>Secure login · Clothing-only AI</Text>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, position: 'relative' },
  backBtn: { position: 'absolute', left: 0, width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 20 },
  titleContainer: { marginTop: 24 },
  title: { fontFamily: 'ClashDisplay-Regular', fontSize: 26, color: '#fff' },
  subtitle: { fontFamily: 'Montserrat_400Regular', fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  form: { marginTop: 20, gap: 12 },
  field: { gap: 6 },
  label: { fontFamily: 'Montserrat_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  inputWrap: { position: 'relative' },
  input: { height: 46, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#fff', paddingHorizontal: 14, fontFamily: 'Montserrat_400Regular', fontSize: 14 },
  toggleBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  toggleText: { fontFamily: 'Montserrat_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  formOptions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  checkboxWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' },
  optionText: { fontFamily: 'Montserrat_400Regular', fontSize: 11.5, color: 'rgba(255,255,255,0.7)' },
  forgotText: { fontFamily: 'Montserrat_400Regular', fontSize: 11.5, color: 'rgba(196,181,253,0.9)' },
  ctaPrimary: { height: 48, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginTop: 4 },
  ctaPrimaryGradient: { borderRadius: 24 },
  ctaPrimaryText: { fontFamily: 'Montserrat_500Medium', fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { fontFamily: 'Montserrat_400Regular', fontSize: 10, letterSpacing: 2.5, color: 'rgba(255,255,255,0.4)' },
  social: { marginTop: 12 },
  ctaSecondary: { height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  ctaSecondaryText: { fontFamily: 'Montserrat_400Regular', fontSize: 12.5, color: 'rgba(255,255,255,0.85)' },
  footer: { marginTop: 'auto', paddingTop: 16, alignItems: 'center', gap: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  footerLink: { fontFamily: 'Montserrat_500Medium', fontSize: 12, color: 'rgba(196,181,253,1)' },
  footerNote: { fontFamily: 'Montserrat_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  errorBox: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)', backgroundColor: 'rgba(248,113,113,0.1)', padding: 12 },
  errorText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#fca5a5', marginTop: 8 },
  successText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#86efac', marginTop: 8 },
  forgotBox: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, gap: 4 },
});
