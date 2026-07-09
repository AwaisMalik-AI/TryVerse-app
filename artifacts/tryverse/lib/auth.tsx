import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  getToken,
  getUser,
  setToken,
  setUser,
  clearSession,
  apiPost,
  apiFetch,
  setOnSessionExpired,
} from './api';

interface UserData {
  id: number;
  email: string;
  full_name: string;
  is_pro: boolean;
  profile_image?: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  googleLogin: (idToken: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, fullName: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  onSessionExpired: (callback: () => void) => () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ ok: false }),
  googleLogin: async () => ({ ok: false }),
  signup: async () => ({ ok: false }),
  logout: async () => {},
  refreshUser: async () => {},
  onSessionExpired: () => () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionExpiredListenersRef = useRef<Set<() => void>>(new Set());

  const onSessionExpired = useCallback((callback: () => void) => {
    sessionExpiredListenersRef.current.add(callback);
    return () => {
      sessionExpiredListenersRef.current.delete(callback);
    };
  }, []);

  useEffect(() => {
    setOnSessionExpired(() => {
      setUserState(null);
      sessionExpiredListenersRef.current.forEach((listener) => {
        try {
          listener();
        } catch {}
      });
    });
    return () => {
      setOnSessionExpired(null);
    };
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await apiFetch('/api/user/me');
      if (!response.ok) {
        await clearSession();
        setUserState(null);
        setIsLoading(false);
        return;
      }

      const userData = (await response.json()) as Record<string, unknown>;
      const enriched = await fetchSubscriptionStatus(userData);
      await setUser(enriched);
      setUserState(enriched as unknown as UserData);
    } catch {
      await clearSession();
      setUserState(null);
    }
    setIsLoading(false);
  };

  const fetchSubscriptionStatus = async (userData: Record<string, unknown>): Promise<Record<string, unknown>> => {
    try {
      const subRes = await apiFetch('/api/subscription/status');
      if (subRes.ok) {
        const subData = (await subRes.json()) as Record<string, unknown>;
        const credits = subData.credits as Record<string, unknown> | undefined;
        const plan = (subData.plan as string) || 'free';
        userData.is_pro =
          subData.is_pro === true ||
          credits?.is_pro === true ||
          (plan !== '' && plan !== 'free');
        userData.subscription_tier = plan;
      }
    } catch {}
    return userData;
  };

  const login = async (email: string, password: string) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        await setToken(data.access_token);
        const enriched = await fetchSubscriptionStatus(data.user as Record<string, unknown>);
        await setUser(enriched);
        setUserState(enriched as unknown as UserData);
        return { ok: true };
      } else {
        let errorMsg = 'Login failed';
        try {
          const errData = await response.json();
          if (typeof errData.detail === 'string') errorMsg = errData.detail;
        } catch {}
        return { ok: false, error: errorMsg };
      }
    } catch {
      return { ok: false, error: 'Cannot connect to the server. Please check your internet connection and try again.' };
    }
  };

  const googleLogin = async (idToken: string) => {
    try {
      const response = await apiFetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: idToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await setToken(data.access_token);
        const enriched = await fetchSubscriptionStatus(data.user as Record<string, unknown>);
        await setUser(enriched);
        setUserState(enriched as unknown as UserData);
        return { ok: true };
      } else {
        let errorMsg = 'Google sign-in failed';
        try {
          const errData = await response.json();
          if (typeof errData.detail === 'string') errorMsg = errData.detail;
        } catch {}
        return { ok: false, error: errorMsg };
      }
    } catch {
      return { ok: false, error: 'Cannot connect to the server. Please check your internet connection and try again.' };
    }
  };

  const signup = async (email: string, fullName: string) => {
    const res = await apiPost<{ message: string }>('/api/auth/signup', {
      email,
      full_name: fullName,
      source: 'user',
    });
    if (res.ok) {
      return { ok: true, message: res.data?.message || 'Verification email sent. Check your inbox.' };
    }
    return { ok: false, error: res.error || 'Signup failed' };
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    await clearSession();
    setUserState(null);
  };

  const refreshUser = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const response = await apiFetch('/api/user/me');
      if (!response.ok) return;
      const userData = (await response.json()) as Record<string, unknown>;
      const enriched = await fetchSubscriptionStatus(userData);
      await setUser(enriched);
      setUserState(enriched as unknown as UserData);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        googleLogin,
        signup,
        logout,
        refreshUser,
        onSessionExpired,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
