import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function OnboardingSaveScreen() {
  const router = useRouter();

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.gallery}>
          <Image source={require('../../assets/images/poses/casual-lean.jpg')} style={[styles.galleryImage, styles.image1]} />
          <Image source={require('../../assets/images/poses/confident-standing.jpg')} style={[styles.galleryImage, styles.image2]} />
          <Image source={require('../../assets/images/poses/street-stroll.jpg')} style={[styles.galleryImage, styles.image3]} />
        </View>
        
        <View style={styles.textContainer}>
          <TypographyText variant="h1" style={styles.title}>Save Looks You Love</TypographyText>
          <TypographyText variant="body" color={Colors.textMuted} style={styles.subtitle}>
            Keep your try-on results, compare outfits, and shop with more confidence.
          </TypographyText>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Create Free Account" 
            onPress={() => router.push('/signup')} 
            style={styles.button}
          />
          <Button 
            title="Log In" 
            variant="outline"
            onPress={() => router.push('/login')} 
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
  gallery: {
    flex: 1,
    maxHeight: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: -20,
    marginTop: 20,
  },
  galleryImage: {
    width: 120,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  image1: {
    transform: [{ rotate: '-10deg' }],
    zIndex: 1,
  },
  image2: {
    transform: [{ scale: 1.1 }],
    zIndex: 2,
    borderColor: Colors.primary,
  },
  image3: {
    transform: [{ rotate: '10deg' }],
    zIndex: 1,
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
  },
  buttonContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  button: {
    width: '100%',
  }
});
