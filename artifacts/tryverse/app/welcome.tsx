import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen safeArea={false}>
      <ImageBackground 
        source={require('../assets/images/poses/urban-background.jpg')} 
        style={styles.imageBackground}
      >
        <LinearGradient
          colors={['transparent', Colors.background]}
          locations={[0.2, 0.8]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.textContainer}>
              <TypographyText variant="h1" style={styles.title}>
                Try It Before You Buy It
              </TypographyText>
              <TypographyText variant="body" color={Colors.textMuted} style={styles.subtitle}>
                See how clothes look on you before checkout.
              </TypographyText>
            </View>

            <View style={styles.buttonContainer}>
              <Button 
                title="Get Started" 
                onPress={() => router.push('/onboarding/try-on')} 
                style={styles.button}
              />
              <Button 
                title="I already have an account" 
                variant="outline"
                onPress={() => router.push('/login')} 
                style={styles.button}
              />
              <TypographyText variant="small" color={Colors.textMuted} style={styles.disclaimer}>
                Private by design. Your photos stay yours.
              </TypographyText>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    height: '60%',
    justifyContent: 'space-between',
  },
  textContainer: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    width: '100%',
  },
  disclaimer: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.8,
  }
});
