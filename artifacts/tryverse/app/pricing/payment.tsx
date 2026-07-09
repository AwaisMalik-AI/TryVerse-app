import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text, TextInput as RNTextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Colors, Typography } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PACKS } from './index';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const packId = params.packId as string || "plus";
  const pack = PACKS.find(p => p.id === packId) || PACKS[1];
  
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: "" });

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      router.push({ pathname: '/pricing/success', params: { packId } });
    }, 1800);
  };

  return (
    <Screen safeArea>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('@/assets/images/tryverse-logo.png')} style={{ height: 26, width: 100, resizeMode: 'contain' }} />
          <View style={{ width: 40 }} />
        </View>

        <TypographyText variant="h1" style={styles.title}>Payment</TypographyText>

        <View style={styles.heroCard}>
          <Text style={{ color: 'rgba(216,180,254,0.8)', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }}>{pack.name}</Text>
          <Text style={{ color: '#fff', fontSize: 28, fontFamily: Typography.heading.fontFamily, marginTop: 8 }}><Text style={{ color: '#c084fc' }}>{pack.credits}</Text> credits</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>${pack.price}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card details</Text>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={styles.inputLabel}>CARD NUMBER</Text>
              <RNTextInput style={styles.input} value={card.number} onChangeText={v => setCard({...card, number: v})} placeholder="1234 5678 9012 3456" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>EXPIRY</Text>
                <RNTextInput style={styles.input} value={card.exp} onChangeText={v => setCard({...card, exp: v})} placeholder="MM / YY" placeholderTextColor="rgba(255,255,255,0.3)" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CVC</Text>
                <RNTextInput style={styles.input} value={card.cvc} onChangeText={v => setCard({...card, cvc: v})} placeholder="123" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" />
              </View>
            </View>
            <View>
              <Text style={styles.inputLabel}>NAME ON CARD</Text>
              <RNTextInput style={styles.input} value={card.name} onChangeText={v => setCard({...card, name: v})} placeholderTextColor="rgba(255,255,255,0.3)" />
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 }}>
            <Ionicons name="lock-closed-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Payments are secure and encrypted.</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.primaryBtn, processing && { opacity: 0.7 }]} onPress={handlePay} disabled={processing}>
          <Text style={styles.primaryBtnText}>{processing ? "Processing payment..." : `Pay $${pack.price}`}</Text>
        </TouchableOpacity>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 22, color: '#fff', paddingHorizontal: 20, marginTop: 24 },
  heroCard: { marginHorizontal: 20, marginTop: 16, padding: 24, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  section: { marginHorizontal: 20, marginTop: 32 },
  sectionTitle: { color: '#fff', fontSize: 16, fontFamily: Typography.heading.fontFamily, marginBottom: 16 },
  inputLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 },
  input: { height: 48, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', paddingHorizontal: 16, fontSize: 14 },
  primaryBtn: { marginHorizontal: 20, marginTop: 32, backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
});