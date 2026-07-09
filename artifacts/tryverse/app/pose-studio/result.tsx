import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Colors, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PoseResultScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/pose-studio'), 1200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <Screen safeArea withBottomNav>
      <View style={styles.center}>
        <Ionicons name="images-outline" size={40} color="rgba(255,255,255,0.5)" />
        <TypographyText variant="h1" style={styles.title}>No result yet</TypographyText>
        <TypographyText variant="small" style={styles.subtitle}>Generate poses in Pose Studio to see your results.</TypographyText>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/pose-studio')}>
          <Text style={styles.primaryBtnText}>Go to Pose Studio</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  title: { fontSize: 22, color: '#fff', marginTop: 16, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center' },
  primaryBtn: { backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, marginTop: 24 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
});
