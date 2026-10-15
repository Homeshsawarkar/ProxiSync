import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Play, Users, BookOpen, Clock, Radio, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { getCourses } from '../../api/sessions';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { StatusBanner } from '../../components/StatusBanner';
import { EmptyState } from '../../components/EmptyState';

export function TeacherHomeScreen({ onNavigateStartSession, onNavigateLiveSession }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { activeSession, refreshActiveSessions } = useSession();

  const [courses, setCourses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const list = await getCourses();
      setCourses(list || []);
      await refreshActiveSessions();
    } catch (e) {
      console.warn('Failed to load teacher courses:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.surface.background }]}
      contentContainerStyle={[styles.content, { padding: theme.spacing.md }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.welcomeLabel, { color: theme.text.muted }]}>
            Faculty Portal 🎓
          </Text>
          <Text style={[styles.nameText, { color: theme.text.primary }]}>
            {user?.name || 'Dr. Arvind Sharma'}
          </Text>
          <Text style={[styles.deptText, { color: theme.text.secondary }]}>
            Department of CSE (AIML)
          </Text>
        </View>

        <View
          style={[
            styles.rolePill,
            { backgroundColor: theme.accent.glow, borderColor: theme.accent.primary },
          ]}
        >
          <ShieldCheck size={14} color={theme.accent.primary} style={{ marginRight: 4 }} />
          <Text style={[styles.roleText, { color: theme.accent.primary }]}>Instructor</Text>
        </View>
      </View>

      {/* ACTIVE SESSION IN PROGRESS BANNER (Section 8.3) */}
      {activeSession && (
        <StatusBanner
          type="success"
          title="Session In Progress"
          message={`Attendance broadcast is currently active. Tap to view live incoming feeds.`}
          actionText="Resume Live"
          onAction={onNavigateLiveSession}
          style={{ marginVertical: theme.spacing.sm }}
        />
      )}

      {/* Courses List */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Your Assigned Courses
        </Text>
        <Text style={[styles.sectionCount, { color: theme.text.muted }]}>
          {courses.length} Active Courses
        </Text>
      </View>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Courses Found"
          message="You do not have any assigned courses currently."
        />
      ) : (
        courses.map(course => (
          <GlassCard
            key={course.id}
            padding={18}
            style={[styles.courseCard, { marginBottom: theme.spacing.sm }]}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.courseCode, { color: theme.accent.primary }]}>
                  {course.code} • Division {course.division}
                </Text>
                <Text style={[styles.courseName, { color: theme.text.primary }]}>
                  {course.name}
                </Text>
              </View>

              <View
                style={[
                  styles.enrolledPill,
                  { backgroundColor: theme.surface.subtle, borderColor: theme.surface.cardBorder },
                ]}
              >
                <Users size={13} color={theme.text.secondary} style={{ marginRight: 4 }} />
                <Text style={[styles.enrolledText, { color: theme.text.secondary }]}>
                  60 Enrolled
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <Button
                title="Start Attendance Session"
                icon={Play}
                size="md"
                variant="primary"
                onPress={() => onNavigateStartSession(course)}
              />
            </View>
          </GlassCard>
        ))
      )}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  welcomeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  deptText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  courseCard: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  courseName: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 2,
  },
  enrolledPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  enrolledText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardActions: {
    width: '100%',
  },
});
