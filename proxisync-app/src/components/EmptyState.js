import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';

export function EmptyState({
  icon: IconComponent = BookOpen,
  title = 'No Data Yet',
  message = 'Everything is clear and up to date.',
  actionTitle,
  onAction,
  style,
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { padding: theme.spacing.xl }, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.surface.subtle,
            borderColor: theme.surface.cardBorder,
            width: 72,
            height: 72,
            borderRadius: 36,
          },
        ]}
      >
        <IconComponent size={32} color={theme.accent.primary} />
      </View>

      <Text
        style={[
          styles.titleText,
          {
            color: theme.text.primary,
            fontSize: theme.typography.headline.fontSize,
            marginTop: theme.spacing.md,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.messageText,
          {
            color: theme.text.secondary,
            fontSize: theme.typography.body.fontSize,
            marginTop: theme.spacing.xs,
          },
        ]}
      >
        {message}
      </Text>

      {actionTitle && onAction ? (
        <View style={{ marginTop: theme.spacing.lg }}>
          <Button title={actionTitle} onPress={onAction} size="sm" variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  iconCircle: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  messageText: {
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
