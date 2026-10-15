// ProxiSync Design Tokens
// System-wide tokens for Dark (hero) and Light themes, typography, spacing, radii, motion and gradients.

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const MOTION = {
  durations: {
    fast: 150,
    base: 250,
    slow: 450,
  },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  easing: {
    easeOut: [0.16, 1, 0.3, 1],
    easeInOut: [0.4, 0, 0.2, 1],
  },
};

export const TYPOGRAPHY = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
};

export const DARK_TOKENS = {
  mode: 'dark',
  surface: {
    background: '#07090E',        // Deepest obsidian near-black
    base: '#0D111C',              // Deep navy surface
    card: 'rgba(21, 28, 46, 0.72)', // Glassmorphic card surface
    cardBorder: 'rgba(255, 255, 255, 0.09)',
    cardHover: 'rgba(29, 39, 64, 0.85)',
    input: 'rgba(21, 28, 46, 0.85)',
    inputBorder: 'rgba(255, 255, 255, 0.12)',
    subtle: 'rgba(255, 255, 255, 0.04)',
    elevated: '#171F33',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#07090E',
  },
  accent: {
    primary: '#3B82F6',          // Vivid electric blue
    secondary: '#8B5CF6',        // Violet
    gradient: ['#2563EB', '#7C3AED'], // Electric blue to violet gradient
    gradientSoft: ['rgba(37, 99, 235, 0.25)', 'rgba(124, 58, 237, 0.25)'],
    glow: 'rgba(59, 130, 246, 0.35)',
  },
  semantic: {
    success: '#10B981',          // Emerald
    successBg: 'rgba(16, 185, 129, 0.12)',
    successBorder: 'rgba(16, 185, 129, 0.3)',
    warning: '#F59E0B',          // Amber
    warningBg: 'rgba(245, 158, 11, 0.12)',
    warningBorder: 'rgba(245, 158, 11, 0.3)',
    danger: '#EF4444',           // Red
    dangerBg: 'rgba(239, 68, 68, 0.12)',
    dangerBorder: 'rgba(239, 68, 68, 0.3)',
    info: '#06B6D4',             // Cyan
    infoBg: 'rgba(6, 182, 212, 0.12)',
  },
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.4)',
    card: '0 8px 30px rgba(0, 0, 0, 0.45)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
  },
};

export const LIGHT_TOKENS = {
  mode: 'light',
  surface: {
    background: '#F8FAFC',        // Slate 50
    base: '#FFFFFF',
    card: 'rgba(255, 255, 255, 0.88)',
    cardBorder: 'rgba(203, 213, 225, 0.6)',
    cardHover: 'rgba(241, 245, 249, 0.95)',
    input: '#FFFFFF',
    inputBorder: 'rgba(203, 213, 225, 0.9)',
    subtle: 'rgba(241, 245, 249, 0.8)',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',          // Slate 900
    secondary: '#475569',        // Slate 600
    muted: '#94A3B8',            // Slate 400
    inverse: '#FFFFFF',
  },
  accent: {
    primary: '#2563EB',          // Electric blue
    secondary: '#7C3AED',        // Violet
    gradient: ['#2563EB', '#7C3AED'],
    gradientSoft: ['rgba(37, 99, 235, 0.12)', 'rgba(124, 58, 237, 0.12)'],
    glow: 'rgba(37, 99, 235, 0.2)',
  },
  semantic: {
    success: '#059669',
    successBg: 'rgba(5, 150, 105, 0.1)',
    successBorder: 'rgba(5, 150, 105, 0.3)',
    warning: '#D97706',
    warningBg: 'rgba(217, 119, 6, 0.1)',
    warningBorder: 'rgba(217, 119, 6, 0.3)',
    danger: '#DC2626',
    dangerBg: 'rgba(220, 38, 38, 0.1)',
    dangerBorder: 'rgba(220, 38, 38, 0.3)',
    info: '#0284C7',
    infoBg: 'rgba(2, 132, 199, 0.1)',
  },
  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    card: '0 8px 24px rgba(148, 163, 184, 0.16)',
    glow: '0 0 16px rgba(37, 99, 235, 0.15)',
  },
};
