/**
 * TryVerse Mobile — Premium Dark Theme Design System
 * Gold + Charcoal palette with glass-morphism accents
 */

export const Colors = {
  dark: {
    // Core
    background: '#0a0a14',
    surface: '#12121e',
    surfaceElevated: '#1a1a2e',
    surfaceGlass: 'rgba(26, 26, 46, 0.85)',
    card: '#161625',
    cardHover: '#1e1e32',

    // Text
    text: '#f5f5f7',
    textSecondary: '#a1a1b5',
    textMuted: '#6b6b80',
    textInverse: '#0a0a14',

    // Brand
    gold: '#c9a96e',
    goldLight: '#e8c98a',
    goldDark: '#b08d4f',
    goldMuted: 'rgba(201, 169, 110, 0.15)',
    goldBorder: 'rgba(201, 169, 110, 0.3)',

    // Borders
    border: '#1e1e32',
    borderLight: '#2a2a40',
    borderGold: 'rgba(201, 169, 110, 0.25)',

    // Semantic
    danger: '#ef4444',
    dangerMuted: 'rgba(239, 68, 68, 0.15)',
    success: '#22c55e',
    successMuted: 'rgba(34, 197, 94, 0.15)',
    warning: '#f59e0b',
    warningMuted: 'rgba(245, 158, 11, 0.15)',
    info: '#3b82f6',
    infoMuted: 'rgba(59, 130, 246, 0.15)',

    // Tab bar
    tabBar: '#0d0d18',
    tabBarBorder: '#1a1a2e',
    tabIconDefault: '#4a4a60',
    tabIconSelected: '#c9a96e',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
    shimmer: 'rgba(201, 169, 110, 0.08)',

    // Input
    inputBg: '#12121e',
    inputBorder: '#2a2a40',
    inputFocusBorder: '#c9a96e',
    placeholder: '#4a4a60',
  },
};

export const Gradients = {
  gold: ['#c9a96e', '#e8c98a'] as const,
  goldSubtle: ['rgba(201, 169, 110, 0.2)', 'rgba(232, 201, 138, 0.05)'] as const,
  charcoal: ['#1a1a2e', '#0a0a14'] as const,
  surface: ['#161625', '#0f0f1a'] as const,
  hero: ['#12121e', '#0a0a14'] as const,
  cardGlow: ['rgba(201, 169, 110, 0.08)', 'rgba(201, 169, 110, 0.02)'] as const,

  // Feature card gradients
  tryonCard: ['#c9a96e', '#b08d4f'] as const,
  stylistCard: ['#8b6cc7', '#6e54a3'] as const,
  poseCard: ['#6b9b7a', '#537a62'] as const,
  videoCard: ['#e8618c', '#c0507a'] as const,
  shopCard: ['#3b82f6', '#2563eb'] as const,

  // Onboarding
  onboarding1: ['#1a1a2e', '#0f0f1a'] as const,
  onboarding2: ['#1a1a2e', '#12121e'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  gold: {
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const TAB_BAR_HEIGHT = 85;
export const TAB_BAR_SPACER = TAB_BAR_HEIGHT + 10;
export const HEADER_HEIGHT = 56;

// Shorthand for the active theme (dark only)
export const theme = Colors.dark;
