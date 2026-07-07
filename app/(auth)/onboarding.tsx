import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  Pressable,
  Image,
  ImageSourcePropType,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme, Spacing, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { Logo } from '@/components/Logo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Slide {
  id: string;
  title: string;
  highlight: string;
  description: string;
  image: ImageSourcePropType;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  gradient: readonly [string, string];
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Virtual',
    highlight: 'Try-On',
    description: 'See how any outfit looks on you before you buy — just upload a selfie',
    image: require('@/assets/images/poses/confident-standing.jpg'),
    icon: 'shirt-outline',
    accent: '#c9a96e',
    gradient: ['rgba(201,169,110,0.6)', 'rgba(10,10,20,0.95)'] as const,
  },
  {
    id: '2',
    title: 'AI Fashion',
    highlight: 'Stylist',
    description: 'Your personal AI stylist — outfit ideas, style advice & wardrobe planning',
    image: require('@/assets/images/poses/business-portrait.jpg'),
    icon: 'sparkles-outline',
    accent: '#8b6cc7',
    gradient: ['rgba(139,108,199,0.6)', 'rgba(10,10,20,0.95)'] as const,
  },
  {
    id: '3',
    title: 'Fashion',
    highlight: 'Store',
    description: 'Browse curated collections and try products from top brands instantly',
    image: require('@/assets/images/poses/executive-walk.jpg'),
    icon: 'storefront-outline',
    accent: '#3b82f6',
    gradient: ['rgba(59,130,246,0.5)', 'rgba(10,10,20,0.95)'] as const,
  },
  {
    id: '4',
    title: 'Pose',
    highlight: 'Studio',
    description: 'Transform selfies into 40+ professional fashion poses with one tap',
    image: require('@/assets/images/poses/model-turn.jpg'),
    icon: 'camera-outline',
    accent: '#22c55e',
    gradient: ['rgba(34,197,94,0.5)', 'rgba(10,10,20,0.95)'] as const,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  }, [currentIndex, router]);

  const handleSkip = useCallback(() => {
    router.replace('/(auth)/login');
  }, [router]);

  const currentSlide = slides[currentIndex];

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <Image source={item.image} style={styles.bgImage} />
      <LinearGradient
        colors={item.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Content layered on image */}
      <View style={[styles.slideContent, { paddingTop: insets.top + 16, paddingBottom: 200 }]}>
        {/* Top: Logo + Skip */}
        <View style={styles.topBar}>
          <Logo size="md" />
          <Pressable onPress={handleSkip} style={styles.skipPill}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Center: Glass icon badge */}
        <View style={styles.centerArea}>
          <View style={[styles.glassBadge, { borderColor: item.accent + '60' }]}>
            <View style={[styles.innerBadge, { backgroundColor: item.accent + '25' }]}>
              <Ionicons name={item.icon} size={36} color={item.accent} />
            </View>
          </View>
        </View>

        {/* Bottom: Title + Description */}
        <View style={styles.textArea}>
          <Text style={styles.slideTitle}>
            {item.title}{' '}
            <Text style={[styles.slideHighlight, { color: item.accent }]}>{item.highlight}</Text>
          </Text>
          <Text style={styles.slideDescription}>{item.description}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Bottom controls */}
      <View style={[styles.bottomArea, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((slide, i) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                i === currentIndex
                  ? [styles.dotActive, { backgroundColor: currentSlide.accent }]
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Action button */}
        <Pressable onPress={handleNext} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
          <LinearGradient
            colors={[currentSlide.accent, currentSlide.accent + 'cc']}
            style={styles.nextBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextBtnText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={currentIndex === slides.length - 1 ? 'arrow-forward' : 'chevron-forward'}
              size={20}
              color="#fff"
            />
          </LinearGradient>
        </Pressable>

        <Text style={styles.privacyNote}>Your photos are processed securely & never saved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  slide: {
    flex: 1,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  skipText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  centerArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  innerBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  slideTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  slideHighlight: {
    fontWeight: '800',
  },
  slideDescription: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  bottomArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
    backgroundColor: 'rgba(10,10,20,0.85)',
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 28,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  nextBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#fff',
  },
  privacyNote: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.4)',
  },
});
