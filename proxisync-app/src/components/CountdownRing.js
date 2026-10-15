import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

export function CountdownRing({
  seconds = 20,
  maxSeconds = 20,
  size = 64,
  strokeWidth = 5,
  label = 'Sec',
}) {
  const { theme } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, seconds / maxSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  const isLow = seconds <= 5;
  const ringColor = isLow ? theme.semantic.warning : theme.accent.primary;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.surface.cardBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated fill */}
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

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.secondsText,
            {
              color: isLow ? theme.semantic.warning : theme.text.primary,
              fontSize: Math.max(14, Math.floor(size * 0.28)),
            },
          ]}
        >
          {seconds}s
        </Text>
        {label ? (
          <Text
            style={[
              styles.labelText,
              {
                color: theme.text.muted,
                fontSize: Math.max(9, Math.floor(size * 0.14)),
              },
            ]}
          >
            {label}
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
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondsText: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  labelText: {
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});
