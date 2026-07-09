import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const tabs = [
  { name: 'home', label: 'Home', icon: "M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z" },
  { name: 'store', label: 'Store', icon: "M4 7h16l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM9 7a3 3 0 0 1 6 0" },
  { name: 'try-on', label: 'Try-On', icon: "M12 3l3 4h5l-4 4 2 7-6-4-6 4 2-7-4-4h5z" },
  { name: 'stylo', label: 'AI Stylist', icon: "M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" },
  { name: 'saved', label: 'Saved', icon: "M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" },
] as const;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24 + insets.bottom,
          left: 24,
          right: 24,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(15, 10, 25, 0.75)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          elevation: 0,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView tint="dark" intensity={80} style={[StyleSheet.absoluteFill, { borderRadius: 32 }]} />
          ) : null
        ),
        tabBarShowLabel: false,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ focused }) => (
              <View style={[styles.tabItem, focused && styles.tabItemActive]}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={focused ? '#fff' : Colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <Path d={tab.icon} />
                </Svg>
                {focused && <Text style={styles.tabLabel}>{tab.label}</Text>}
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabLabel: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: 12,
    color: '#fff',
  },
});
