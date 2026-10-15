import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Search, ArrowLeft, Check, AlertCircle, Edit3, User } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useSession } from '../../context/SessionContext';
import { getStudentsForCourse } from '../../api/sessions';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

export function ManualAddScreen({ onDone, onCancel }) {
  const { theme } = useTheme();
  const { activeSession, liveAttendance, manualAdd } = useSession();

  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      if (!activeSession) return;
      try {
        const list = await getStudentsForCourse(activeSession.course_id || 101);
        setStudents(list || []);
      } catch (e) {
        console.warn('Failed to load students for manual add:', e);
      }
    }
    loadStudents();
  }, [activeSession]);

  const presentStudentIds = liveAttendance.map(a => a.student_id);

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.roll_no.toLowerCase().includes(q);
  });

  const handleConfirm = async () => {
    setNoteError(null);
    if (!selectedStudent) {
      setNoteError('Please select a student from the roster');
      return;
    }
    if (!note || note.trim().length === 0) {
      setNoteError('Mandatory note required (e.g. Phone battery dead, hardware issue)');
      return;
    }

    setSubmitting(true);
    const res = await manualAdd(selectedStudent.id, note.trim());
    if (res.success) {
      onDone?.();
    } else {
      setNoteError(res.error || 'Failed to manually record attendance');
    }
    setSubmitting(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.surface.background }]}
      contentContainerStyle={[styles.content, { padding: theme.spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={onCancel} style={styles.backRow}>
        <ArrowLeft size={18} color={theme.text.secondary} style={{ marginRight: 6 }} />
        <Text style={[styles.backText, { color: theme.text.secondary }]}>
          Back to Live Feed
        </Text>
      </Pressable>

      <Text style={[styles.title, { color: theme.text.primary }]}>
        Manual Check-in
      </Text>
      <Text style={[styles.subtitle, { color: theme.text.muted }]}>
        Record attendance manually with an audited faculty note
      </Text>

      {/* Search Input */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: theme.surface.input,
            borderColor: theme.surface.inputBorder,
            borderRadius: theme.radii.lg,
          },
        ]}
      >
        <Search size={18} color={theme.text.muted} style={{ marginLeft: 12, marginRight: 8 }} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or roll number..."
          placeholderTextColor={theme.text.muted}
          style={[styles.searchInput, { color: theme.text.primary }]}
        />
      </View>

      {/* Roster Picker List */}
      <Text style={[styles.sectionHeading, { color: theme.text.secondary, marginTop: 16 }]}>
        Enrolled Class Roster
      </Text>

      <View style={styles.rosterContainer}>
        {filteredStudents.map(st => {
          const isPresent = presentStudentIds.includes(st.id);
          const isSelected = selectedStudent?.id === st.id;

          return (
            <Pressable
              key={st.id}
              disabled={isPresent}
              onPress={() => setSelectedStudent(st)}
              style={[
                styles.studentItem,
                {
                  backgroundColor: isSelected ? theme.surface.subtle : theme.surface.card,
                  borderColor: isSelected ? theme.accent.primary : theme.surface.cardBorder,
                  opacity: isPresent ? 0.45 : 1,
                },
              ]}
            >
              <View style={styles.studentInfoCol}>
                <Text style={[styles.studentName, { color: theme.text.primary }]}>
                  {st.name}
                </Text>
                <Text style={[styles.studentRoll, { color: theme.text.secondary }]}>
                  {st.roll_no}
                </Text>
              </View>

              {isPresent ? (
                <View style={[styles.alreadyPresentTag, { backgroundColor: theme.semantic.successBg }]}>
                  <Text style={[styles.alreadyPresentText, { color: theme.semantic.success }]}>
                    Already Present
                  </Text>
                </View>
              ) : isSelected ? (
                <Check size={18} color={theme.accent.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* Mandatory Note Field */}
      <GlassCard padding={16} style={[styles.noteCard, { marginTop: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Edit3 size={16} color={theme.semantic.warning} style={{ marginRight: 6 }} />
          <Text style={[styles.noteHeading, { color: theme.text.primary }]}>
            Reason / Justification Note (Required)
          </Text>
        </View>
        <Text style={[styles.noteSub, { color: theme.text.muted }]}>
          Will be permanently logged with your instructor signature for audit.
        </Text>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Phone battery drained, physical verification in front row"
          placeholderTextColor={theme.text.muted}
          multiline
          numberOfLines={3}
          style={[
            styles.noteInput,
            {
              backgroundColor: theme.surface.input,
              borderColor: noteError ? theme.semantic.danger : theme.surface.inputBorder,
              color: theme.text.primary,
            },
          ]}
        />

        {noteError && (
          <View style={styles.errorRow}>
            <AlertCircle size={14} color={theme.semantic.danger} style={{ marginRight: 6 }} />
            <Text style={[styles.errorMsg, { color: theme.semantic.danger }]}>{noteError}</Text>
          </View>
        )}
      </GlassCard>

      <View style={{ marginTop: 20 }}>
        <Button
          title={selectedStudent ? `Confirm Attendance for ${selectedStudent.name}` : 'Select Student to Confirm'}
          size="lg"
          variant="primary"
          loading={submitting}
          disabled={!selectedStudent}
          onPress={handleConfirm}
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
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    paddingRight: 12,
    outlineStyle: 'none',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  rosterContainer: {
    gap: 8,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  studentInfoCol: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  studentRoll: {
    fontSize: 12,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  alreadyPresentTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  alreadyPresentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noteCard: {
    width: '100%',
  },
  noteHeading: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteSub: {
    fontSize: 12,
    marginBottom: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorMsg: {
    fontSize: 12,
    fontWeight: '500',
  },
});
