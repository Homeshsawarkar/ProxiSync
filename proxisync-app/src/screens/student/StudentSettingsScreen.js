import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { Bell, Palette, Smartphone, Vibrate, Volume2, Shield, LogOut, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

export function StudentSettingsScreen() {
  const {
    theme,
    accentKey,
    setAccentKey,
    accentPresets,
    density,
    setDensity,
    hapticsEnabled,
    setHapticsEnabled,
    soundEnabled,
    setSoundEnabled,
  } = useTheme();
  const { user, isDeviceRegistered, logout } = useAuth();

  // Smart notification preferences
  const [notifyOpen, setNotifyOpen] = useState(true);
  const [notifyLow, setNotifyLow] = useState(true);
  const [notifySummary, setNotifySummary] = useState(true);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.surface.background }]}
      contentContainerStyle={[styles.content, { padding: theme.spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: theme.text.primary }]}>
        Settings & Preferences
      </Text>

      {/* 1. Theme & Appearance */}
      <GlassCard padding={18} style={styles.card}>
        <Text style={[styles.cardHeader, { color: theme.text.primary }]}>
          Appearance
        </Text>

        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: theme.text.secondary }]}>
            Interface Theme
          </Text>
          <View style={{ marginTop: 8 }}>
            <ThemeToggle />
          </View>
        </View>

        {/* Accent Color Presets */}
        <View style={[styles.settingItem, { marginTop: 16 }]}>
          <Text style={[styles.settingLabel, { color: theme.text.secondary }]}>
            Accent Hue
          </Text>
          <View style={styles.paletteRow}>
            {Object.keys(accentPresets).map(key => {
              const preset = accentPresets[key];
              const isSelected = accentKey === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setAccentKey(key)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: preset.primary },
                    isSelected && { borderColor: '#FFFFFF', borderWidth: 3 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select accent preset ${key}`}
                >
                  {isSelected && <Check size={14} color="#FFFFFF" />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Density Toggle */}
        <View style={[styles.settingItemRow, { marginTop: 16 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
              Compact Density
            </Text>
            <Text style={[styles.settingSub, { color: theme.text.muted }]}>
              Smaller margins and tighter list rows
            </Text>
          </View>
          <Switch
            value={density === 'compact'}
            onValueChange={v => setDensity(v ? 'compact' : 'comfortable')}
            trackColor={{ false: theme.surface.cardBorder, true: theme.accent.primary }}
          />
        </View>
      </GlassCard>

      {/* 2. Smart Notifications */}
      <GlassCard padding={18} style={[styles.card, { marginTop: theme.spacing.md }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Bell size={18} color={theme.accent.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.cardHeader, { color: theme.text.primary, marginBottom: 0 }]}>
            Smart Notifications
          </Text>
        </View>

        <View style={styles.settingItemRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
              Class Attendance Opened
            </Text>
            <Text style={[styles.settingSub, { color: theme.text.muted }]}>
              Immediate push when teacher broadcasts BLE beacon in your room
            </Text>
          </View>
          <Switch
            value={notifyOpen}
            onValueChange={setNotifyOpen}
            trackColor={{ false: theme.surface.cardBorder, true: theme.accent.primary }}
          />
        </View>

        <View style={[styles.settingItemRow, { marginTop: 14 }]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
              Attendance Drop Warning
            </Text>
            <Text style={[styles.settingSub, { color: theme.text.muted }]}>
              Gentle heads-up if any subject falls below 75%
            </Text>
          </View>
          <Switch
            value={notifyLow}
            onValueChange={setNotifyLow}
            trackColor={{ false: theme.surface.cardBorder, true: theme.accent.primary }}
          />
        </View>

        <View style={[styles.settingItemRow, { marginTop: 14 }]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
              Weekly Attendance Health Report
            </Text>
            <Text style={[styles.settingSub, { color: theme.text.muted }]}>
              Friday evening summary of weekly presence
            </Text>
          </View>
          <Switch
            value={notifySummary}
            onValueChange={setNotifySummary}
            trackColor={{ false: theme.surface.cardBorder, true: theme.accent.primary }}
          />
        </View>
      </GlassCard>

      {/* 3. Feedback & Haptics */}
      <GlassCard padding={18} style={[styles.card, { marginTop: theme.spacing.md }]}>
        <View style={styles.settingItemRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
              Haptic Feedback
            </Text>
            <Text style={[styles.settingSub, { color: theme.text.muted }]}>
              Vibrations on scan lock and attendance success
            </Text>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: theme.surface.cardBorder, true: theme.accent.primary }}
          />
        </View>

        <View style={[styles.settingItemRow, { marginTop: 14 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
              Audio Feedback
            </Text>
            <Text style={[styles.settingSub, { color: theme.text.muted }]}>
              Soft confirmation chime on verify
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: theme.surface.cardBorder, true: theme.accent.primary }}
          />
        </View>
      </GlassCard>

      {/* 4. Security & Device Binding */}
      <GlassCard padding={18} style={[styles.card, { marginTop: theme.spacing.md }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Shield size={18} color={theme.semantic.success} style={{ marginRight: 8 }} />
          <Text style={[styles.cardHeader, { color: theme.text.primary, marginBottom: 0 }]}>
            Device Security
          </Text>
        </View>

        <Text style={[styles.settingSub, { color: theme.text.secondary }]}>
          Hardware Key Pair: ECDSA P-256 (SHA-256)
        </Text>
        <Text style={[styles.settingSub, { color: theme.text.secondary, marginTop: 2 }]}>
          Binding Status: {isDeviceRegistered ? 'Active & Bound' : 'Unregistered'}
        </Text>

        <View style={{ marginTop: 16 }}>
          <Button
            title="Log Out"
            variant="danger"
            icon={LogOut}
            onPress={logout}
          />
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    width: '100%',
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingItem: {
    width: '100%',
  },
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  paletteRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
