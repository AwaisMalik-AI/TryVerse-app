import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { GlassCard } from '@/components/GlassCard';
import { useRouter } from 'expo-router';

export default function OnboardingStyloScreen() {
  const router = useRouter();

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.chatContainer}>
          <GlassCard style={styles.messageUser}>
            <TypographyText variant="body" color={Colors.text}>What should I wear with this blazer?</TypographyText>
          </GlassCard>
          <GlassCard style={styles.messageStylo}>
            <TypographyText variant="bodySemibold" color={Colors.primary} style={styles.styloName}>Stylo</TypographyText>
            <TypographyText variant="body" color={Colors.text}>Try cream trousers, a neutral top, and soft lavender tones for a polished look.</TypographyText>
          </GlassCard>
        </View>
        
        <View style={styles.textContainer}>
          <TypographyText variant="h1" style={styles.title}>Meet Stylo, Your AI Fashion Assistant</TypographyText>
          <TypographyText variant="body" color={Colors.textMuted} style={styles.subtitle}>
            Get outfit advice, color suggestions, product ideas, and styling help in seconds.
          </TypographyText>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Next" 
            onPress={() => router.push('/onboarding/save')} 
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
  chatContainer: {
    flex: 1,
    maxHeight: '40%',
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 40,
  },
  messageUser: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(160, 32, 240, 0.2)',
    maxWidth: '80%',
    borderBottomRightRadius: 4,
  },
  messageStylo: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceHighlight,
    maxWidth: '85%',
    borderBottomLeftRadius: 4,
  },
  styloName: {
    marginBottom: 8,
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
