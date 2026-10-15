import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Edit3, Wifi } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatTimeAmPm } from '../utils/time';

export function StudentRow({
  student, // { name, roll_no, status: 'present'|'manual', rssi_median, marked_at, note }
  index,
}) {
  const { theme } = useTheme();

  const isManual = student.status === 'manual';

  return (
    <View
      style={[
        styles.rowCard,
        {
          backgroundColor: theme.surface.card,
          borderColor: theme.surface.cardBorder,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
        },
      ]}
    >
      <View style={styles.leftCol}>
        <View
          style={[
            styles.avatarBadge,
            {
              backgroundColor: isManual ? theme.semantic.warningBg : theme.semantic.successBg,
              borderColor: isManual ? theme.semantic.warningBorder : theme.semantic.successBorder,
            },
          ]}
        >
          {isManual ? (
            <Edit3 size={16} color={theme.semantic.warning} />
          ) : (
            <Check size={16} color={theme.semantic.success} />
          )}
        </View>

        <View style={styles.infoCol}>
          <Text style={[styles.nameText, { color: theme.text.primary, fontSize: theme.typography.bodyMedium.fontSize }]}>
            {student.name}
          </Text>
          <View style={styles.subRow}>
            <Text style={[styles.rollText, { color: theme.text.secondary }]}>
              {student.roll_no}
            </Text>
            {isManual && (
              <View style={[styles.manualTag, { backgroundColor: theme.semantic.warningBg }]}>
                <Text style={[styles.manualTagText, { color: theme.semantic.warning }]}>
                  Manual: {student.note || 'Verified'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.timeText, { color: theme.text.muted }]}>
          {formatTimeAmPm(student.marked_at)}
        </Text>
        {student.rssi_median !== undefined && (
          <View style={styles.rssiBadge}>
            <Wifi size={12} color={theme.semantic.success} style={{ marginRight: 3 }} />
            <Text style={[styles.rssiText, { color: theme.semantic.success }]}>
              {student.rssi_median} dB
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowCard: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  nameText: {
    fontWeight: '600',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  rollText: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    marginRight: 8,
  },
  manualTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  manualTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  rssiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  rssiText: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
