import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';

export function LoginScreen({ onNavigateRegister }) {
  const { theme } = useTheme();
  const { login, isLoading, authError } = useAuth();

  const [email, setEmail] = useState('aarav@college.edu'); // Preloaded for quick review
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState(null);

  const handleLogin = async () => {
    setClientError(null);
    if (!email || !email.includes('@')) {
      setClientError('Please enter a valid college email');
      return;
    }
    if (!password) {
      setClientError('Password cannot be empty');
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setClientError(res.error || 'Wrong email or password');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        { backgroundColor: theme.surface.background },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.innerContainer}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: theme.accent.glow,
                borderColor: theme.accent.primary,
              },
            ]}
          >
            <Shield size={36} color={theme.accent.primary} />
          </View>
          <Text style={[styles.brandTitle, { color: theme.text.primary }]}>
            Proxi<Text style={{ color: theme.accent.primary }}>Sync</Text>
          </Text>
          <Text style={[styles.brandSubtitle, { color: theme.text.secondary }]}>
            Next-Gen Anti-Proxy BLE Attendance
          </Text>
        </View>

        {/* Login Card */}
        <GlassCard style={styles.card} padding={theme.spacing.xl}>
          <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
            Welcome Back
          </Text>
          <Text style={[styles.cardSub, { color: theme.text.muted }]}>
            Sign in with your academic credentials
          </Text>

          {/* Error Message */}
          {(clientError || authError) && (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: theme.semantic.dangerBg,
                  borderColor: theme.semantic.dangerBorder,
                },
              ]}
            >
              <AlertCircle size={16} color={theme.semantic.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.errorText, { color: theme.semantic.danger }]}>
                {clientError || authError}
              </Text>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Email Address</Text>
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
              <Mail size={18} color={theme.text.muted} style={{ marginLeft: 12, marginRight: 8 }} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="student@college.edu"
                placeholderTextColor={theme.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: theme.text.primary }]}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={[styles.fieldWrapper, { marginTop: theme.spacing.md }]}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Password</Text>
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
              <Lock size={18} color={theme.text.muted} style={{ marginLeft: 12, marginRight: 8 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.text.muted}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.text.primary }]}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 12 }}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} color={theme.text.muted} />
                ) : (
                  <Eye size={18} color={theme.text.muted} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Login Button */}
          <View style={{ marginTop: theme.spacing.xl }}>
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              iconRight={ArrowRight}
            />
          </View>

          {/* Register Link */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.text.secondary }]}>
              New to ProxiSync?{' '}
            </Text>
            <Pressable
              onPress={onNavigateRegister}
              accessibilityRole="link"
              accessibilityLabel="Register a new account"
            >
              <Text style={[styles.linkText, { color: theme.accent.primary }]}>
                Create an Account
              </Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Demo Fast Login Pills */}
        <View style={styles.demoLoginBox}>
          <Text style={[styles.demoLoginLabel, { color: theme.text.muted }]}>
            Fast Demo Profiles:
          </Text>
          <View style={styles.pillsRow}>
            <Pressable
              onPress={() => {
                setEmail('aarav@college.edu');
                setPassword('password123');
              }}
              style={[styles.pill, { borderColor: theme.surface.cardBorder }]}
            >
              <Text style={[styles.pillText, { color: theme.text.secondary }]}>Student (Aarav)</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setEmail('neha@college.edu');
                setPassword('password123');
              }}
              style={[styles.pill, { borderColor: theme.surface.cardBorder }]}
            >
              <Text style={[styles.pillText, { color: theme.text.secondary }]}>New Student (Neha)</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setEmail('sharma@college.edu');
                setPassword('password123');
              }}
              style={[styles.pill, { borderColor: theme.surface.cardBorder }]}
            >
              <Text style={[styles.pillText, { color: theme.text.secondary }]}>Teacher (Sharma)</Text>
            </Pressable>
          </View>
        </View>
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
    maxWidth: 420,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  card: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  fieldWrapper: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 48,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    paddingRight: 12,
    outlineStyle: 'none',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoLoginBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  demoLoginLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
