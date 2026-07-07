import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme, Gradients, FontSize, Spacing, BorderRadius } from '@/constants/theme';

const STAGES = [
  { icon: 'scan-outline' as const, text: 'Analyzing your photo...', tip: 'Our AI is studying your body proportions and pose' },
  { icon: 'color-palette-outline' as const, text: 'Matching colors & textures...', tip: 'Ensuring fabric colors look natural with your skin tone' },
  { icon: 'body-outline' as const, text: 'Fitting the garment...', tip: 'Adjusting the clothing to your body shape' },
  { icon: 'sparkles-outline' as const, text: 'Adding finishing touches...', tip: 'Fine-tuning lighting, shadows, and wrinkles' },
  { icon: 'checkmark-done-outline' as const, text: 'Almost there...', tip: 'Final quality check before your result' },
  { icon: 'diamond-outline' as const, text: 'Polishing your look...', tip: 'Save your result to gallery once it appears' },
];

interface GeneratingOverlayProps {
  visible: boolean;
  message?: string;
  onComplete?: () => void;
  durationMs?: number;
}

export function GeneratingOverlay({ visible, message, onComplete, durationMs = 30000 }: GeneratingOverlayProps) {
  const { width } = useWindowDimensions();
  const PROGRESS_BAR_WIDTH = width * 0.75;
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const progressValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeValue, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeValue, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setStageIndex((i) => (i + 1) % STAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      progressValue.setValue(0);
      setStageIndex(0);
      return;
    }
    progressValue.setValue(0);
    const anim = Animated.timing(progressValue, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) onComplete?.();
    });
    return () => anim.stop();
  }, [visible, progressValue, onComplete]);

  useEffect(() => {
    if (!visible) return;
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
    );
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1.1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 0.95, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    spinAnimation.start();
    pulseAnimation.start();
    return () => { spinAnimation.stop(); pulseAnimation.stop(); };
  }, [visible, spinValue, pulseValue]);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const stage = STAGES[stageIndex];
  const displayMessage = message || stage.text;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <LinearGradient colors={['rgba(10, 10, 20, 0.97)', 'rgba(30, 25, 15, 0.97)']} style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]}>
              <LinearGradient colors={['#c9a96e', '#e8c98a', '#c9a96e']} style={styles.ringGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            </Animated.View>
            <Animated.View style={[styles.innerRing, { transform: [{ rotate: spin }, { scaleX: -1 }] }]}>
              <LinearGradient colors={['rgba(201,169,110,0.3)', 'transparent', 'rgba(201,169,110,0.3)']} style={styles.ringGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            </Animated.View>
            <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseValue }] }]}>
              <LinearGradient colors={Gradients.gold} style={styles.iconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={stage.icon} size={36} color="#fff" />
              </LinearGradient>
            </Animated.View>
          </View>

          <Animated.View style={{ opacity: fadeValue, alignItems: 'center' }}>
            <Text style={styles.title}>{displayMessage}</Text>
            <Text style={styles.tip}>{stage.tip}</Text>
          </Animated.View>

          <View style={[styles.progressContainer, { width: PROGRESS_BAR_WIDTH }]}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, {
                width: progressValue.interpolate({ inputRange: [0, 1], outputRange: [0, PROGRESS_BAR_WIDTH] }),
              }]}>
                <LinearGradient colors={Gradients.gold} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              </Animated.View>
            </View>
            <Text style={styles.subtitle}>{durationMs > 60000 ? 'This may take 1-3 minutes' : 'This usually takes 15-30 seconds'}</Text>
          </View>

          <View style={styles.stepsRow}>
            {STAGES.slice(0, 4).map((s, i) => (
              <View key={i} style={styles.step}>
                <View style={[styles.stepDot, i <= stageIndex && styles.stepDotActive]}>
                  {i < stageIndex ? (
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  ) : (
                    <View style={[styles.stepDotInner, i === stageIndex && styles.stepDotInnerActive]} />
                  )}
                </View>
                {i < 3 && <View style={[styles.stepLine, i < stageIndex && styles.stepLineActive]} />}
              </View>
            ))}
          </View>

          <View style={styles.privacyBadge}>
            <Ionicons name="shield-checkmark" size={14} color={theme.gold} />
            <Text style={styles.privacyText}>Your photos are processed securely and never stored</Text>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', paddingHorizontal: Spacing.xl, width: '100%' },
  iconContainer: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  outerRing: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 2.5, borderColor: 'transparent', borderTopColor: '#c9a96e', borderRightColor: '#e8c98a' },
  innerRing: { position: 'absolute', width: 115, height: 115, borderRadius: 57.5, borderWidth: 1.5, borderColor: 'transparent', borderTopColor: 'rgba(201,169,110,0.4)', borderLeftColor: 'rgba(232,201,138,0.3)' },
  ringGradient: { flex: 1, borderRadius: 65 },
  iconWrapper: { justifyContent: 'center', alignItems: 'center' },
  iconBg: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8, letterSpacing: -0.3 },
  tip: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.xl },
  progressContainer: { marginTop: 32, alignItems: 'center' },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', borderRadius: 2 },
  subtitle: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.45)', marginTop: 10 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  step: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  stepDotActive: { backgroundColor: theme.gold, borderColor: theme.gold },
  stepDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  stepDotInnerActive: { backgroundColor: '#fff' },
  stepLine: { width: 36, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 2 },
  stepLineActive: { backgroundColor: theme.gold },
  privacyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 32, backgroundColor: 'rgba(201,169,110,0.08)', paddingHorizontal: Spacing.base, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(201,169,110,0.15)' },
  privacyText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
});
