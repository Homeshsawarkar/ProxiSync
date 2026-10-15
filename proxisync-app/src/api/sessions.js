// Sessions API methods
// Matches PDF Build Guide Section 6.1 & 6.3

import { apiClient, USE_MOCKS } from './client';
import { mockApi } from '../mocks/mockApi';

export async function getCourses() {
  if (USE_MOCKS) {
    return await mockApi.getCourses();
  }
  const response = await apiClient.get('/courses');
  return response.data;
}

export async function getRooms() {
  if (USE_MOCKS) {
    return await mockApi.getRooms();
  }
  const response = await apiClient.get('/rooms');
  return response.data;
}

export async function getStudentsForCourse(courseId) {
  if (USE_MOCKS) {
    return await mockApi.getStudentsForCourse(courseId);
  }
  const response = await apiClient.get(`/courses/${courseId}/students`);
  return response.data;
}

export async function getActiveSessions() {
  if (USE_MOCKS) {
    return await mockApi.getActiveSessions();
  }
  const response = await apiClient.get('/sessions?status=active');
  return response.data;
}

export async function createSession(courseId, roomId, durationMinutes) {
  if (USE_MOCKS) {
    return await mockApi.createSession(courseId, roomId, durationMinutes);
  }
  const response = await apiClient.post('/sessions', {
    course_id: courseId,
    room_id: roomId,
    duration_minutes: durationMinutes,
  });
  return response.data;
}

export async function getSessionToken(sessionId) {
  if (USE_MOCKS) {
    return await mockApi.getSessionToken(sessionId);
  }
  const response = await apiClient.get(`/sessions/${sessionId}/token`);
  return response.data;
}

export async function closeSession(sessionId) {
  if (USE_MOCKS) {
    return await mockApi.closeSession(sessionId);
  }
  const response = await apiClient.post(`/sessions/${sessionId}/close`);
  return response.data;
}
