import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

export function AnimatedRing({
  percentage = 0,
  size = 80,
  strokeWidth = 7,
  showLabel = true,
  subtitle,
}) {
  const { theme } = useTheme();

  const pct = Math.max(0, Math.min(100, Math.round(Number(percentage) || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const getColor = () => {
    if (pct >= 75) return theme.semantic.success;
    if (pct >= 68) return theme.semantic.warning;
    return theme.semantic.danger;
  };

  const ringColor = getColor();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.surface.cardBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.contentOverlay}>
        <Text
          style={[
            styles.pctText,
            {
              color: ringColor,
              fontSize: Math.max(13, Math.floor(size * 0.26)),
            },
          ]}
        >
          {pct}%
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitleText,
              {
                color: theme.text.muted,
                fontSize: Math.max(8, Math.floor(size * 0.12)),
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  subtitleText: {
    fontWeight: '500',
  },
});
