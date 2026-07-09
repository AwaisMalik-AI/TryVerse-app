import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';

export function getInitials(fullName?: string | null): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface UserAvatarProps {
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function UserAvatar({ size = 36, onPress, style }: UserAvatarProps) {
  const { user } = useAuth();
  const initials = getInitials(user?.full_name);

  const dimStyle: ViewStyle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.avatar, dimStyle, style]}>
      {initials ? (
        <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
      ) : (
        <Ionicons name="person-outline" size={size * 0.5} color="#fff" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'ClashDisplay-Semibold' },
});
