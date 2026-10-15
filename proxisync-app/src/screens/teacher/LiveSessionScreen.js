import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { Radio, Users, Clock, Plus, Square, Download, CheckCircle2, AlertTriangle, Shield, Key } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useSession } from '../../context/SessionContext';
import { formatSecondsCountdown } from '../../utils/time';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { CountdownRing } from '../../components/CountdownRing';
import { StudentRow } from '../../components/StudentRow';
import { EmptyState } from '../../components/EmptyState';

export function LiveSessionScreen({ onNavigateManualAdd, onSessionClosed, onExportReports }) {
  const { theme } = useTheme();
  const {
    activeSession,
    currentToken,
    tokenExpiresIn,
    liveAttendance,
    sessionRemainingSeconds,
    endSession,
  } = useSession();

  const [confirmCloseModal, setConfirmCloseModal] = useState(false);
  const [summaryModal, setSummaryModal] = useState(false);
  const [closing, setClosing] = useState(false);
  const [finalStats, setFinalStats] = useState(null);

  const handleCloseSession = async () => {
    setClosing(true);
    setFinalStats({
      totalPresent: liveAttendance.length,
      manualCount: liveAttendance.filter(a => a.status === 'manual').length,
      bleCount: liveAttendance.filter(a => a.status === 'present').length,
    });

    await endSession();
    setConfirmCloseModal(false);
    setSummaryModal(true);
    setClosing(false);
  };

  const totalEnrolled = 60;
  const presentCount = liveAttendance.length;
  const attendancePct = Math.round((presentCount / totalEnrolled) * 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { padding: theme.spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Command Centre Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.broadcastActiveRow}>
              <View style={[styles.pulsingDot, { backgroundColor: theme.semantic.success }]} />
              <Text style={[styles.broadcastText, { color: theme.semantic.success }]}>
                BROADCAST ACTIVE • SERVICE 0000FD68
              </Text>
            </View>
            <Text style={[styles.sessionCourseName, { color: theme.text.primary }]}>
              Machine Learning (CS301)
            </Text>
            <Text style={[styles.sessionRoom, { color: theme.text.secondary }]}>
              Room LH-101 • Time Remaining: {formatSecondsCountdown(sessionRemainingSeconds)}
            </Text>
          </View>

          {/* Token Countdown Ring */}
          <View style={styles.tokenRingWrapper}>
            <CountdownRing
              seconds={tokenExpiresIn}
              maxSeconds={20}
              size={56}
              label="Token"
            />
          </View>
        </View>

        {/* Live Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Present Count Metric */}
          <GlassCard padding={16} style={[styles.metricCard, { marginRight: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Users size={16} color={theme.accent.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.metricLabel, { color: theme.text.muted }]}>
                Attendance
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: theme.text.primary }]}>
              {presentCount} <Text style={{ fontSize: 14, color: theme.text.muted }}>/ {totalEnrolled}</Text>
            </Text>
            <Text style={[styles.metricSub, { color: theme.accent.primary }]}>
              {attendancePct}% of class present
            </Text>
          </GlassCard>

          {/* Rotating Token Metric */}
          <GlassCard padding={16} style={[styles.metricCard, { marginLeft: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Key size={16} color={theme.semantic.info} style={{ marginRight: 6 }} />
              <Text style={[styles.metricLabel, { color: theme.text.muted }]}>
                Live BLE Token
              </Text>
            </View>
            <Text style={[styles.tokenText, { color: theme.text.primary }]}>
              {currentToken}
            </Text>
            <Text style={[styles.metricSub, { color: theme.text.secondary }]}>
              Rotates every 20s
            </Text>
          </GlassCard>
        </View>

        {/* Live Feed Header */}
        <View style={styles.feedHeaderRow}>
          <View>
            <Text style={[styles.feedTitle, { color: theme.text.primary }]}>
              Live Verification Feed
            </Text>
            <Text style={[styles.feedSub, { color: theme.text.muted }]}>
              Polled every 3 seconds • Newest at top
            </Text>
          </View>

          <Button
            title="Manual Add"
            icon={Plus}
            size="sm"
            variant="secondary"
            onPress={onNavigateManualAdd}
          />
        </View>

        {/* Live List of Present Students */}
        {liveAttendance.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Awaiting Students"
            message="No students have marked attendance yet. Beacon is broadcasting."
          />
        ) : (
          <View style={{ marginTop: 8 }}>
            {liveAttendance.map((st, idx) => (
              <StudentRow key={st.roll_no || idx} student={st} index={idx} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Control Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.surface.card,
            borderTopColor: theme.surface.cardBorder,
          },
        ]}
      >
        <Button
          title="Manual Student Check-in"
          icon={Plus}
          variant="secondary"
          size="md"
          onPress={onNavigateManualAdd}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="End Session"
          icon={Square}
          variant="danger"
          size="md"
          onPress={() => setConfirmCloseModal(true)}
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>

      {/* Confirmation Dialog to End Session */}
      <Modal
        visible={confirmCloseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmCloseModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <GlassCard padding={20} style={styles.modalBox}>
            <AlertTriangle size={32} color={theme.semantic.warning} style={{ marginBottom: 10 }} />
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              Close Attendance Session?
            </Text>
            <Text style={[styles.modalDesc, { color: theme.text.secondary }]}>
              This will immediately stop Bluetooth Low Energy broadcasting. Any subsequent submissions will be rejected with SESSION_INACTIVE.
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setConfirmCloseModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Yes, Close"
                variant="danger"
                loading={closing}
                onPress={handleCloseSession}
                style={{ flex: 1 }}
              />
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Final Session Summary Modal */}
      <Modal
        visible={summaryModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSummaryModal(false);
          onSessionClosed?.();
        }}
      >
        <View style={styles.modalBackdrop}>
          <GlassCard padding={24} style={styles.modalBox}>
            <CheckCircle2 size={40} color={theme.semantic.success} style={{ marginBottom: 12 }} />
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              Session Completed
            </Text>
            <Text style={[styles.modalDesc, { color: theme.text.secondary }]}>
              Attendance closed and safely sealed into PostgreSQL audit log.
            </Text>

            <View
              style={[
                styles.summaryStatsBox,
                { backgroundColor: theme.surface.subtle, borderColor: theme.surface.cardBorder },
              ]}
            >
              <View style={styles.statRow}>
                <Text style={{ color: theme.text.secondary }}>Total Present:</Text>
                <Text style={[styles.statVal, { color: theme.text.primary }]}>
                  {finalStats?.totalPresent || 0} students
                </Text>
              </View>
              <View style={[styles.statRow, { marginTop: 6 }]}>
                <Text style={{ color: theme.text.secondary }}>Verified via BLE:</Text>
                <Text style={[styles.statVal, { color: theme.semantic.success }]}>
                  {finalStats?.bleCount || 0}
                </Text>
              </View>
              <View style={[styles.statRow, { marginTop: 6 }]}>
                <Text style={{ color: theme.text.secondary }}>Manual Additions:</Text>
                <Text style={[styles.statVal, { color: theme.semantic.warning }]}>
                  {finalStats?.manualCount || 0}
                </Text>
              </View>
            </View>

            <View style={{ width: '100%', marginTop: 20, gap: 10 }}>
              <Button
                title="View & Export Reports (CSV)"
                icon={Download}
                variant="primary"
                onPress={() => {
                  setSummaryModal(false);
                  onExportReports?.();
                }}
              />
              <Button
                title="Return to Dashboard"
                variant="outline"
                onPress={() => {
                  setSummaryModal(false);
                  onSessionClosed?.();
                }}
              />
            </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  broadcastActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  broadcastText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sessionCourseName: {
    fontSize: 20,
    fontWeight: '700',
  },
  sessionRoom: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tokenRingWrapper: {
    marginLeft: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  metricSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tokenText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 6,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  feedSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 14,
    borderTopWidth: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  summaryStatsBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statVal: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
