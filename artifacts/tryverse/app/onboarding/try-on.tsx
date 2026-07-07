import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function OnboardingTryOnScreen() {
  const router = useRouter();

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/images/poses/model-turn.jpg')} 
            style={styles.image} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <TypographyText variant="h1" style={styles.title}>Try Clothes On Yourself</TypographyText>
          <TypographyText variant="body" color={Colors.textMuted} style={styles.subtitle}>
            Upload your photo, choose an outfit, and see the look instantly.
          </TypographyText>
          
          <View style={styles.steps}>
            <TypographyText variant="bodySemibold" style={styles.step}>1. Upload photo</TypographyText>
            <TypographyText variant="bodySemibold" style={styles.step}>2. Choose outfit</TypographyText>
            <TypographyText variant="bodySemibold" style={styles.step}>3. See result</TypographyText>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Next" 
            onPress={() => router.push('/onboarding/stylo')} 
            style={styles.button}
          />
          <Button 
            title="Skip" 
            variant="text"
            onPress={() => router.push('/signup')} 
            style={styles.button}
          />
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
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    maxHeight: '40%',
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  steps: {
    alignItems: 'center',
    gap: 12,
  },
  step: {
    color: Colors.tertiary,
  },
  buttonContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  button: {
    width: '100%',
  }
});
