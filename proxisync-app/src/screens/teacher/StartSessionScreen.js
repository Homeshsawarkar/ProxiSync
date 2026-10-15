import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Radio, MapPin, Clock, CheckCircle2, AlertTriangle, ArrowLeft, Play } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useSession } from '../../context/SessionContext';
import { getRooms, getCourses } from '../../api/sessions';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

export function StartSessionScreen({ initialCourse, onSessionStarted, onCancel }) {
  const { theme } = useTheme();
  const { startNewSession } = useSession();

  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourse?.id || 101);
  const [selectedRoomId, setSelectedRoomId] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(10); // 5, 10, 15
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function loadPickers() {
      try {
        const [cList, rList] = await Promise.all([getCourses(), getRooms()]);
        setCourses(cList || []);
        setRooms(rList || []);
        if (initialCourse?.id) setSelectedCourseId(initialCourse.id);
        else if (cList?.length > 0) setSelectedCourseId(cList[0].id);
        if (rList?.length > 0) setSelectedRoomId(rList[0].id);
      } catch (e) {
        console.warn('Failed to load session setup pickers:', e);
      }
    }
    loadPickers();
  }, [initialCourse]);

  const handleStart = async () => {
    setLoading(true);
    setErrorMessage(null);

    const res = await startNewSession(selectedCourseId, selectedRoomId, durationMinutes);
    if (res.success) {
      onSessionStarted?.();
    } else {
      setErrorMessage(res.error || 'Could not start Bluetooth broadcast');
    }
    setLoading(false);
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || initialCourse;
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.surface.background }]}
      contentContainerStyle={[styles.content, { padding: theme.spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={onCancel} style={styles.backRow}>
        <ArrowLeft size={18} color={theme.text.secondary} style={{ marginRight: 6 }} />
        <Text style={[styles.backText, { color: theme.text.secondary }]}>Cancel</Text>
      </Pressable>

      <Text style={[styles.pageTitle, { color: theme.text.primary }]}>
        Configure Attendance Session
      </Text>
      <Text style={[styles.pageSub, { color: theme.text.muted }]}>
        Broadcast ephemeral anti-proxy BLE tokens to present students
      </Text>

      {errorMessage && (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: theme.semantic.dangerBg, borderColor: theme.semantic.dangerBorder },
          ]}
        >
          <AlertTriangle size={18} color={theme.semantic.danger} style={{ marginRight: 8 }} />
          <Text style={[styles.errorText, { color: theme.semantic.danger }]}>{errorMessage}</Text>
        </View>
      )}

      {/* 1. Selected Course */}
      <GlassCard padding={16} style={styles.card}>
        <Text style={[styles.sectionHeading, { color: theme.text.secondary }]}>
          Selected Course
        </Text>
        <Text style={[styles.courseTitle, { color: theme.text.primary }]}>
          {selectedCourse ? `${selectedCourse.name} (${selectedCourse.code})` : 'Machine Learning'}
        </Text>
        <Text style={[styles.courseMeta, { color: theme.text.muted }]}>
          Division {selectedCourse?.division || 'AIML-A'}
        </Text>
      </GlassCard>

      {/* 2. Room Picker */}
      <GlassCard padding={16} style={[styles.card, { marginTop: theme.spacing.md }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <MapPin size={16} color={theme.accent.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionHeading, { color: theme.text.secondary, marginBottom: 0 }]}>
            Lecture Room / Laboratory
          </Text>
        </View>

        {rooms.map(room => {
          const isSelected = selectedRoomId === room.id;
          return (
            <Pressable
              key={room.id}
              onPress={() => setSelectedRoomId(room.id)}
              style={[
                styles.roomOption,
                {
                  backgroundColor: isSelected ? theme.surface.subtle : 'transparent',
                  borderColor: isSelected ? theme.accent.primary : theme.surface.cardBorder,
                },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.roomName,
                    { color: isSelected ? theme.accent.primary : theme.text.primary },
                  ]}
                >
                  {room.name}
                </Text>
                <Text style={[styles.rssiLimit, { color: theme.text.muted }]}>
                  Calibrated Proximity Threshold: {room.rssi_threshold} dBm
                </Text>
              </View>

              {isSelected && <CheckCircle2 size={18} color={theme.accent.primary} />}
            </Pressable>
          );
        })}
      </GlassCard>

      {/* 3. Duration Selector (5, 10, 15 min) */}
      <GlassCard padding={16} style={[styles.card, { marginTop: theme.spacing.md }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Clock size={16} color={theme.accent.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionHeading, { color: theme.text.secondary, marginBottom: 0 }]}>
            Session Active Window
          </Text>
        </View>

        <View style={styles.durationRow}>
          {[5, 10, 15].map(min => {
            const isSelected = durationMinutes === min;
            return (
              <Pressable
                key={min}
                onPress={() => setDurationMinutes(min)}
                style={[
                  styles.durationBtn,
                  {
                    backgroundColor: isSelected ? theme.accent.primary : theme.surface.subtle,
                    borderColor: isSelected ? theme.accent.primary : theme.surface.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    { color: isSelected ? '#FFFFFF' : theme.text.primary },
                  ]}
                >
                  {min} Minutes
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GlassCard>

      {/* 4. Hardware Checklist */}
      <View
        style={[
          styles.checklistBox,
          { backgroundColor: theme.surface.subtle, borderColor: theme.surface.cardBorder },
        ]}
      >
        <View style={styles.checkItem}>
          <CheckCircle2 size={16} color={theme.semantic.success} style={{ marginRight: 8 }} />
          <Text style={[styles.checkText, { color: theme.text.secondary }]}>
            Bluetooth Adapter Ready & Peripheral Advertising Supported
          </Text>
        </View>
        <View style={[styles.checkItem, { marginTop: 6 }]}>
          <CheckCircle2 size={16} color={theme.semantic.success} style={{ marginRight: 8 }} />
          <Text style={[styles.checkText, { color: theme.text.secondary }]}>
            ProxiSync Service UUID 0000FD68 Bound with 20s Token Rotation
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <View style={{ marginTop: 24 }}>
        <Button
          title="Start Live Broadcast"
          icon={Radio}
          size="lg"
          variant="primary"
          loading={loading}
          onPress={handleStart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 60,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  pageSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    width: '100%',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  courseMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  roomOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
  },
  rssiLimit: {
    fontSize: 11,
    marginTop: 2,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  checklistBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
