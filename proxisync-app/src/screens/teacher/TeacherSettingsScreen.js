import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Shield, Smartphone, RefreshCw, CheckCircle2, LogOut, Check, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { resetStudentDevice } from '../../api/auth';
import { ThemeToggle } from '../../components/ThemeToggle';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

export function TeacherSettingsScreen() {
  const { theme, accentKey, setAccentKey, accentPresets } = useTheme();
  const { user, logout } = useAuth();

  const [studentIdInput, setStudentIdInput] = useState('3'); // Default student Neha Rao id
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(null);

  const handleResetDevice = async () => {
    if (!studentIdInput) return;
    setResetting(true);
    setResetSuccess(null);
    try {
      await resetStudentDevice(parseInt(studentIdInput, 10));
      setResetSuccess(`Device binding revoked for Student #${studentIdInput}. Student can now re-register.`);
    } catch (e) {
      setResetSuccess(`Error: ${e.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.surface.background }]}
      contentContainerStyle={[styles.content, { padding: theme.spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: theme.text.primary }]}>
        Faculty Administration
      </Text>

      {/* 1. Device Reset Management (Section 5.3 & 8.4) */}
      <GlassCard padding={18} style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Smartphone size={18} color={theme.accent.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.cardHeader, { color: theme.text.primary, marginBottom: 0 }]}>
            Student Device Re-registration
          </Text>
        </View>
        <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>
          Revoke a lost or upgraded phone's bound public key so the student can complete Device Setup again.
        </Text>

        <View style={{ marginTop: 12 }}>
          <Text style={[styles.inputLabel, { color: theme.text.muted }]}>
            Student Database ID
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.surface.input,
                borderColor: theme.surface.inputBorder,
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            <TextInput
              value={studentIdInput}
              onChangeText={setStudentIdInput}
              placeholder="e.g. 2 or 3"
              placeholderTextColor={theme.text.muted}
              keyboardType="number-pad"
              style={[styles.input, { color: theme.text.primary }]}
            />
          </View>
        </View>

        {resetSuccess && (
          <View
            style={[
              styles.statusBox,
              { backgroundColor: theme.semantic.successBg, borderColor: theme.semantic.successBorder },
            ]}
          >
            <CheckCircle2 size={16} color={theme.semantic.success} style={{ marginRight: 8 }} />
            <Text style={[styles.statusText, { color: theme.semantic.success }]}>
              {resetSuccess}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 16 }}>
          <Button
            title="Revoke & Reset Device"
            icon={RefreshCw}
            variant="secondary"
            loading={resetting}
            onPress={handleResetDevice}
          />
        </View>
      </GlassCard>

      {/* 2. Theme & Styling */}
      <GlassCard padding={18} style={[styles.card, { marginTop: theme.spacing.md }]}>
        <Text style={[styles.cardHeader, { color: theme.text.primary }]}>
          Theme & Display
        </Text>
        <View style={{ marginTop: 8 }}>
          <ThemeToggle />
        </View>
      </GlassCard>

      {/* 3. Account & Sign Out */}
      <GlassCard padding={18} style={[styles.card, { marginTop: theme.spacing.md }]}>
        <Text style={[styles.cardHeader, { color: theme.text.primary }]}>
          Faculty Account
        </Text>
        <Text style={{ color: theme.text.secondary, fontSize: 13 }}>
          Signed in as: {user?.name || 'Dr. Arvind Sharma'} ({user?.email || 'sharma@college.edu'})
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
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputWrapper: {
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 14,
    outlineStyle: 'none',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});
