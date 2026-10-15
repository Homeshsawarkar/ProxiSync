import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Shield, User, Mail, Lock, Hash, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';

export function RegisterScreen({ onNavigateLogin }) {
  const { theme } = useTheme();
  const { register, isLoading } = useAuth();

  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const handleRegister = async () => {
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Full name is required');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('A valid college email address is required');
      return;
    }
    if (role === 'student' && !rollNo.trim()) {
      setErrorMsg('Roll number is mandatory for students');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    const res = await register({
      role,
      name,
      roll_no: role === 'student' ? rollNo.trim().toUpperCase() : null,
      email: email.trim().toLowerCase(),
      password,
    });

    if (res.success) {
      setSuccessBanner(true);
      setTimeout(() => {
        onNavigateLogin();
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Registration failed');
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
        {/* Back Link */}
        <Pressable
          onPress={onNavigateLogin}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
        >
          <ArrowLeft size={18} color={theme.text.secondary} style={{ marginRight: 6 }} />
          <Text style={[styles.backText, { color: theme.text.secondary }]}>Back to Sign In</Text>
        </Pressable>

        <GlassCard style={styles.card} padding={theme.spacing.xl}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Create Account
          </Text>
          <Text style={[styles.sub, { color: theme.text.muted }]}>
            Join ProxiSync for secure, instantaneous attendance
          </Text>

          {/* Success Banner */}
          {successBanner && (
            <View
              style={[
                styles.alertBox,
                {
                  backgroundColor: theme.semantic.successBg,
                  borderColor: theme.semantic.successBorder,
                },
              ]}
            >
              <CheckCircle2 size={18} color={theme.semantic.success} style={{ marginRight: 8 }} />
              <Text style={[styles.alertText, { color: theme.semantic.success }]}>
                Account created successfully! Redirecting to sign in...
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <View
              style={[
                styles.alertBox,
                {
                  backgroundColor: theme.semantic.dangerBg,
                  borderColor: theme.semantic.dangerBorder,
                },
              ]}
            >
              <AlertCircle size={18} color={theme.semantic.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.alertText, { color: theme.semantic.danger }]}>{errorMsg}</Text>
            </View>
          )}

          {/* Role Selector Tabs */}
          <View
            style={[
              styles.roleContainer,
              {
                backgroundColor: theme.surface.subtle,
                borderColor: theme.surface.cardBorder,
              },
            ]}
          >
            <Pressable
              onPress={() => setRole('student')}
              style={[
                styles.roleBtn,
                role === 'student' && { backgroundColor: theme.accent.primary },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: role === 'student' ? '#FFFFFF' : theme.text.secondary },
                ]}
              >
                Student
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setRole('teacher')}
              style={[
                styles.roleBtn,
                role === 'teacher' && { backgroundColor: theme.accent.primary },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: role === 'teacher' ? '#FFFFFF' : theme.text.secondary },
                ]}
              >
                Teacher / Faculty
              </Text>
            </Pressable>
          </View>

          {/* Name Field */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Full Name</Text>
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
              <User size={18} color={theme.text.muted} style={{ marginLeft: 12, marginRight: 8 }} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Aarav Patel"
                placeholderTextColor={theme.text.muted}
                style={[styles.input, { color: theme.text.primary }]}
              />
            </View>
          </View>

          {/* Email Field */}
          <View style={[styles.fieldWrapper, { marginTop: 12 }]}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>College Email</Text>
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

          {/* Roll Number (Conditional for Student) */}
          {role === 'student' && (
            <View style={[styles.fieldWrapper, { marginTop: 12 }]}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>
                Roll Number / Student ID
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
                <Hash size={18} color={theme.text.muted} style={{ marginLeft: 12, marginRight: 8 }} />
                <TextInput
                  value={rollNo}
                  onChangeText={setRollNo}
                  placeholder="e.g. 22AIML042"
                  placeholderTextColor={theme.text.muted}
                  autoCapitalize="characters"
                  style={[styles.input, { color: theme.text.primary }]}
                />
              </View>
            </View>
          )}

          {/* Password */}
          <View style={[styles.fieldWrapper, { marginTop: 12 }]}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>
              Password (min. 8 characters)
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
              <Lock size={18} color={theme.text.muted} style={{ marginLeft: 12, marginRight: 8 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.text.muted}
                secureTextEntry
                style={[styles.input, { color: theme.text.primary }]}
              />
            </View>
          </View>

          {/* Confirm Password */}
          <View style={[styles.fieldWrapper, { marginTop: 12 }]}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Confirm Password</Text>
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
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.text.muted}
                secureTextEntry
                style={[styles.input, { color: theme.text.primary }]}
              />
            </View>
          </View>

          {/* Submit */}
          <View style={{ marginTop: 24 }}>
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              size="lg"
            />
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
    maxWidth: 420,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  sub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  roleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldWrapper: {
    width: '100%',
  },
  label: {
    fontSize: 11,
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
});
