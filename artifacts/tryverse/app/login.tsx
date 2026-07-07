import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { Colors } from '@/constants/theme';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('user@tryverse.app');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);
    
    if (res.ok) {
      router.replace('/(tabs)/home');
    } else {
      Alert.alert('Login Failed', res.error || 'An error occurred');
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TypographyText variant="h1" style={styles.title}>Welcome back</TypographyText>
          <TypographyText variant="body" color={Colors.textMuted}>Log in to continue trying outfits with TryVerse.</TypographyText>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Button 
            title="Log In" 
            onPress={handleLogin} 
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.socialButtons}>
          <Button 
            title="Continue with Google" 
            variant="outline"
            onPress={() => Alert.alert('Coming Soon', 'Google login is coming soon.')} 
            style={styles.socialButton}
          />
          <Button 
            title="Continue with Apple" 
            variant="outline"
            onPress={() => Alert.alert('Coming Soon', 'Apple login is coming soon.')} 
            style={styles.socialButton}
          />
        </View>

        <View style={styles.footer}>
          <TypographyText variant="body" color={Colors.textMuted}>Don't have an account? </TypographyText>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <TypographyText variant="bodySemibold" color={Colors.primary}>Sign up</TypographyText>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  form: {
    marginBottom: 32,
  },
  submitButton: {
    marginTop: 16,
  },
  socialButtons: {
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
