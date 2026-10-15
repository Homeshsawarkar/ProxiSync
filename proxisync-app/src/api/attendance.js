// Attendance API methods
// Matches PDF Build Guide Section 6.1 & 6.2

import { apiClient, USE_MOCKS } from './client';
import { mockApi } from '../mocks/mockApi';

export async function submitAttendance({ session_id, token, ts, rssi_samples, signature }) {
  if (USE_MOCKS) {
    return await mockApi.submitAttendance({ session_id, token, ts, rssi_samples, signature });
  }
  const response = await apiClient.post('/attendance', {
    session_id,
    token,
    ts,
    rssi_samples,
    signature,
  });
  return response.data;
}

export async function getSessionAttendance(sessionId) {
  if (USE_MOCKS) {
    return await mockApi.getSessionAttendance(sessionId);
  }
  const response = await apiClient.get(`/sessions/${sessionId}/attendance`);
  return response.data;
}

export async function markManualAttendance(sessionId, studentId, note) {
  if (USE_MOCKS) {
    return await mockApi.manualAddAttendance(sessionId, studentId, note);
  }
  const response = await apiClient.post(`/sessions/${sessionId}/manual`, {
    student_id: studentId,
    note,
  });
  return response.data;
}

export async function getCourseReportCsv(courseId) {
  if (USE_MOCKS) {
    return await mockApi.getCourseReportCsv(courseId);
  }
  const response = await apiClient.get(`/reports/course/${courseId}.csv`);
  return response.data;
}

export async function getMyAttendance() {
  if (USE_MOCKS) {
    return await mockApi.getMyAttendance();
  }
  const response = await apiClient.get('/me/attendance');
  return response.data;
}

// Student loved extra endpoints
export async function getTodayTimetable() {
  if (USE_MOCKS) {
    return await mockApi.getTodayTimetable();
  }
  return [];
}

export async function getBadges() {
  if (USE_MOCKS) {
    return await mockApi.getBadges();
  }
  return [];
}
