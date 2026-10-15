// AuthContext: User authentication, role-based routing, device registration status
// Matches Section 7.1, 7.3, 8.1, 8.2

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe, getDeviceStatus, registerDevice } from '../api/auth';
import { exportPublicKeyPem, clearStoredDeviceKey } from '../security/deviceKey';
import { setAuthToken, registerAuthExpiredHandler } from '../api/client';
import { mockApi } from '../mocks/mockApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeviceRegistered, setIsDeviceRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize session or default to student for instant demo testing
  useEffect(() => {
    async function initAuth() {
      try {
        registerAuthExpiredHandler(() => {
          logout();
        });

        // Auto-login default student (Aarav Patel) on app startup for immediate testing
        const res = await loginUser('aarav@college.edu', 'password123');
        const me = await getMe();
        const devStatus = await getDeviceStatus();
        setUser(me);
        setIsAuthenticated(true);
        setIsDeviceRegistered(devStatus.registered);
      } catch (e) {
        console.warn('Initial auto-auth failed, staying logged out:', e);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await loginUser(email, password);
      const me = await getMe();
      let devReg = false;
      if (me.role === 'student') {
        const dev = await getDeviceStatus();
        devReg = dev.registered;
      }
      setUser(me);
      setIsDeviceRegistered(devReg);
      setIsAuthenticated(true);
      return { success: true, user: me, isDeviceRegistered: devReg };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fields) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await registerUser(fields);
      return { success: true, id: res.id };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const registerCurrentDevice = async () => {
    setIsLoading(true);
    try {
      const pem = await exportPublicKeyPem();
      await registerDevice(pem);
      setIsDeviceRegistered(true);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Device registration failed';
      return { success: false, error: msg, status: err.response?.status };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    clearStoredDeviceKey();
    setUser(null);
    setIsAuthenticated(false);
    setIsDeviceRegistered(false);
    setAuthError(null);
  };

  // Quick switch for reviewers & evaluators
  const demoSwitchRole = async (targetRole, withUnregisteredDevice = false) => {
    setIsLoading(true);
    try {
      if (targetRole === 'teacher') {
        await login('sharma@college.edu', 'password123');
      } else {
        if (withUnregisteredDevice) {
          // Switch to Neha Rao (student 3), whose device is not bound yet!
          await login('neha@college.edu', 'password123');
        } else {
          // Switch to Aarav Patel (student 2), bound device
          await login('aarav@college.edu', 'password123');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isDeviceRegistered,
    isLoading,
    authError,
    login,
    register,
    registerCurrentDevice,
    logout,
    demoSwitchRole,
    setAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
