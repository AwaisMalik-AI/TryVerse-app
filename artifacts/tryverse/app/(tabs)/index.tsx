import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Image,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme, Spacing, FontSize, BorderRadius, Gradients, TAB_BAR_SPACER, Shadows } from '@/constants/theme';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const heroFeature = {
  id: 'pose',
  title: 'Pose Studio',
  description: 'Transform your photos into professional fashion poses with AI',
  icon: 'camera-outline' as const,
  route: '/(tabs)/style?tab=poses' as const,
  gradient: Gradients.poseCard,
  bgImage: require('@/assets/images/poses/model-turn.jpg'),
  tag: 'MOST POPULAR',
};

const aiFeatures = [
  {
    id: 'tryon',
    title: 'Virtual Try-On',
    description: 'See any outfit on yourself',
    icon: 'shirt-outline' as const,
    route: '/(tabs)/tryon' as const,
    gradient: Gradients.tryonCard,
    bgImage: require('@/assets/images/poses/confident-standing.jpg'),
  },
  {
    id: 'stylist',
    title: 'AI Stylist',
    description: 'Personal style advisor',
    icon: 'sparkles-outline' as const,
    route: '/(tabs)/style' as const,
    gradient: Gradients.stylistCard,
    bgImage: require('@/assets/images/poses/business-portrait.jpg'),
  },
  {
    id: 'video',
    title: 'Video Studio',
    description: 'AI showcase videos',
    icon: 'videocam-outline' as const,
    route: '/video-studio' as const,
    gradient: Gradients.videoCard,
    bgImage: require('@/assets/images/poses/action-stride.jpg'),
  },
  {
    id: 'shop',
    title: 'Fashion Store',
    description: 'Browse & try curated items',
    icon: 'storefront-outline' as const,
    route: '/(tabs)/shop' as const,
    gradient: Gradients.shopCard,
    bgImage: require('@/assets/images/poses/coffee-shop.jpg'),
  },
];

const quickActions = [
  { id: 'pose', icon: 'camera' as const, label: 'Pose\nStudio', color: '#6b9b7a' },
  { id: 'upload', icon: 'shirt' as const, label: 'Try\nOn', color: theme.gold },
  { id: 'video', icon: 'videocam' as const, label: 'Video\nStudio', color: '#e8618c' },
  { id: 'history', icon: 'time' as const, label: 'My\nHistory', color: '#22c55e' },
];

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const CARD_WIDTH = (width - Spacing.xl * 2 - Spacing.md) / 2;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  }, [refreshUser]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.sm }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.gold}
            colors={[theme.gold]}
            progressBackgroundColor={theme.surface}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Logo size="sm" />
            <Text style={styles.greeting}>
              {getGreeting()},{' '}
              <Text style={styles.userName}>{firstName}</Text>
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={({ pressed }) => [styles.avatarButton, { opacity: pressed ? 0.8 : 1 }]}
          >
            <LinearGradient colors={Gradients.gold} style={styles.avatar}>
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Hero banner */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <ImageBackground
            source={require('@/assets/images/poses/sunlight-portrait.jpg')}
            style={styles.heroBanner}
            imageStyle={styles.heroBannerImage}
          >
            <LinearGradient
              colors={['rgba(10,10,20,0.6)', 'rgba(201,169,110,0.45)']}
              style={styles.heroOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.heroSlogan}>Try It Before You Buy It</Text>
              <Text style={styles.heroSub}>AI-powered virtual try-on for every outfit</Text>
              <View style={styles.heroBadge}>
                <Ionicons name="shield-checkmark" size={12} color={theme.gold} />
                <Text style={styles.heroBadgeText}>Photos are never saved</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>

        {/* Plan banner */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <View style={styles.planBanner}>
              <View style={styles.planLeft}>
                <View style={styles.planIconBg}>
                  <Ionicons
                    name={user?.is_pro ? 'trophy' : 'diamond-outline'}
                    size={18}
                    color={theme.goldLight}
                  />
                </View>
                <View>
                  <Text style={styles.planTitle}>
                    {user?.is_pro ? 'Pro Member' : 'Upgrade to Pro'}
                  </Text>
                  <Text style={styles.planDesc}>
                    {user?.is_pro ? 'Unlimited generations' : 'Unlock all premium features'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.goldLight} />
            </View>
          </Pressable>
        </Animated.View>

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.quickActionsRow}>
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              onPress={() => {
                if (action.id === 'pose') router.push('/(tabs)/style?tab=poses' as any);
                else if (action.id === 'upload') router.push('/(tabs)/tryon');
                else if (action.id === 'video') router.push('/video-studio' as any);
                else if (action.id === 'history') router.push('/history' as any);
              }}
              style={({ pressed }) => [styles.quickAction, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '18' }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Hero Feature — Pose Studio */}
        <Animated.View entering={FadeInDown.delay(250)}>
          <Pressable
            onPress={() => router.push(heroFeature.route as any)}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <ImageBackground
              source={heroFeature.bgImage}
              style={styles.heroFeatureCard}
              imageStyle={styles.heroFeatureBgImage}
            >
              <LinearGradient
                colors={[heroFeature.gradient[0] + 'CC', heroFeature.gradient[1] + 'EE']}
                style={styles.heroFeatureOverlay}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroFeatureTop}>
                  <View style={styles.heroFeatureTag}>
                    <Ionicons name="star" size={10} color={theme.gold} />
                    <Text style={styles.heroFeatureTagText}>{heroFeature.tag}</Text>
                  </View>
                  <View style={styles.featureArrow}>
                    <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.9)" />
                  </View>
                </View>
                <View>
                  <Text style={styles.heroFeatureTitle}>{heroFeature.title}</Text>
                  <Text style={styles.heroFeatureDesc}>{heroFeature.description}</Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        </Animated.View>

        {/* AI Features — 5 total (4 in grid + 1 hero above) */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Features</Text>
          <View style={styles.featureCount}>
            <Text style={styles.featureCountText}>5 Tools</Text>
          </View>
        </Animated.View>

        <View style={styles.featureGrid}>
          {aiFeatures.map((feature, index) => (
            <Animated.View key={feature.id} entering={FadeInDown.delay(350 + index * 60)}>
              <Pressable
                onPress={() => router.push(feature.route as any)}
                style={({ pressed }) => [
                  styles.featureCardWrapper,
                  { width: CARD_WIDTH, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <ImageBackground
                  source={feature.bgImage}
                  style={[styles.featureCard, { width: CARD_WIDTH, height: CARD_WIDTH * 1.15 }]}
                  imageStyle={styles.featureCardBgImage}
                >
                  <LinearGradient
                    colors={[feature.gradient[0] + 'DD', feature.gradient[1] + 'EE']}
                    style={styles.featureCardOverlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.featureIconBg}>
                      <Ionicons name={feature.icon} size={22} color="#fff" />
                    </View>
                    <View>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDesc}>{feature.description}</Text>
                    </View>
                    <View style={styles.featureArrow}>
                      <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.9)" />
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Pose previews */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pose Studio</Text>
          <Pressable onPress={() => router.push('/(tabs)/style?tab=poses' as any)}>
            <Text style={styles.seeAll}>See all →</Text>
          </Pressable>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.poseScroll}
        >
          {[
            { name: 'Confident\nStanding', img: require('@/assets/images/poses/confident-standing.jpg') },
            { name: 'Executive\nWalk', img: require('@/assets/images/poses/executive-walk.jpg') },
            { name: 'Casual\nLean', img: require('@/assets/images/poses/casual-lean.jpg') },
            { name: 'Model\nTurn', img: require('@/assets/images/poses/model-turn.jpg') },
            { name: 'Street\nStroll', img: require('@/assets/images/poses/street-stroll.jpg') },
          ].map((pose, i) => (
            <Animated.View key={i} entering={FadeInRight.delay(650 + i * 60)}>
              <Pressable
                onPress={() => router.push('/(tabs)/style?tab=poses' as any)}
                style={({ pressed }) => [styles.poseCard, { opacity: pressed ? 0.85 : 1 }]}
              >
                <Image source={pose.img} style={styles.poseImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.poseOverlay}
                >
                  <Text style={styles.poseName}>{pose.name}</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={{ height: TAB_BAR_SPACER }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.md,
    gap: 4,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: theme.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  userName: {
    fontWeight: '800',
    color: theme.text,
  },
  avatarButton: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: theme.textInverse,
  },

  // Hero
  heroBanner: {
    height: 150,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  heroBannerImage: {
    borderRadius: BorderRadius.xl,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  heroSlogan: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  heroBadgeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },

  // Plan banner
  planBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surfaceElevated,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: theme.goldBorder,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  planIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: theme.goldLight,
  },
  planDesc: {
    fontSize: FontSize.xs,
    color: theme.textMuted,
    marginTop: 1,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: theme.border,
  },
  quickActionLabel: {
    fontSize: FontSize.xs,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: theme.text,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: theme.gold,
    fontWeight: '600',
  },

  // Hero feature
  heroFeatureCard: {
    height: 140,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  heroFeatureBgImage: { borderRadius: BorderRadius.xl },
  heroFeatureOverlay: {
    flex: 1, borderRadius: BorderRadius.xl,
    padding: Spacing.base, justifyContent: 'space-between',
  },
  heroFeatureTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  heroFeatureTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: Spacing.md,
    paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  heroFeatureTagText: {
    fontSize: 10, fontWeight: '700', color: theme.gold,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  heroFeatureTitle: {
    fontSize: FontSize.xl, fontWeight: '800', color: '#fff', letterSpacing: -0.3,
  },
  heroFeatureDesc: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2, lineHeight: 18,
  },
  featureCount: {
    backgroundColor: theme.goldMuted, paddingHorizontal: Spacing.md,
    paddingVertical: 3, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: theme.goldBorder,
  },
  featureCountText: {
    fontSize: 10, fontWeight: '700', color: theme.gold,
  },

  // Feature grid
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureCardWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  featureCard: {},
  featureCardBgImage: {
    borderRadius: BorderRadius.xl,
  },
  featureCardOverlay: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    justifyContent: 'space-between',
  },
  featureIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
  featureDesc: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
    marginTop: 2,
  },
  featureArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },

  // Poses
  poseScroll: {
    paddingRight: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  poseCard: {
    width: 120,
    height: 165,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  poseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  poseOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing['3xl'],
  },
  poseName: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 14,
  },
});
