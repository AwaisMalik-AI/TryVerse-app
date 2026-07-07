import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';

const SAVED_LOOKS = [
  { id: '1', date: 'Today', image: require('../../assets/images/poses/street-stroll.jpg'), name: 'Classic Navy Blazer' },
  { id: '2', date: 'Yesterday', image: require('../../assets/images/poses/confident-standing.jpg'), name: 'Silk Midi Dress' },
  { id: '3', date: 'Last Week', image: require('../../assets/images/poses/jump-shot.jpg'), name: 'Linen Button-Up' },
];

export default function SavedScreen() {
  const router = useRouter();

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TypographyText variant="h1" style={styles.title}>Saved Looks</TypographyText>
          <TypographyText variant="body" color={Colors.textMuted}>Your try-on history and favorite outfits.</TypographyText>
        </View>

        <View style={styles.grid}>
          {SAVED_LOOKS.map((look) => (
            <View key={look.id} style={styles.lookCard}>
              <GlassCard style={styles.cardInner}>
                <Image source={look.image} style={styles.lookImage} />
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                <View style={styles.lookInfo}>
                  <TypographyText variant="small" color={Colors.textMuted}>{look.date}</TypographyText>
                  <TypographyText variant="bodySemibold" numberOfLines={1}>{look.name}</TypographyText>
                </View>
              </GlassCard>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    paddingBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  lookCard: {
    width: '47%',
  },
  cardInner: {
    padding: 0,
    overflow: 'hidden',
  },
  lookImage: {
    width: '100%',
    aspectRatio: 3/4,
  },
  actions: {
    position: 'absolute',
    top: 8,
    right: 8,
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(21, 21, 34, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookInfo: {
    padding: 12,
  }
});
