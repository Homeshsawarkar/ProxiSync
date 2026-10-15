import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { DARK_TOKENS, LIGHT_TOKENS, SPACING, RADII, TYPOGRAPHY, MOTION } from './tokens';

const ACCENT_PRESETS = {
  blueViolet: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    gradient: ['#2563EB', '#7C3AED'],
    glow: 'rgba(59, 130, 246, 0.35)',
  },
  emeraldCyan: {
    primary: '#10B981',
    secondary: '#06B6D4',
    gradient: ['#059669', '#0891B2'],
    glow: 'rgba(16, 185, 129, 0.35)',
  },
  sunsetAmber: {
    primary: '#F59E0B',
    secondary: '#EC4899',
    gradient: ['#D97706', '#DB2777'],
    glow: 'rgba(245, 158, 11, 0.35)',
  },
  neonViolet: {
    primary: '#A855F7',
    secondary: '#6366F1',
    gradient: ['#9333EA', '#4F46E5'],
    glow: 'rgba(168, 85, 247, 0.35)',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState('dark'); // 'dark' | 'light' | 'system'
  const [accentKey, setAccentKey] = useState('blueViolet');
  const [density, setDensity] = useState('comfortable'); // 'comfortable' | 'compact'
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  const activeMode = themePreference === 'system' 
    ? (systemColorScheme === 'light' ? 'light' : 'dark') 
    : themePreference;

  const currentTheme = useMemo(() => {
    const baseTokens = activeMode === 'dark' ? { ...DARK_TOKENS } : { ...LIGHT_TOKENS };
    const selectedAccent = ACCENT_PRESETS[accentKey] || ACCENT_PRESETS.blueViolet;

    return {
      ...baseTokens,
      accent: {
        ...baseTokens.accent,
        ...selectedAccent,
      },
      spacing: density === 'compact' ? {
        xs: 2,
        sm: 6,
        md: 12,
        lg: 18,
        xl: 24,
        xxl: 32,
        xxxl: 38,
      } : SPACING,
      radii: RADII,
      typography: TYPOGRAPHY,
      motion: MOTION,
      density,
      hapticsEnabled,
      soundEnabled,
      reduceMotion,
      themePreference,
    };
  }, [activeMode, accentKey, density, hapticsEnabled, soundEnabled, reduceMotion, themePreference]);

  const value = {
    theme: currentTheme,
    themePreference,
    setThemePreference,
    accentKey,
    setAccentKey,
    density,
    setDensity,
    hapticsEnabled,
    setHapticsEnabled,
    soundEnabled,
    setSoundEnabled,
    reduceMotion,
    setReduceMotion,
    accentPresets: ACCENT_PRESETS,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
