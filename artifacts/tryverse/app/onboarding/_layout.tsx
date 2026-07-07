import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background },
      animation: 'fade',
    }}>
      <Stack.Screen name="try-on" />
      <Stack.Screen name="stylo" />
      <Stack.Screen name="save" />
    </Stack>
  );
}
