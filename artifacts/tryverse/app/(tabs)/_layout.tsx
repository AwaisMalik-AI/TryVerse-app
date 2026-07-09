import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const tabs = [
  { name: 'home', label: 'Home', icon: "M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z" },
  { name: 'store', label: 'Store', icon: "M4 7h16l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM9 7a3 3 0 0 1 6 0" },
  { name: 'try-on', label: 'Try-On', icon: "M12 3l3 4h5l-4 4 2 7-6-4-6 4 2-7-4-4h5z" },
  { name: 'stylo', label: 'AI Stylist', icon: "M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" },
  { name: 'saved', label: 'Saved', icon: "M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" },
] as const;

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.barWrap, { bottom: 12 + insets.bottom }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {Platform.OS === 'ios' ? (
          <BlurView tint="dark" intensity={80} style={[StyleSheet.absoluteFill, { borderRadius: 36 }]} />
        ) : null}
        {state.routes.map((route, index) => {
          const tab = tabs.find((t) => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const inner = (
            <>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeOpacity={focused ? 1 : 0.75} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <Path d={tab.icon} />
              </Svg>
              <Text style={[styles.tabLabel, !focused && styles.tabLabelInactive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </>
          );

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tabSlot} accessibilityRole="button" accessibilityState={focused ? { selected: true } : {}}>
              {focused ? (
                <LinearGradient colors={['#a855f7', '#7a3bff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tabItemActive}>
                  {inner}
                </LinearGradient>
              ) : (
                <View style={styles.tabItem}>{inner}</View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      {tabs.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 72,
    borderRadius: 36,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(15, 10, 25, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    elevation: 0,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  tabItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    minWidth: 64,
  },
  tabLabel: {
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: 11,
    color: '#fff',
  },
  tabLabelInactive: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
