import { useCallback, useState } from 'react';
import * as GoogleAuth from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export function useGoogleAuth() {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const configured = !!WEB_CLIENT_ID;

  const [, , promptAsync] = GoogleAuth.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID || 'not-configured.apps.googleusercontent.com',
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  const signInWithGoogle = useCallback(async () => {
    setGoogleError(null);
    if (!configured) {
      setGoogleError('Google sign-in is not configured on this build. Please use your email address.');
      return;
    }
    setGoogleLoading(true);
    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        const idToken = result.params?.id_token;
        if (!idToken) {
          setGoogleError('Google did not return a sign-in token. Please try again.');
        } else {
          const res = await googleLogin(idToken);
          if (res.ok) {
            router.replace('/(tabs)/home');
          } else {
            setGoogleError(res.error || 'Google sign-in failed. Please try again.');
          }
        }
      } else if (result?.type === 'error') {
        setGoogleError('Google sign-in was interrupted. Please try again.');
      }
    } catch {
      setGoogleError('Could not start Google sign-in. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }, [configured, promptAsync, googleLogin, router]);

  return { signInWithGoogle, googleLoading, googleError };
}
