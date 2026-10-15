import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, SafeAreaView, Platform } from 'react-native';
import { Home, Radio, BarChart3, Settings, Play, Users, FileSpreadsheet, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { DeviceSetupScreen } from '../screens/student/DeviceSetupScreen';
import { HomeScreen as StudentHomeScreen } from '../screens/student/HomeScreen';
import { MarkAttendanceScreen } from '../screens/student/MarkAttendanceScreen';
import { MyAttendanceScreen } from '../screens/student/MyAttendanceScreen';
import { StudentSettingsScreen } from '../screens/student/StudentSettingsScreen';

import { TeacherHomeScreen } from '../screens/teacher/TeacherHomeScreen';
import { StartSessionScreen } from '../screens/teacher/StartSessionScreen';
import { LiveSessionScreen } from '../screens/teacher/LiveSessionScreen';
import { ManualAddScreen } from '../screens/teacher/ManualAddScreen';
import { ReportsScreen } from '../screens/teacher/ReportsScreen';
import { TeacherSettingsScreen } from '../screens/teacher/TeacherSettingsScreen';

import { DemoControlModal } from '../components/DemoControlModal';

export function RootNavigator() {
  const { theme } = useTheme();
  const { user, isAuthenticated, isDeviceRegistered } = useAuth();
  const { activeSession } = useSession();

  // Navigation State
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register'
  const [studentTab, setStudentTab] = useState('home'); // 'home' | 'mark' | 'my_attendance' | 'settings'
  const [teacherTab, setTeacherTab] = useState('home'); // 'home' | 'live' | 'reports' | 'settings'
  const [teacherStack, setTeacherStack] = useState(null); // null | 'start_session' | 'manual_add'
  const [selectedCourseForSession, setSelectedCourseForSession] = useState(null);

  // 1. Not Authenticated
  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.rootContainer, { backgroundColor: theme.surface.background }]}>
        {authScreen === 'login' ? (
          <LoginScreen onNavigateRegister={() => setAuthScreen('register')} />
        ) : (
          <RegisterScreen onNavigateLogin={() => setAuthScreen('login')} />
        )}
        <DemoControlModal />
      </View>
    );
  }

  // 2. Student with NO bound device (First login forced screen)
  if (user.role === 'student' && !isDeviceRegistered) {
    return (
      <View style={[styles.rootContainer, { backgroundColor: theme.surface.background }]}>
        <DeviceSetupScreen onComplete={() => setStudentTab('home')} />
        <DemoControlModal />
      </View>
    );
  }

  // 3. Student Interface
  if (user.role === 'student') {
    return (
      <SafeAreaView style={[styles.rootContainer, { backgroundColor: theme.surface.background }]}>
        {/* Main Screen Content */}
        <View style={styles.screenWrapper}>
          {studentTab === 'home' && (
            <StudentHomeScreen
              onNavigateMark={() => setStudentTab('mark')}
              onNavigateMyAttendance={() => setStudentTab('my_attendance')}
            />
          )}
          {studentTab === 'mark' && (
            <MarkAttendanceScreen
              onDone={() => setStudentTab('home')}
              onOpenSettings={() => setStudentTab('settings')}
            />
          )}
          {studentTab === 'my_attendance' && <MyAttendanceScreen />}
          {studentTab === 'settings' && <StudentSettingsScreen />}
        </View>

        {/* Modern Glassmorphic Bottom Navigation Bar */}
        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: theme.surface.card,
              borderTopColor: theme.surface.cardBorder,
              ...Platform.select({
                web: {
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                },
              }),
            },
          ]}
        >
          <Pressable
            onPress={() => setStudentTab('home')}
            style={styles.navItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: studentTab === 'home' }}
            accessibilityLabel="Home tab"
          >
            <Home
              size={22}
              color={studentTab === 'home' ? theme.accent.primary : theme.text.muted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: studentTab === 'home' ? theme.accent.primary : theme.text.muted },
              ]}
            >
              Home
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStudentTab('mark')}
            style={styles.navItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: studentTab === 'mark' }}
            accessibilityLabel="Mark Attendance tab"
          >
            <View
              style={[
                styles.heroCenterTab,
                {
                  backgroundColor: theme.accent.primary,
                  boxShadow: theme.shadow.glow,
                },
              ]}
            >
              <Radio size={24} color="#FFFFFF" />
            </View>
            <Text
              style={[
                styles.navLabel,
                { color: studentTab === 'mark' ? theme.accent.primary : theme.text.muted, marginTop: 4 },
              ]}
            >
              Mark
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStudentTab('my_attendance')}
            style={styles.navItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: studentTab === 'my_attendance' }}
            accessibilityLabel="My Attendance tab"
          >
            <BarChart3
              size={22}
              color={studentTab === 'my_attendance' ? theme.accent.primary : theme.text.muted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: studentTab === 'my_attendance' ? theme.accent.primary : theme.text.muted },
              ]}
            >
              Records
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStudentTab('settings')}
            style={styles.navItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: studentTab === 'settings' }}
            accessibilityLabel="Settings tab"
          >
            <Settings
              size={22}
              color={studentTab === 'settings' ? theme.accent.primary : theme.text.muted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: studentTab === 'settings' ? theme.accent.primary : theme.text.muted },
              ]}
            >
              Settings
            </Text>
          </Pressable>
        </View>

        <DemoControlModal />
      </SafeAreaView>
    );
  }

  // 4. Teacher Interface
  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: theme.surface.background }]}>
      <View style={styles.screenWrapper}>
        {/* Stack Overlays */}
        {teacherStack === 'start_session' ? (
          <StartSessionScreen
            initialCourse={selectedCourseForSession}
            onSessionStarted={() => {
              setTeacherStack(null);
              setTeacherTab('live');
            }}
            onCancel={() => setTeacherStack(null)}
          />
        ) : teacherStack === 'manual_add' ? (
          <ManualAddScreen
            onDone={() => setTeacherStack(null)}
            onCancel={() => setTeacherStack(null)}
          />
        ) : (
          <>
            {teacherTab === 'home' && (
              <TeacherHomeScreen
                onNavigateStartSession={(course) => {
                  setSelectedCourseForSession(course);
                  setTeacherStack('start_session');
                }}
                onNavigateLiveSession={() => setTeacherTab('live')}
              />
            )}
            {teacherTab === 'live' && (
              <LiveSessionScreen
                onNavigateManualAdd={() => setTeacherStack('manual_add')}
                onSessionClosed={() => setTeacherTab('home')}
                onExportReports={() => setTeacherTab('reports')}
              />
            )}
            {teacherTab === 'reports' && <ReportsScreen />}
            {teacherTab === 'settings' && <TeacherSettingsScreen />}
          </>
        )}
      </View>

      {/* Teacher Bottom Nav */}
      {!teacherStack && (
        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: theme.surface.card,
              borderTopColor: theme.surface.cardBorder,
              ...Platform.select({
                web: {
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                },
              }),
            },
          ]}
        >
          <Pressable
            onPress={() => setTeacherTab('home')}
            style={styles.navItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: teacherTab === 'home' }}
          >
            <Home
              size={22}
              color={teacherTab === 'home' ? theme.accent.primary : theme.text.muted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: teacherTab === 'home' ? theme.accent.primary : theme.text.muted },
              ]}
            >
              Classes
            </Text>
          </Pressable>

          {/* Active Live Session Tab */}
          <Pressable
            onPress={() => setTeacherTab('live')}
            style={styles.navItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: teacherTab === 'live' }}
          >
            <View style={{ position: 'relative' }}>
              <Radio
                size={22}
                color={teacherTab === 'live' ? theme.semantic.success : theme.text.muted}
              />
              {activeSession && (
                <View
                  style={[
                    styles.activeTabDot,
                    { backgroundColor: theme.semantic.success },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.navLabel,
                { color: teacherTab === 'live' ? theme.semantic.success : theme.text.muted },
              ]}
            >
              Live Feed
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTeacherTab('reports')}
            style={styles.navItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: teacherTab === 'reports' }}
          >
            <FileSpreadsheet
              size={22}
              color={teacherTab === 'reports' ? theme.accent.primary : theme.text.muted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: teacherTab === 'reports' ? theme.accent.primary : theme.text.muted },
              ]}
            >
              Reports
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTeacherTab('settings')}
            style={styles.navItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: teacherTab === 'settings' }}
          >
            <Settings
              size={22}
              color={teacherTab === 'settings' ? theme.accent.primary : theme.text.muted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: teacherTab === 'settings' ? theme.accent.primary : theme.text.muted },
              ]}
            >
              Admin
            </Text>
          </Pressable>
        </View>
      )}

      <DemoControlModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  screenWrapper: {
    flex: 1,
    width: '100%',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  heroCenterTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  activeTabDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
