import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Sliders, X, Check, AlertTriangle, UserCheck, ShieldAlert, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../mocks/mockApi';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

export function DemoControlModal() {
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();
  const { user, demoSwitchRole } = useAuth();
  const [activeFailure, setActiveFailure] = useState(mockApi.getSimulatedFailure());

  const failureOptions = [
    { code: null, label: 'Normal Flow (Success)' },
    { code: 'SESSION_INACTIVE', label: '1. SESSION_INACTIVE (Closed)' },
    { code: 'NOT_ENROLLED', label: '2. NOT_ENROLLED (Not on roster)' },
    { code: 'STALE_REQUEST', label: '3. STALE_REQUEST (Clock drift)' },
    { code: 'NO_DEVICE_BOUND', label: '4. NO_DEVICE_BOUND (Unregistered)' },
    { code: 'BAD_SIGNATURE', label: '5. BAD_SIGNATURE (Key mismatch)' },
    { code: 'TOKEN_EXPIRED_OR_INVALID', label: '6. TOKEN_EXPIRED (Auto rescan)' },
    { code: 'TOO_FAR', label: '7. TOO_FAR (Corridor student)' },
    { code: 'ALREADY_MARKED', label: '8. ALREADY_MARKED (Duplicate)' },
    { code: 'NETWORK_ERROR', label: '9. Network Error (Offline)' },
  ];

  const handleSelectFailure = (code) => {
    setActiveFailure(code);
    mockApi.setSimulatedFailure(code);
  };

  return (
    <>
      {/* Floating Demo Trigger Badge */}
      <Pressable
        onPress={() => setVisible(true)}
        style={[
          styles.floatingBadge,
          {
            backgroundColor: theme.accent.primary,
            borderColor: 'rgba(255, 255, 255, 0.25)',
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open Demo Testing Lab"
      >
        <Sliders size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.floatingText}>Demo Lab</Text>
      </Pressable>

      {/* Modal Dialog */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalCard} padding={20}>
            <View style={styles.headerRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sliders size={20} color={theme.accent.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                  Demo & Testing Lab
                </Text>
              </View>
              <Pressable
                onPress={() => setVisible(false)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={20} color={theme.text.muted} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Section 1: User / Role Switcher */}
              <Text style={[styles.sectionHeading, { color: theme.text.secondary }]}>
                Switch Active Persona
              </Text>
              <View style={styles.buttonRow}>
                <Button
                  title="Student (Aarav)"
                  size="sm"
                  variant={user?.role === 'student' && user?.id === 2 ? 'primary' : 'outline'}
                  onPress={() => {
                    demoSwitchRole('student', false);
                    setVisible(false);
                  }}
                  style={{ flex: 1, marginRight: 6 }}
                />
                <Button
                  title="New Student (Neha)"
                  size="sm"
                  variant={user?.role === 'student' && user?.id === 3 ? 'primary' : 'outline'}
                  onPress={() => {
                    demoSwitchRole('student', true);
                    setVisible(false);
                  }}
                  style={{ flex: 1, marginRight: 6 }}
                />
                <Button
                  title="Teacher (Sharma)"
                  size="sm"
                  variant={user?.role === 'teacher' ? 'primary' : 'outline'}
                  onPress={() => {
                    demoSwitchRole('teacher');
                    setVisible(false);
                  }}
                  style={{ flex: 1 }}
                />
              </View>

              <Text style={[styles.personaDesc, { color: theme.text.muted }]}>
                • Aarav: Registered student with bound device.{'\n'}
                • Neha: First-time student (triggers forced Device Setup).{'\n'}
                • Sharma: Teacher (creates/manages live sessions).
              </Text>

              {/* Section 2: Verification Shield Rejection Test */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.sectionHeading, { color: theme.text.secondary }]}>
                  Simulate Verification Code
                </Text>
                <Text style={[styles.subHint, { color: theme.text.muted }]}>
                  Force the backend shield to test any rejection reason:
                </Text>

                {failureOptions.map(opt => {
                  const isSelected = activeFailure === opt.code;
                  return (
                    <Pressable
                      key={String(opt.code)}
                      onPress={() => handleSelectFailure(opt.code)}
                      style={[
                        styles.failureRow,
                        {
                          backgroundColor: isSelected ? theme.surface.subtle : 'transparent',
                          borderColor: isSelected ? theme.accent.primary : theme.surface.cardBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.failureLabel,
                          {
                            color: isSelected ? theme.accent.primary : theme.text.primary,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {isSelected ? (
                        <Check size={16} color={theme.accent.primary} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={{ marginTop: 16 }}>
              <Button
                title="Done"
                size="md"
                variant="primary"
                onPress={() => setVisible(false)}
              />
            </View>
          </GlassCard>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingBadge: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subHint: {
    fontSize: 12,
    marginBottom: 8,
  },
  personaDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  failureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 6,
  },
  failureLabel: {
    fontSize: 13,
  },
});
