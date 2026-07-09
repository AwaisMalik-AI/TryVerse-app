import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Colors, Typography } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PACKS } from './index';

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const packId = params.packId as string || "plus";
  const pack = PACKS.find(p => p.id === packId) || PACKS[1];
  const newBalance = 182 + pack.credits;

  return (
    <Screen safeArea>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.iconBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <LinearGradient colors={['#7a3bff', '#c93bff']} style={styles.iconCircle}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </LinearGradient>
          
          <TypographyText variant="h1" style={styles.title}>Payment Successful</TypographyText>
          <TypographyText variant="body" style={styles.subtitle}>Your credits have been added.</TypographyText>

          <View style={styles.receiptCard}>
            <View style={styles.row}><Text style={styles.rowLabel}>Pack purchased</Text><Text style={styles.rowValue}>{pack.name}</Text></View>
            <View style={styles.row}><Text style={styles.rowLabel}>Credits added</Text><Text style={styles.rowValue}>{pack.credits}</Text></View>
            <View style={styles.row}><Text style={styles.rowLabel}>New balance</Text><Text style={[styles.rowValue, { color: '#c084fc', fontWeight: 'bold' }]}>{newBalance} credits</Text></View>
            <View style={styles.row}><Text style={styles.rowLabel}>Receipt sent to</Text><Text style={styles.rowValue}>hussnain@tryverse.app</Text></View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(tabs)/try-on')}>
              <Text style={styles.primaryBtnText}>Start Try-On</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/pose-studio')}>
              <Text style={styles.secondaryBtnText}>Open Pose Studio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => router.push('/(tabs)/home')}>
              <Text style={styles.linkText}>Back Home</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 20 },
  title: { fontSize: 24, color: '#fff', marginTop: 24, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center' },
  receiptCard: { width: '100%', marginTop: 32, padding: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  rowValue: { color: '#fff', fontSize: 13, fontWeight: '500' },
  actions: { width: '100%', marginTop: 32, gap: 12 },
  primaryBtn: { backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.08)', height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#fff', fontSize: 13, fontFamily: Typography.bodyMedium.fontFamily },
  linkText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', textDecorationLine: 'underline' }
});