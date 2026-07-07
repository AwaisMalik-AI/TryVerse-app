import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { GlassCard } from '@/components/GlassCard';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const MenuItem = ({ icon, title, onPress }: { icon: keyof typeof Ionicons.glyphMap, title: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={20} color={Colors.primary} />
        </View>
        <TypographyText variant="bodySemibold">{title}</TypographyText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TypographyText variant="h1" style={styles.title}>Profile</TypographyText>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <TypographyText variant="h2" color={Colors.text}>
              {user?.full_name?.charAt(0) || 'U'}
            </TypographyText>
          </View>
          <View style={styles.userInfo}>
            <TypographyText variant="h3">{user?.full_name || 'Hussnain'}</TypographyText>
            <TypographyText variant="body" color={Colors.textMuted}>{user?.email || 'user@tryverse.app'}</TypographyText>
          </View>
        </View>

        <GlassCard style={styles.statsCard}>
          <View style={styles.stat}>
            <TypographyText variant="h2" color={Colors.primary}>24</TypographyText>
            <TypographyText variant="small" color={Colors.textMuted}>Looks Saved</TypographyText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <TypographyText variant="h2" color={Colors.primary}>12</TypographyText>
            <TypographyText variant="small" color={Colors.textMuted}>Items Tried</TypographyText>
          </View>
        </GlassCard>

        <View style={styles.menuSection}>
          <TypographyText variant="h3" style={styles.sectionTitle}>Preferences</TypographyText>
          <GlassCard style={styles.menuCard}>
            <MenuItem icon="body-outline" title="Body Measurements" onPress={() => {}} />
            <MenuItem icon="shirt-outline" title="Preferred Sizes" onPress={() => {}} />
            <MenuItem icon="color-palette-outline" title="Style Profile" onPress={() => {}} />
          </GlassCard>
        </View>

        <View style={styles.menuSection}>
          <TypographyText variant="h3" style={styles.sectionTitle}>Account</TypographyText>
          <GlassCard style={styles.menuCard}>
            <MenuItem icon="shield-checkmark-outline" title="Privacy Settings" onPress={() => router.push('/settings')} />
            <MenuItem icon="notifications-outline" title="Notifications" onPress={() => router.push('/settings')} />
          </GlassCard>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    marginBottom: 0,
  },
  settingsBtn: {
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(160, 32, 240, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    padding: 24,
    marginBottom: 32,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  menuCard: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(160, 32, 240, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
