import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { theme, TAB_BAR_HEIGHT } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { StyloChat, StyloFAB } from '@/components/StyloChat';

export default function TabLayout() {
  const [styloOpen, setStyloOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.gold,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidTabBg]} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bag' : 'bag-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tryon"
        options={{
          title: 'Try On',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.centerTab, focused && styles.centerTabActive]}>
              <Ionicons name={focused ? 'shirt' : 'shirt-outline'} size={24} color={focused ? theme.textInverse : color} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="style"
        options={{
          title: 'Style',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
    <StyloFAB onPress={() => setStyloOpen(true)} />
    <StyloChat visible={styloOpen} onClose={() => setStyloOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: theme.tabBarBorder,
    elevation: 0,
    height: Platform.OS === 'ios' ? TAB_BAR_HEIGHT : 68,
    paddingTop: 8,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.tabBar,
  },
  androidTabBg: {
    backgroundColor: theme.tabBar,
    borderTopWidth: 1,
    borderTopColor: theme.tabBarBorder,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  centerTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  centerTabActive: {
    backgroundColor: theme.gold,
    borderColor: theme.goldDark,
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
