import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text, TextInput as RNTextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Colors, Typography } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PACKS } from './index';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const packId = params.packId as string || "plus";
  const pack = PACKS.find(p => p.id === packId) || PACKS[1];
  const balance = 182;
  
  const [method, setMethod] = useState("card");
  const [form, setForm] = useState({ name: "Hussnain K.", email: "hussnain@tryverse.app", country: "United States", zip: "94105" });

  const handleContinue = () => {
    router.push({ pathname: '/pricing/payment', params: { packId } });
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

        <TypographyText variant="h1" style={styles.title}>Checkout</TypographyText>

        <View style={styles.summaryCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <LinearGradient colors={['#7a3bff', '#c93bff']} style={styles.balanceIcon}>
              <Ionicons name="flash" size={16} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{pack.name}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>{pack.credits} credits · ${pack.price}</Text>
            </View>
          </View>
          <View style={styles.balancePreview}>
            <View style={styles.row}><Text style={styles.rowLabel}>Current balance</Text><Text style={styles.rowValue}>{balance} credits</Text></View>
            <View style={styles.row}><Text style={styles.rowLabel}>New balance</Text><Text style={[styles.rowValue, { color: '#c084fc', fontWeight: 'bold' }]}>{balance + pack.credits} credits</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <View style={{ gap: 8 }}>
            {[
              { id: "card", label: "Credit / Debit Card" },
              { id: "apple", label: "Apple Pay" },
              { id: "google", label: "Google Pay" },
              { id: "paypal", label: "PayPal" }
            ].map(m => (
              <TouchableOpacity key={m.id} style={[styles.methodCard, method === m.id && styles.methodCardActive]} onPress={() => setMethod(m.id)}>
                <View style={[styles.radio, method === m.id && styles.radioActive]}>
                  {method === m.id && <View style={styles.radioInner} />}
                </View>
                <Text style={{ color: '#fff', fontSize: 13, marginLeft: 12 }}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing details</Text>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <RNTextInput style={styles.input} value={form.name} onChangeText={v => setForm({...form, name: v})} placeholderTextColor="rgba(255,255,255,0.5)" />
            </View>
            <View>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <RNTextInput style={styles.input} value={form.email} onChangeText={v => setForm({...form, email: v})} placeholderTextColor="rgba(255,255,255,0.5)" keyboardType="email-address" />
            </View>
            <View>
              <Text style={styles.inputLabel}>COUNTRY</Text>
              <RNTextInput style={styles.input} value={form.country} onChangeText={v => setForm({...form, country: v})} placeholderTextColor="rgba(255,255,255,0.5)" />
            </View>
            <View>
              <Text style={styles.inputLabel}>ZIP / POSTAL CODE</Text>
              <RNTextInput style={styles.input} value={form.zip} onChangeText={v => setForm({...form, zip: v})} placeholderTextColor="rgba(255,255,255,0.5)" />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
          <Text style={styles.primaryBtnText}>Continue to Payment</Text>
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
  summaryCard: { marginHorizontal: 20, marginTop: 16, padding: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  balanceIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  balancePreview: { marginTop: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  rowValue: { color: '#fff', fontSize: 12 },
  section: { marginHorizontal: 20, marginTop: 24 },
  sectionTitle: { color: '#fff', fontSize: 16, fontFamily: Typography.heading.fontFamily, marginBottom: 12 },
  methodCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  methodCardActive: { borderColor: 'rgba(148,88,255,0.7)', backgroundColor: 'rgba(148,88,255,0.1)' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  inputLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 },
  input: { height: 48, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', paddingHorizontal: 16, fontSize: 14 },
  primaryBtn: { marginHorizontal: 20, marginTop: 32, backgroundColor: Colors.primary, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontFamily: Typography.bodyMedium.fontFamily },
});