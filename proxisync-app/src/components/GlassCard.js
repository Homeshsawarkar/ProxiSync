import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function GlassCard({
  children,
  style,
  variant = 'default', // 'default' | 'elevated' | 'glow' | 'accent'
  borderRadius,
  padding,
  ...props
}) {
  const { theme } = useTheme();

  const getBorderColor = () => {
    if (variant === 'accent') return theme.accent.primary;
    if (variant === 'glow') return theme.accent.glow;
    return theme.surface.cardBorder;
  };

  const getBackgroundColor = () => {
    if (variant === 'elevated') return theme.surface.elevated;
    return theme.surface.card;
  };

  return (
    <View
      style={[
        styles.cardBase,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderRadius: borderRadius !== undefined ? borderRadius : theme.radii.xl,
          padding: padding !== undefined ? padding : theme.spacing.md,
          ...Platform.select({
            web: {
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: variant === 'glow' ? theme.shadow.glow : theme.shadow.card,
            },
            default: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme.mode === 'dark' ? 0.35 : 0.08,
              shadowRadius: 12,
              elevation: 4,
            },
          }),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cardBase: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
