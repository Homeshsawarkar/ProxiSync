import React, { useState } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

export function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: IconComponent,
  iconRight: IconRightComponent,
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}) {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const getMinHeight = () => {
    switch (size) {
      case 'sm': return 40;
      case 'lg': return 56;
      case 'md':
      default: return 48; // Accessible min 48dp
    }
  };

  const getPaddingHorizontal = () => {
    switch (size) {
      case 'sm': return theme.spacing.md;
      case 'lg': return theme.spacing.xl;
      case 'md':
      default: return theme.spacing.lg;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return theme.typography.caption.fontSize + 1;
      case 'lg': return theme.typography.headline.fontSize;
      case 'md':
      default: return theme.typography.bodyMedium.fontSize;
    }
  };

  const isGradient = variant === 'primary';

  const getContent = () => (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : theme.accent.primary}
          style={{ marginRight: title ? theme.spacing.sm : 0 }}
        />
      ) : IconComponent ? (
        <View style={{ marginRight: title ? theme.spacing.sm : 0 }}>
          <IconComponent
            size={size === 'sm' ? 16 : 20}
            color={
              variant === 'primary'
                ? '#FFFFFF'
                : variant === 'danger'
                ? theme.semantic.danger
                : variant === 'success'
                ? theme.semantic.success
                : theme.text.primary
            }
          />
        </View>
      ) : null}

      {title ? (
        <Text
          style={[
            styles.baseText,
            {
              fontSize: getFontSize(),
              color:
                variant === 'primary'
                  ? '#FFFFFF'
                  : variant === 'danger'
                  ? theme.semantic.danger
                  : variant === 'success'
                  ? theme.semantic.success
                  : variant === 'secondary'
                  ? theme.text.primary
                  : variant === 'outline'
                  ? theme.text.primary
                  : theme.text.secondary,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      ) : null}

      {IconRightComponent && !loading ? (
        <View style={{ marginLeft: theme.spacing.sm }}>
          <IconRightComponent
            size={size === 'sm' ? 16 : 20}
            color={variant === 'primary' ? '#FFFFFF' : theme.text.primary}
          />
        </View>
      ) : null}
    </View>
  );

  const containerStyle = [
    styles.buttonBase,
    {
      minHeight: getMinHeight(),
      paddingHorizontal: getPaddingHorizontal(),
      borderRadius: theme.radii.lg,
      opacity: disabled ? 0.45 : isPressed ? 0.88 : 1,
      transform: [{ scale: isPressed && !disabled ? 0.98 : 1 }],
    },
    variant === 'outline' && {
      borderWidth: 1,
      borderColor: theme.surface.cardBorder,
      backgroundColor: 'transparent',
    },
    variant === 'secondary' && {
      backgroundColor: theme.surface.subtle,
      borderWidth: 1,
      borderColor: theme.surface.cardBorder,
    },
    variant === 'danger' && {
      backgroundColor: theme.semantic.dangerBg,
      borderWidth: 1,
      borderColor: theme.semantic.dangerBorder,
    },
    variant === 'success' && {
      backgroundColor: theme.semantic.successBg,
      borderWidth: 1,
      borderColor: theme.semantic.successBorder,
    },
    variant === 'ghost' && {
      backgroundColor: 'transparent',
    },
    style,
  ];

  if (isGradient && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        style={[containerStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}
        {...props}
      >
        <LinearGradient
          colors={theme.accent.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientFill,
            {
              minHeight: getMinHeight(),
              paddingHorizontal: getPaddingHorizontal(),
              borderRadius: theme.radii.lg,
            },
          ]}
        >
          {getContent()}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={containerStyle}
      {...props}
    >
      {getContent()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientFill: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
