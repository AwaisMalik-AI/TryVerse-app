import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { Colors } from '@/constants/theme';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    const res = await signup(email, fullName);
    setIsLoading(false);
    
    if (res.ok) {
      Alert.alert('Success', 'Account created! Please log in.');
      router.replace('/login');
    } else {
      Alert.alert('Signup Failed', res.error || 'An error occurred');
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TypographyText variant="h1" style={styles.title}>Create your account</TypographyText>
          <TypographyText variant="body" color={Colors.textMuted}>Start trying clothes on and saving your looks.</TypographyText>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
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
            title="Create Account" 
            onPress={handleSignup} 
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
          <TypographyText variant="body" color={Colors.textMuted}>Already have an account? </TypographyText>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <TypographyText variant="bodySemibold" color={Colors.primary}>Log In</TypographyText>
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
