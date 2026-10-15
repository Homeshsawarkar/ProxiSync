import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Moon, Sun, Smartphone } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export function ThemeToggle({ style }) {
  const { theme, themePreference, setThemePreference } = useTheme();

  const options = [
    { key: 'dark', label: 'Dark', Icon: Moon },
    { key: 'light', label: 'Light', Icon: Sun },
    { key: 'system', label: 'Auto', Icon: Smartphone },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface.card,
          borderColor: theme.surface.cardBorder,
          borderRadius: theme.radii.lg,
          padding: 4,
        },
        style,
      ]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Color theme selector"
    >
      {options.map(({ key, label, Icon }) => {
        const isSelected = themePreference === key;
        return (
          <Pressable
            key={key}
            onPress={() => setThemePreference(key)}
            style={[
              styles.optionBtn,
              {
                borderRadius: theme.radii.md,
                backgroundColor: isSelected ? theme.accent.primary : 'transparent',
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${label} theme`}
          >
            <Icon
              size={15}
              color={isSelected ? '#FFFFFF' : theme.text.secondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.optionLabel,
                {
                  color: isSelected ? '#FFFFFF' : theme.text.secondary,
                  fontWeight: isSelected ? '600' : '400',
                },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  optionLabel: {
    fontSize: 12,
  },
});
