import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';

const BACKGROUND_TASK = 'TRYVERSE_BACKGROUND_CHECK';

if (Platform.OS !== 'web') {
  TaskManager.defineTask(BACKGROUND_TASK, async () => {
    if (__DEV__) console.log('[BG] Background fetch running');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  });
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  if (!Device.isDevice) {
    if (__DEV__) console.log('[NOTIF] Must use physical device for push notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) console.log('[NOTIF] Permission not granted');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'TryVerse',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#c9a96e',
    });

    await Notifications.setNotificationChannelAsync('generation', {
      name: 'Generation Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200],
      lightColor: '#c9a96e',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'c5264b24-7574-4397-8c06-74f6b631e88c',
    });
    if (__DEV__) console.log('[NOTIF] Push token:', tokenData.data);
    return tokenData.data;
  } catch (e) {
    if (__DEV__) console.log('[NOTIF] Token error:', e);
    return null;
  }
}

export async function sendLocalNotification(title: string, body: string, data?: Record<string, unknown>) {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: { type: 'generation_complete', ...data },
      ...(Platform.OS === 'android' ? { channelId: 'generation' } : {}),
    },
    trigger: null,
  });
}

export async function scheduleReEngagementNotification() {
  if (Platform.OS === 'web') return;
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const hasReEngagement = existing.some(
    (n) => n.content.data?.type === 're_engagement'
  );
  if (hasReEngagement) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your credits have been refreshed!',
      body: 'Come back and try new outfits with your daily credits.',
      sound: 'default',
      data: { type: 're_engagement' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3 * 24 * 60 * 60,
    },
  });
}

export async function registerBackgroundTask() {
  if (Platform.OS === 'web') return;
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
        minimumInterval: 60 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      if (__DEV__) console.log('[BG] Background task registered');
    }
  } catch (e) {
    if (__DEV__) console.log('[BG] Registration failed:', e);
  }
}
