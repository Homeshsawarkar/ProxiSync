import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Smartphone, ShieldCheck, Key, CheckCircle, AlertTriangle, LogOut } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';

export function DeviceSetupScreen({ onComplete }) {
  const { theme } = useTheme();
  const { user, registerCurrentDevice, logout } = useAuth();

  const [step, setStep] = useState('idle'); // 'idle' | 'generating' | 'sending' | 'success' | 'conflict'
  const [errorMessage, setErrorMessage] = useState(null);

  const handleRegisterDevice = async () => {
    setErrorMessage(null);
    setStep('generating');

    // Simulate realistic hardware keystore generation
    setTimeout(async () => {
      setStep('sending');

      const res = await registerCurrentDevice();

      if (res.success) {
        setStep('success');
        setTimeout(() => {
          onComplete?.();
        }, 1200);
      } else {
        if (res.status === 409) {
          setStep('conflict');
          setErrorMessage('A device is already registered. Ask your teacher to reset it.');
        } else {
          setStep('idle');
          setErrorMessage(res.error || 'Failed to bind device key');
        }
      }
    }, 600);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        { backgroundColor: theme.surface.background },
      ]}
    >
      <View style={styles.innerContainer}>
        {/* Device Lock Visual Header */}
        <View style={styles.headerArea}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: theme.accent.glow,
                borderColor: theme.accent.primary,
              },
            ]}
          >
            <Smartphone size={40} color={theme.accent.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Device Binding Required
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Secure Hardware-Backed Anti-Proxy Verification
          </Text>
        </View>

        <GlassCard padding={theme.spacing.xl} style={styles.card}>
          <Text style={[styles.greeting, { color: theme.text.primary }]}>
            Hello, {user?.name || 'Student'} ({user?.roll_no || 'Roll No'})
          </Text>

          <Text style={[styles.explanation, { color: theme.text.secondary }]}>
            Your account will be locked to this phone so nobody else can mark attendance for you.
          </Text>

          {/* Stepper info box */}
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: theme.surface.subtle,
                borderColor: theme.surface.cardBorder,
              },
            ]}
          >
            <View style={styles.featureItem}>
              <Key size={18} color={theme.accent.primary} style={{ marginRight: 10 }} />
              <Text style={[styles.featureText, { color: theme.text.primary }]}>
                Hardware Keystore Keypair Generation (ECDSA P-256)
              </Text>
            </View>
            <View style={[styles.featureItem, { marginTop: 10 }]}>
              <ShieldCheck size={18} color={theme.semantic.success} style={{ marginRight: 10 }} />
              <Text style={[styles.featureText, { color: theme.text.primary }]}>
                Only public key is sent; private key never leaves this phone
              </Text>
            </View>
          </View>

          {/* Status Feedback */}
          {step === 'generating' && (
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, { color: theme.accent.primary }]}>
                Generating hardware keypair in secure storage...
              </Text>
            </View>
          )}

          {step === 'sending' && (
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, { color: theme.accent.primary }]}>
                Registering SPKI public key with academic server...
              </Text>
            </View>
          )}

          {step === 'success' && (
            <View
              style={[
                styles.successBox,
                {
                  backgroundColor: theme.semantic.successBg,
                  borderColor: theme.semantic.successBorder,
                },
              ]}
            >
              <CheckCircle size={20} color={theme.semantic.success} style={{ marginRight: 8 }} />
              <Text style={[styles.successText, { color: theme.semantic.success }]}>
                Device successfully bound! Continuing to Dashboard...
              </Text>
            </View>
          )}

          {step === 'conflict' && (
            <View
              style={[
                styles.conflictBox,
                {
                  backgroundColor: theme.semantic.dangerBg,
                  borderColor: theme.semantic.dangerBorder,
                },
              ]}
            >
              <AlertTriangle size={20} color={theme.semantic.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.conflictText, { color: theme.semantic.danger }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Main Action Buttons */}
          <View style={{ marginTop: 24 }}>
            {step === 'conflict' ? (
              <Button
                title="Log Out & Switch User"
                variant="outline"
                icon={LogOut}
                onPress={logout}
              />
            ) : (
              <Button
                title={step === 'idle' ? 'Register This Device' : 'Securing Account...'}
                onPress={handleRegisterDevice}
                loading={step === 'generating' || step === 'sending'}
                disabled={step === 'success'}
                size="lg"
                icon={Smartphone}
              />
            )}
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 440,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    width: '100%',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  statusRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  successText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  conflictBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  conflictText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
