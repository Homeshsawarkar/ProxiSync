import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';

export function CountUp({
  value = 0,
  duration = 800,
  suffix = '',
  prefix = '',
  style,
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const end = Number(value) || 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    const startTime = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);
      // easeOutQuad
      const eased = progress * (2 - progress);
      const current = Math.round(eased * end);
      setDisplayValue(current);

      if (progress >= 1) {
        clearInterval(timer);
        setDisplayValue(end);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <Text style={[styles.text, style]}>
      {prefix}{displayValue}{suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontVariant: ['tabular-nums'],
  },
});
