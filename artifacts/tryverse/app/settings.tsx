import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { GlassCard } from '@/components/GlassCard';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [settings, setSettings] = useState({
    pushNotifications: true,
    autoDeleteUploads: true,
    autoDeleteResults: true,
    dataImprovement: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: async () => {
            await logout();
            router.replace('/welcome');
        }}
      ]
    );
  };

  const SettingRow = ({ title, subtitle, value, onToggle }: { title: string, subtitle?: string, value: boolean, onToggle: () => void }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <TypographyText variant="bodySemibold">{title}</TypographyText>
        {subtitle && <TypographyText variant="small" color={Colors.textMuted} style={styles.settingSubtitle}>{subtitle}</TypographyText>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.surfaceHighlight, true: Colors.primary }}
        thumbColor={Colors.text}
      />
    </View>
  );

  return (
    <Screen safeArea>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <TypographyText variant="h3">Settings</TypographyText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <TypographyText variant="h3" style={styles.sectionTitle}>Privacy</TypographyText>
          <GlassCard style={styles.card}>
            <SettingRow 
              title="Auto-delete uploads" 
              subtitle="Delete your photos automatically after your session ends."
              value={settings.autoDeleteUploads} 
              onToggle={() => toggleSetting('autoDeleteUploads')} 
            />
            <View style={styles.divider} />
            <SettingRow 
              title="Auto-delete results" 
              subtitle="Remove generated try-on images after your session ends."
              value={settings.autoDeleteResults} 
              onToggle={() => toggleSetting('autoDeleteResults')} 
            />
            <View style={styles.divider} />
            <SettingRow 
              title="Product Improvement" 
              subtitle="Allow your data to be used to improve the TryVerse AI."
              value={settings.dataImprovement} 
              onToggle={() => toggleSetting('dataImprovement')} 
            />
          </GlassCard>
        </View>

        <View style={styles.section}>
          <TypographyText variant="h3" style={styles.sectionTitle}>Notifications</TypographyText>
          <GlassCard style={styles.card}>
            <SettingRow 
              title="Push Notifications" 
              value={settings.pushNotifications} 
              onToggle={() => toggleSetting('pushNotifications')} 
            />
          </GlassCard>
        </View>

        <View style={styles.section}>
          <TypographyText variant="h3" style={styles.sectionTitle}>Account</TypographyText>
          <GlassCard style={styles.card}>
            <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
              <TypographyText variant="bodySemibold" color={Colors.text}>Log Out</TypographyText>
              <Ionicons name="log-out-outline" size={20} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Confirm Delete', 'Are you sure? This action cannot be undone.')}>
              <TypographyText variant="bodySemibold" color={Colors.error}>Delete Account</TypographyText>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </GlassCard>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  card: {
    padding: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingSubtitle: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  }
});
