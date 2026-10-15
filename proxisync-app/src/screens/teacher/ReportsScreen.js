import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Download, FileSpreadsheet, AlertTriangle, Check, BookOpen } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { getCourses } from '../../api/sessions';
import { getCourseReportCsv } from '../../api/attendance';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

export function ReportsScreen() {
  const { theme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(101);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Mock preview roster stats
  const previewRoster = [
    { roll_no: '22AIML042', name: 'Aarav Patel', attended: 22, total: 26, percent: 84.6 },
    { roll_no: '22AIML018', name: 'Neha Rao', attended: 15, total: 26, percent: 57.7 },
    { roll_no: '22AIML055', name: 'Rohan Deshmukh', attended: 25, total: 26, percent: 96.2 },
    { roll_no: '22AIML009', name: 'Priya Iyer', attended: 20, total: 26, percent: 76.9 },
    { roll_no: '22AIML031', name: 'Kabir Verma', attended: 17, total: 26, percent: 65.4 },
  ];

  useEffect(() => {
    async function load() {
      try {
        const list = await getCourses();
        setCourses(list || []);
        if (list?.length > 0) setSelectedCourseId(list[0].id);
      } catch (e) {
        console.warn('Failed to load courses for reports:', e);
      }
    }
    load();
  }, []);

  const handleDownloadCsv = async () => {
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const csvText = await getCourseReportCsv(selectedCourseId);

      // In browser/web environment trigger a direct file download
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `course_${selectedCourseId}_attendance_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.warn('CSV export error:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.surface.background }]}
      contentContainerStyle={[styles.content, { padding: theme.spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerArea}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Attendance Reports & Audits
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.muted }]}>
          Generate regulatory attendance exports with tamper-evident records
        </Text>
      </View>

      {/* Course Picker Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseTabsScroll}>
        {courses.map(course => {
          const isSelected = selectedCourseId === course.id;
          return (
            <Pressable
              key={course.id}
              onPress={() => setSelectedCourseId(course.id)}
              style={[
                styles.courseTab,
                {
                  backgroundColor: isSelected ? theme.accent.primary : theme.surface.card,
                  borderColor: isSelected ? theme.accent.primary : theme.surface.cardBorder,
                  marginRight: 8,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabCourseCode,
                  { color: isSelected ? '#FFFFFF' : theme.text.primary },
                ]}
              >
                {course.code}
              </Text>
              <Text
                style={[
                  styles.tabCourseName,
                  { color: isSelected ? '#FFFFFF' : theme.text.secondary },
                ]}
              >
                {course.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Export Action Card */}
      <GlassCard padding={18} style={styles.exportCard}>
        <View style={styles.exportRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={[styles.exportTitle, { color: theme.text.primary }]}>
              Official CSV Attendance Register
            </Text>
            <Text style={[styles.exportSub, { color: theme.text.secondary }]}>
              Contains student roll numbers, session aggregates, percentage, and 75% cutoff indicator.
            </Text>
          </View>

          <Button
            title={downloadSuccess ? 'Downloaded!' : 'Export CSV'}
            icon={downloadSuccess ? Check : Download}
            size="md"
            variant={downloadSuccess ? 'success' : 'primary'}
            loading={downloading}
            onPress={handleDownloadCsv}
          />
        </View>
      </GlassCard>

      {/* Preview Table (Section 8.3) */}
      <View style={[styles.tableSection, { marginTop: 24 }]}>
        <Text style={[styles.sectionHeading, { color: theme.text.primary, marginBottom: 12 }]}>
          Attendance Register Preview
        </Text>

        <GlassCard padding={0} style={styles.tableCard}>
          {/* Table Header */}
          <View
            style={[
              styles.tableHeader,
              { backgroundColor: theme.surface.subtle, borderBottomColor: theme.surface.cardBorder },
            ]}
          >
            <Text style={[styles.thText, { color: theme.text.secondary, flex: 1.2 }]}>Roll No</Text>
            <Text style={[styles.thText, { color: theme.text.secondary, flex: 2 }]}>Student Name</Text>
            <Text style={[styles.thText, { color: theme.text.secondary, flex: 1, textAlign: 'center' }]}>Attended</Text>
            <Text style={[styles.thText, { color: theme.text.secondary, flex: 1, textAlign: 'right' }]}>Percent</Text>
          </View>

          {/* Table Rows */}
          {previewRoster.map((item, idx) => {
            const isDefaulter = item.percent < 75;
            return (
              <View
                key={item.roll_no}
                style={[
                  styles.tableRow,
                  {
                    borderBottomColor: theme.surface.cardBorder,
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                  },
                ]}
              >
                <Text style={[styles.tdRoll, { color: theme.text.primary, flex: 1.2 }]}>
                  {item.roll_no}
                </Text>
                <Text style={[styles.tdName, { color: theme.text.primary, flex: 2 }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.tdCount, { color: theme.text.secondary, flex: 1, textAlign: 'center' }]}>
                  {item.attended}/{item.total}
                </Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.tdPct,
                      { color: isDefaulter ? theme.semantic.danger : theme.semantic.success },
                    ]}
                  >
                    {item.percent}%
                  </Text>
                </View>
              </View>
            );
          })}
        </GlassCard>
      </View>
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
  headerArea: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  courseTabsScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  courseTab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabCourseCode: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabCourseName: {
    fontSize: 11,
    marginTop: 2,
  },
  exportCard: {
    width: '100%',
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exportTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  exportSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  tableSection: {
    width: '100%',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  tableCard: {
    width: '100%',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  thText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tdRoll: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  tdName: {
    fontSize: 13,
    fontWeight: '500',
  },
  tdCount: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  tdPct: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
