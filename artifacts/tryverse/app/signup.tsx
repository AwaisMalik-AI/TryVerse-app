import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TryVerseLogo } from '@/components/TryVerseLogo';
import { GoogleIcon } from '@/components/GoogleIcon';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!fullName || !email || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    const res = await signup(email, fullName);
    setIsLoading(false);

    if (res.ok) {
      setSentMessage(res.message || 'Verification email sent. Please check your inbox.');
    } else {
      setErrorMessage(res.error || 'Signup failed. Please try again.');
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <TryVerseLogo height={22} />
        </View>

        <Animated.View entering={FadeInUp.delay(100)} style={styles.titleContainer}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Start trying clothes on and saving your favorite looks.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Jane Doe"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          
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

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {sentMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successText}>{sentMessage}</Text>
              <Text style={styles.successText}>Follow the link in the email to finish creating your account, then log in.</Text>
              <Pressable style={styles.ctaPrimary} onPress={() => router.replace('/login')}>
                <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={[StyleSheet.absoluteFill, styles.ctaPrimaryGradient]} />
                <Text style={styles.ctaPrimaryText}>Go to Log In</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.ctaPrimary} onPress={handleSignup} disabled={isLoading}>
              <LinearGradient colors={['#7c3aed', '#a855f7', '#d946ef']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={[StyleSheet.absoluteFill, styles.ctaPrimaryGradient]} />
              <Text style={styles.ctaPrimaryText}>{isLoading ? "Sending..." : "Create Account"}</Text>
            </Pressable>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.line} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.social}>
          <Pressable style={styles.ctaSecondary} onPress={() => Alert.alert("Coming Soon", "Google login is coming soon.")}>
            <GoogleIcon size={18} />
            <Text style={styles.ctaSecondaryText}>Continue with Google</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)} style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <Pressable><Text style={styles.footerLink}>Log in</Text></Pressable>
            </Link>
          </View>
          <Text style={styles.footerNote}>By continuing, you agree to our Privacy Policy and Terms.</Text>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, position: 'relative' },
  backBtn: { position: 'absolute', left: 0, width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 20 },
  titleContainer: { marginTop: 20 },
  title: { fontFamily: 'ClashDisplay-Regular', fontSize: 24, color: '#fff' },
  subtitle: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  form: { marginTop: 16, gap: 10 },
  field: { gap: 6 },
  label: { fontFamily: 'Montserrat_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  inputWrap: { position: 'relative' },
  input: { height: 46, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#fff', paddingHorizontal: 14, fontFamily: 'Montserrat_400Regular', fontSize: 14 },
  toggleBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  toggleText: { fontFamily: 'Montserrat_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  ctaPrimary: { height: 48, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginTop: 8 },
  ctaPrimaryGradient: { borderRadius: 24 },
  ctaPrimaryText: { fontFamily: 'Montserrat_500Medium', fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { fontFamily: 'Montserrat_400Regular', fontSize: 10, letterSpacing: 2.5, color: 'rgba(255,255,255,0.4)' },
  social: { marginTop: 12 },
  ctaSecondary: { height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  ctaSecondaryText: { fontFamily: 'Montserrat_400Regular', fontSize: 12.5, color: 'rgba(255,255,255,0.85)' },
  footer: { marginTop: 'auto', paddingTop: 16, alignItems: 'center', gap: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  footerLink: { fontFamily: 'Montserrat_500Medium', fontSize: 12, color: 'rgba(196,181,253,1)' },
  footerNote: { fontFamily: 'Montserrat_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  errorBox: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)', backgroundColor: 'rgba(248,113,113,0.1)', padding: 12 },
  errorText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#fca5a5' },
  successBox: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(168,85,247,0.35)', backgroundColor: 'rgba(168,85,247,0.1)', padding: 16, gap: 10 },
  successTitle: { fontFamily: 'ClashDisplay-Medium', fontSize: 16, color: '#fff' },
  successText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
});
