import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  registerForPushNotifications,
  scheduleReEngagementNotification,
  registerBackgroundTask,
} from '@/lib/notifications';
import { apiFetch } from '@/lib/api';
import { theme } from '@/constants/theme';
import 'react-native-reanimated';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, onSessionExpired } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = segments.length === 0 || segments[0] === undefined;
    if (!isAuthenticated && !inAuthGroup && !isRoot) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, segments]);

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      router.replace('/(auth)/login');
    });
    return unsubscribe;
  }, [onSessionExpired, router]);

  return <>{children}</>;
}

function InitEffects() {
  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        apiFetch('/api/notifications/register-push-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, platform: 'expo' }),
        }).catch(() => {});
      }
    }).catch(() => {});
    registerBackgroundTask().catch(() => {});
    scheduleReEngagementNotification().catch(() => {});
  }, []);
  return null;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InitEffects />
        <AuthGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="store-tryon" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="privacy-policy" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="contact-us" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="about" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="history" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="video-studio" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
        </AuthGuard>
        <StatusBar style="light" />
      </AuthProvider>
    </ErrorBoundary>
  );
}
