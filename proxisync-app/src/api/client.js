// ProxiSync API Client
// Handles Base URL, Bearer JWT injection, 401 interception, and USE_MOCKS switch
// Matches PDF Build Guide Section 6 & 9.4

import axios from 'axios';
import { mockApi } from '../mocks/mockApi';

export const USE_MOCKS = true; // Toggle between mock service and live Node backend
export const BACKEND_BASE_URL = 'http://localhost:3000';

let authToken = null;
let onAuthExpiredCallback = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function registerAuthExpiredHandler(handler) {
  onAuthExpiredCallback = handler;
}

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Bearer token
apiClient.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Interceptor to handle 401 expired JWT
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      if (onAuthExpiredCallback) {
        onAuthExpiredCallback();
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
