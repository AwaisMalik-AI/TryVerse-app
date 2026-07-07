import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme, Gradients, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const faqs = [
  {
    q: 'How does Virtual Try-On work?',
    a: 'Upload a selfie, paste a product URL from any online store, and our AI generates a realistic image of you wearing that outfit. The process takes about 15-30 seconds.',
  },
  {
    q: 'Are my photos saved?',
    a: 'No. Your input photos and generated images are processed in real-time and immediately deleted after generation. We never store your images on our servers.',
  },
  {
    q: 'How to upgrade to Pro?',
    a: 'Go to Profile → Subscription to upgrade. Pro gives you unlimited generations, no watermarks, and priority processing.',
  },
  {
    q: "What's the difference between Free and Pro?",
    a: 'Free users get 10 AI generations per day with watermarks. Pro users get unlimited generations, no watermarks, HD quality outputs, and priority queue.',
  },
  {
    q: 'Which stores are available?',
    a: 'We have 10+ curated brand stores with hundreds of products. Browse the Shop tab to see all available stores and products.',
  },
];

export default function ContactUsScreen() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100)}>
          <LinearGradient colors={Gradients.gold} style={styles.headerCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.headerIcon}>
              <Ionicons name="chatbubbles" size={32} color={theme.gold} />
            </View>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSub}>We're here to help you look your best</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.contactCard}>
          <View style={styles.contactIconBg}>
            <Ionicons name="mail" size={24} color={theme.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>Email Us</Text>
            <Text style={styles.contactValue}>hello@tryverse.app</Text>
          </View>
          <Pressable
            onPress={() => Linking.openURL('mailto:hello@tryverse.app?subject=TryVerse App Support')}
            style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>Send Email</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, i) => (
            <Pressable
              key={i}
              onPress={() => setOpenFaq(openFaq === i ? null : i)}
              style={styles.faqItem}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons
                  name={openFaq === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.textMuted}
                />
              </View>
              {openFaq === i && <Text style={styles.faqAnswer}>{faq.a}</Text>}
            </Pressable>
          ))}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.surface,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.xl,
    alignItems: 'center', marginBottom: Spacing.xl,
  },
  headerIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.surfaceElevated, justifyContent: 'center',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: theme.textInverse },
  headerSub: { fontSize: FontSize.sm, color: theme.textInverse, opacity: 0.7, marginTop: 4 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.base,
    marginBottom: Spacing.xl, gap: Spacing.md,
  },
  contactIconBg: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: theme.goldMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  contactLabel: { fontSize: FontSize.sm, fontWeight: '700', color: theme.text },
  contactValue: { fontSize: FontSize.xs, color: theme.textSecondary, marginTop: 2 },
  contactBtn: {
    backgroundColor: theme.gold,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  contactBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: theme.textInverse },
  faqTitle: {
    fontSize: FontSize.lg, fontWeight: '700',
    color: theme.text, marginBottom: Spacing.base,
  },
  faqItem: {
    borderBottomWidth: 1, borderBottomColor: theme.borderLight,
    paddingVertical: Spacing.base,
  },
  faqHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: { fontSize: FontSize.base, fontWeight: '600', color: theme.text, flex: 1, marginRight: Spacing.sm },
  faqAnswer: {
    fontSize: FontSize.sm, color: theme.textSecondary,
    lineHeight: 22, marginTop: Spacing.sm,
  },
});
