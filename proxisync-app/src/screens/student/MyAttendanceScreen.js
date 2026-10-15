import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { PieChart, ShieldAlert, Award, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { getMyAttendance } from '../../api/attendance';
import { calculateSafeMargin } from '../../utils/time';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedRing } from '../../components/AnimatedRing';

export function MyAttendanceScreen() {
  const { theme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await getMyAttendance();
      setCourses(data || []);
    } catch (e) {
      console.warn('Failed to load my attendance:', e);
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

  // Calculate overall attendance aggregate safely
  let totalAttended = 0;
  let totalSessions = 0;
  courses.forEach(c => {
    totalAttended += Number(c.attended) || 0;
    totalSessions += Number(c.total) || 0;
  });

  const overallPct = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0;
  const overallSafe = overallPct >= 75;

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
      {/* Overview Aggregate Card */}
      <GlassCard variant="glow" padding={20} style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.statusTag,
                  {
                    backgroundColor: overallSafe ? theme.semantic.successBg : theme.semantic.dangerBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    { color: overallSafe ? theme.semantic.success : theme.semantic.danger },
                  ]}
                >
                  {overallSafe ? 'GOOD STANDING (≥75%)' : 'ATTENDANCE SHORTAGE (<75%)'}
                </Text>
              </View>
            </View>

            <Text style={[styles.overviewTitle, { color: theme.text.primary }]}>
              Cumulative Attendance
            </Text>
            <Text style={[styles.overviewSub, { color: theme.text.secondary }]}>
              {totalAttended} of {totalSessions} total lectures recorded across {courses.length} subjects.
            </Text>
          </View>

          <AnimatedRing percentage={overallPct} size={84} strokeWidth={8} subtitle="Total" />
        </View>
      </GlassCard>

      <Text style={[styles.listHeading, { color: theme.text.primary, marginTop: 24, marginBottom: 12 }]}>
        Subject-Wise Breakdown
      </Text>

      {courses.map((item, idx) => {
        const att = Number(item.attended) || 0;
        const tot = Number(item.total) || 0;
        const pct = tot > 0 ? Math.round((att / tot) * 100) : 0;
        const margin = calculateSafeMargin(att, tot, 75);
        const isBelow75 = pct < 75;

        return (
          <GlassCard
            key={idx}
            style={[
              styles.courseCard,
              {
                borderColor: isBelow75 ? theme.semantic.dangerBorder : theme.surface.cardBorder,
                marginBottom: theme.spacing.md,
              },
            ]}
            padding={18}
          >
            {/* Top row: Code + Warning + Progress Ring */}
            <View style={styles.courseTopRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.codeText, { color: theme.accent.primary }]}>
                    {item.code}
                  </Text>
                  {isBelow75 && (
                    <View style={[styles.warningPill, { backgroundColor: theme.semantic.dangerBg }]}>
                      <AlertTriangle size={11} color={theme.semantic.danger} style={{ marginRight: 3 }} />
                      <Text style={[styles.warningPillText, { color: theme.semantic.danger }]}>
                        Below 75%
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.courseName, { color: theme.text.primary }]}>
                  {item.course}
                </Text>
              </View>

              <AnimatedRing percentage={pct} size={54} strokeWidth={6} />
            </View>

            {/* Attendance numbers & linear progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabelRow}>
                <Text style={[styles.countText, { color: theme.text.secondary }]}>
                  {att} / {tot} sessions attended
                </Text>
                <Text
                  style={[
                    styles.pctVal,
                    { color: isBelow75 ? theme.semantic.danger : theme.semantic.success },
                  ]}
                >
                  {pct}%
                </Text>
              </View>

              <View style={[styles.barTrack, { backgroundColor: theme.surface.cardBorder }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: isBelow75 ? theme.semantic.danger : theme.semantic.success,
                    },
                  ]}
                />
              </View>
            </View>

            {/* SAFE MARGIN CARD (Calculated on Device) */}
            <View
              style={[
                styles.marginCard,
                {
                  backgroundColor: isBelow75 ? theme.semantic.dangerBg : theme.surface.subtle,
                  borderColor: isBelow75 ? theme.semantic.dangerBorder : theme.surface.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.marginMsg,
                  { color: isBelow75 ? theme.semantic.danger : theme.text.primary },
                ]}
              >
                {isBelow75 ? '⚠️ ' : '🛡️ '} {margin.message}
              </Text>
            </View>
          </GlassCard>
        );
      })}
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
  overviewCard: {
    width: '100%',
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    marginBottom: 6,
  },
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  overviewSub: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  listHeading: {
    fontSize: 17,
    fontWeight: '700',
  },
  courseCard: {
    width: '100%',
  },
  courseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  warningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  warningPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  courseName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  pctVal: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  marginCard: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  marginMsg: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
