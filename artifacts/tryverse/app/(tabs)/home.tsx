import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { GlassCard } from '@/components/GlassCard';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const router = useRouter();

  const ActionCard = ({ title, icon, onPress }: { title: string, icon: keyof typeof Ionicons.glyphMap, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.cardWrapper}>
      <GlassCard style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={28} color={Colors.tertiary} />
        </View>
        <TypographyText variant="bodySemibold" style={styles.cardTitle}>{title}</TypographyText>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <TypographyText variant="h1" style={styles.greeting}>Welcome back, Hussnain</TypographyText>
              <TypographyText variant="body" color={Colors.textMuted}>What would you like to try today?</TypographyText>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
              <View style={styles.avatarMini}>
                <TypographyText variant="bodySemibold" color={Colors.text}>H</TypographyText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.grid}>
          <ActionCard title="Virtual Try-On" icon="shirt" onPress={() => router.push('/(tabs)/try-on')} />
          <ActionCard title="AI Fashion Store" icon="pricetag" onPress={() => router.push('/(tabs)/store')} />
          <ActionCard title="Ask Stylo" icon="chatbubbles" onPress={() => router.push('/(tabs)/stylo')} />
          <ActionCard title="Saved Looks" icon="bookmark" onPress={() => router.push('/(tabs)/saved')} />
        </View>

        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
          <TypographyText variant="small" color={Colors.textMuted} style={styles.privacyText}>
            Your photos and generated results are deleted after your session.
          </TypographyText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    marginBottom: 8,
  },
  profileBtn: {
    padding: 4,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(160, 32, 240, 0.2)',
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
  },
  cardWrapper: {
    width: '47%',
  },
  card: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(160, 32, 240, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(160, 32, 240, 0.4)',
  },
  cardTitle: {
    textAlign: 'center',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  privacyText: {
    flex: 1,
  }
});
