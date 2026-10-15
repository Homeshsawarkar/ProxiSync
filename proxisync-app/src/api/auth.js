// Auth & Device API methods
// Matches PDF Build Guide Section 6.1 & 6.3

import { apiClient, USE_MOCKS, setAuthToken } from './client';
import { mockApi } from '../mocks/mockApi';

export async function loginUser(email, password) {
  if (USE_MOCKS) {
    const res = await mockApi.login(email, password);
    setAuthToken(res.token);
    return res;
  }
  const response = await apiClient.post('/auth/login', { email, password });
  setAuthToken(response.data.token);
  return response.data;
}

export async function registerUser({ role, name, roll_no, email, password }) {
  if (USE_MOCKS) {
    return await mockApi.register({ role, name, roll_no, email, password });
  }
  const response = await apiClient.post('/auth/register', { role, name, roll_no, email, password });
  return response.data;
}

export async function getMe() {
  if (USE_MOCKS) {
    return await mockApi.getMe();
  }
  const response = await apiClient.get('/me');
  return response.data;
}

export async function getDeviceStatus() {
  if (USE_MOCKS) {
    return await mockApi.getDeviceStatus();
  }
  const response = await apiClient.get('/me/device');
  return response.data;
}

export async function registerDevice(publicKeyPem) {
  if (USE_MOCKS) {
    return await mockApi.registerDevice(publicKeyPem);
  }
  const response = await apiClient.post('/devices/register', { public_key: publicKeyPem });
  return response.data;
}

export async function resetStudentDevice(studentId) {
  if (USE_MOCKS) {
    return await mockApi.resetStudentDevice(studentId);
  }
  const response = await apiClient.post(`/devices/reset/${studentId}`);
  return response.data;
}
