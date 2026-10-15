import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export function StatusBanner({
  type = 'info', // 'info' | 'success' | 'warning' | 'danger'
  title,
  message,
  actionText,
  onAction,
  style,
}) {
  const { theme } = useTheme();

  const getThemeProps = () => {
    switch (type) {
      case 'success':
        return {
          bg: theme.semantic.successBg,
          border: theme.semantic.successBorder,
          color: theme.semantic.success,
          Icon: CheckCircle2,
        };
      case 'warning':
        return {
          bg: theme.semantic.warningBg,
          border: theme.semantic.warningBorder,
          color: theme.semantic.warning,
          Icon: AlertTriangle,
        };
      case 'danger':
        return {
          bg: theme.semantic.dangerBg,
          border: theme.semantic.dangerBorder,
          color: theme.semantic.danger,
          Icon: AlertCircle,
        };
      case 'info':
      default:
        return {
          bg: theme.semantic.infoBg,
          border: 'rgba(6, 182, 212, 0.3)',
          color: theme.semantic.info,
          Icon: Info,
        };
    }
  };

  const { bg, border, color, Icon } = getThemeProps();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.md,
        },
        style,
      ]}
      accessibilityRole="alert"
    >
      <View style={styles.contentRow}>
        <View style={styles.iconWrapper}>
          <Icon size={20} color={color} />
        </View>

        <View style={styles.textColumn}>
          {title ? (
            <Text style={[styles.title, { color, fontSize: theme.typography.bodyMedium.fontSize }]}>
              {title}
            </Text>
          ) : null}
          <Text
            style={[
              styles.message,
              {
                color: theme.text.primary,
                fontSize: theme.typography.caption.fontSize + 1,
                marginTop: title ? 2 : 0,
              },
            ]}
          >
            {message}
          </Text>
        </View>

        {actionText && onAction ? (
          <Pressable
            onPress={onAction}
            style={[styles.actionBtn, { borderColor: color }]}
            accessibilityRole="button"
            accessibilityLabel={actionText}
          >
            <Text style={[styles.actionText, { color }]}>{actionText}</Text>
            <ChevronRight size={14} color={color} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    marginVertical: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  message: {
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
});
