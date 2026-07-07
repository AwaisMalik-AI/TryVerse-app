import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme, Gradients, Spacing, FontSize, BorderRadius } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Your Images Are Safe',
    icon: 'images-outline' as const,
    content:
      'We do NOT save any user input images or generated images. All images are processed in real-time and deleted immediately after generation.',
  },
  {
    title: 'No Data Selling',
    icon: 'ban-outline' as const,
    content:
      'We never sell or share your personal data with third parties. Your privacy is our priority.',
  },
  {
    title: 'Secure Authentication',
    icon: 'lock-closed-outline' as const,
    content:
      'All data is encrypted and securely stored. We use industry-standard security practices to protect your account.',
  },
  {
    title: 'Image Processing',
    icon: 'flash-outline' as const,
    content:
      'Images are only used momentarily for AI generation and are never stored on our servers. Once processing completes, they are permanently deleted.',
  },
  {
    title: 'Account Data',
    icon: 'person-outline' as const,
    content:
      'We only store your email, name, and measurement preferences. Nothing more.',
  },
  {
    title: 'Your Rights',
    icon: 'hand-left-outline' as const,
    content:
      'You can delete your account and all associated data at any time. We respect your right to control your information.',
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100)}>
          <LinearGradient
            colors={Gradients.charcoal}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <View style={styles.headerIconBg}>
              <Ionicons name="shield-checkmark" size={48} color={theme.gold} />
            </View>
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.headerSubtitle}>Your data, your control</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.sectionsContainer}>
          {SECTIONS.map((section, index) => (
            <Animated.View
              key={section.title}
              entering={FadeInDown.delay(150 + index * 50)}
              style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBg}>
                  <Ionicons name={section.icon} size={22} color={theme.gold} />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  headerIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: theme.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: theme.textMuted,
  },
  sectionsContainer: { gap: Spacing.md },
  sectionCard: {
    backgroundColor: theme.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionIconBg: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: theme.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  sectionContent: {
    fontSize: FontSize.sm,
    color: theme.textSecondary,
    lineHeight: 22,
    paddingLeft: 56,
  },
});
