import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Radio, Flame, Clock, ChevronRight, AlertTriangle, ShieldCheck, Sparkles, BookOpen } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getMyAttendance, getTodayTimetable, getBadges } from '../../api/attendance';
import { calculateSafeMargin } from '../../utils/time';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedRing } from '../../components/AnimatedRing';
import { EmptyState } from '../../components/EmptyState';
import { StatusBanner } from '../../components/StatusBanner';

export function HomeScreen({ onNavigateMark, onNavigateMyAttendance, onNavigateTimetable }) {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activeSessionFound, setActiveSessionFound] = useState(null);

  const loadData = async () => {
    try {
      const [attData, ttData, bgData] = await Promise.all([
        getMyAttendance(),
        getTodayTimetable(),
        getBadges(),
      ]);
      setCourses(attData || []);
      setTimetable(ttData || []);
      setBadges(bgData || []);

      const live = (ttData || []).find(t => t.isLiveNow);
      setActiveSessionFound(live || null);
    } catch (e) {
      console.warn('Failed to load student home data:', e);
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
      {/* Student Welcome Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greetingLabel, { color: theme.text.muted }]}>
            Good Day 👋
          </Text>
          <Text style={[styles.userName, { color: theme.text.primary }]}>
            {user?.name || 'Aarav Patel'}
          </Text>
          <Text style={[styles.rollBadge, { color: theme.text.secondary }]}>
            {user?.roll_no || '22AIML042'} • AIML-A
          </Text>
        </View>

        {/* Streak Pill */}
        <View
          style={[
            styles.streakBadge,
            {
              backgroundColor: theme.surface.card,
              borderColor: theme.surface.cardBorder,
            },
          ]}
        >
          <Flame size={18} color="#F97316" style={{ marginRight: 6 }} />
          <View>
            <Text style={[styles.streakNumber, { color: theme.text.primary }]}>
              {user?.streak || 14}
            </Text>
            <Text style={[styles.streakSub, { color: theme.text.muted }]}>Day Streak</Text>
          </View>
        </View>
      </View>

      {/* Hero "Attendance Open Now" Active Banner */}
      {activeSessionFound && (
        <StatusBanner
          type="info"
          title="Attendance Active Now!"
          message={`${activeSessionFound.courseName} (${activeSessionFound.courseCode}) in ${activeSessionFound.room}`}
          actionText="Mark Now"
          onAction={onNavigateMark}
          style={{ marginVertical: theme.spacing.sm }}
        />
      )}

      {/* HERO ACTION: Mark Attendance CTA Card */}
      <GlassCard
        variant="glow"
        style={[styles.heroCard, { marginVertical: theme.spacing.sm }]}
        padding={theme.spacing.lg}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroTextCol}>
            <View style={styles.beaconPill}>
              <View
                style={[
                  styles.pulseDot,
                  { backgroundColor: activeSessionFound ? theme.semantic.success : theme.accent.primary },
                ]}
              />
              <Text
                style={[
                  styles.beaconText,
                  { color: activeSessionFound ? theme.semantic.success : theme.accent.primary },
                ]}
              >
                {activeSessionFound ? 'CLASSROOM BEACON IN RANGE' : 'READY TO SCAN'}
              </Text>
            </View>

            <Text style={[styles.heroTitle, { color: theme.text.primary }]}>
              Mark Class Attendance
            </Text>
            <Text style={[styles.heroDesc, { color: theme.text.secondary }]}>
              Broadcast token scanning with cryptographic hardware signature.
            </Text>
          </View>
        </View>

        <View style={{ marginTop: theme.spacing.md }}>
          <Button
            title="Mark Attendance"
            icon={Radio}
            size="lg"
            variant="primary"
            onPress={onNavigateMark}
          />
        </View>
      </GlassCard>

      {/* TODAY'S TIMETABLE STRIP */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Clock size={16} color={theme.accent.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Today's Schedule
          </Text>
        </View>
        <Text style={[styles.dateToday, { color: theme.text.muted }]}>Tuesday, Week 4</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timetableScroll}>
        {timetable.map(item => {
          const isLive = item.isLiveNow;
          return (
            <GlassCard
              key={item.id}
              variant={isLive ? 'accent' : 'default'}
              style={[
                styles.timetableCard,
                {
                  borderColor: isLive ? theme.accent.primary : theme.surface.cardBorder,
                  marginRight: theme.spacing.sm,
                },
              ]}
              padding={14}
            >
              <View style={styles.timetableTopRow}>
                <Text style={[styles.slotText, { color: isLive ? theme.accent.primary : theme.text.muted }]}>
                  {item.timeSlot}
                </Text>
                {isLive && (
                  <View style={[styles.liveTag, { backgroundColor: theme.semantic.successBg }]}>
                    <Text style={[styles.liveTagText, { color: theme.semantic.success }]}>
                      OPEN NOW
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.courseName, { color: theme.text.primary }]} numberOfLines={1}>
                {item.courseName}
              </Text>
              <Text style={[styles.teacherRoom, { color: theme.text.secondary }]}>
                {item.room} • {item.teacher}
              </Text>
            </GlassCard>
          );
        })}
      </ScrollView>

      {/* ATTENDANCE HEALTH DASHBOARD */}
      <View style={[styles.sectionHeader, { marginTop: theme.spacing.lg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ShieldCheck size={16} color={theme.semantic.success} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Attendance Health
          </Text>
        </View>

        <Pressable
          onPress={onNavigateMyAttendance}
          style={styles.seeAllBtn}
          accessibilityRole="link"
          accessibilityLabel="View full attendance breakdown"
        >
          <Text style={[styles.seeAllText, { color: theme.accent.primary }]}>Full Analysis</Text>
          <ChevronRight size={14} color={theme.accent.primary} />
        </Pressable>
      </View>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Courses Enrolled"
          message="You are not enrolled in any course yet."
        />
      ) : (
        <View style={styles.courseCardsContainer}>
          {courses.map((item, idx) => {
            const att = Number(item.attended);
            const tot = Number(item.total);
            const pct = tot > 0 ? Math.round((att / tot) * 100) : 0;
            const margin = calculateSafeMargin(att, tot, 75);
            const isDanger = pct < 75;

            return (
              <GlassCard
                key={idx}
                style={[
                  styles.subjectCard,
                  {
                    borderColor: isDanger ? theme.semantic.dangerBorder : theme.surface.cardBorder,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
                padding={16}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <View style={styles.codeRow}>
                      <Text style={[styles.subCode, { color: theme.accent.primary }]}>
                        {item.code}
                      </Text>
                      {isDanger && (
                        <View style={[styles.warningBadge, { backgroundColor: theme.semantic.dangerBg }]}>
                          <AlertTriangle size={11} color={theme.semantic.danger} style={{ marginRight: 3 }} />
                          <Text style={[styles.warningText, { color: theme.semantic.danger }]}>
                            Below 75%
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={[styles.subTitle, { color: theme.text.primary }]}>
                      {item.course}
                    </Text>
                    <Text style={[styles.subAttendanceNumbers, { color: theme.text.secondary }]}>
                      Attended {item.attended} of {item.total} classes
                    </Text>
                  </View>

                  <AnimatedRing percentage={pct} size={58} strokeWidth={6} />
                </View>

                {/* Safe Margin Insight Box */}
                <View
                  style={[
                    styles.marginBox,
                    {
                      backgroundColor: isDanger ? theme.semantic.dangerBg : theme.surface.subtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.marginText,
                      { color: isDanger ? theme.semantic.danger : theme.text.secondary },
                    ]}
                  >
                    💡 {margin.message}
                  </Text>
                </View>
              </GlassCard>
            );
          })}
        </View>
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
  greetingLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  rollBadge: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  streakNumber: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  streakSub: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  heroCard: {
    width: '100%',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTextCol: {
    flex: 1,
  },
  beaconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  beaconText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  heroDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateToday: {
    fontSize: 12,
    fontWeight: '500',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timetableScroll: {
    flexDirection: 'row',
  },
  timetableCard: {
    width: 220,
  },
  timetableTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  liveTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  courseName: {
    fontSize: 14,
    fontWeight: '600',
  },
  teacherRoom: {
    fontSize: 12,
    marginTop: 3,
  },
  courseCardsContainer: {
    marginTop: 6,
  },
  subjectCard: {
    width: '100%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subCode: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  warningText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  subAttendanceNumbers: {
    fontSize: 13,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  marginBox: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
  },
  marginText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
