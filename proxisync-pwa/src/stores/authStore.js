// Auth Store with localStorage persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockApi } from '../services/mock';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isDeviceRegistered: false,
      theme: 'light', // 'light' | 'dark'
      isLoading: false,
      error: null,

      // Initialize / verify device status for active student
      checkDeviceStatus: async () => {
        const { user } = get();
        if (!user || user.role !== 'student') return;
        try {
          const status = await mockApi.getDeviceStatus(user.id);
          set({ isDeviceRegistered: status.registered });
        } catch (e) {
          console.error(e);
        }
      },

      // Authenticate via credentials
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await mockApi.login(email, password);
          let deviceRegistered = false;
          if (res.user.role === 'student') {
            const dev = await mockApi.getDeviceStatus(res.user.id);
            deviceRegistered = dev.registered;
          }
          set({
            user: res.user,
            token: res.token,
            isDeviceRegistered: deviceRegistered,
            isLoading: false,
            error: null
          });
          return res.user;
        } catch (err) {
          set({ isLoading: false, error: err.message || 'Login failed' });
          throw err;
        }
      },

      // Quick Demo Switcher (Instant login as Teacher or Student)
      quickLoginAs: async (role, id = null) => {
        set({ isLoading: true, error: null });
        try {
          const dbUsers = [
            { id: 1, role: 'teacher', email: 'sharma@college.edu', password: 'password123' },
            { id: 2, role: 'student', email: 'aarav@college.edu', password: 'password123' },
            { id: 3, role: 'student', email: 'neha@college.edu', password: 'password123' },
            { id: 4, role: 'student', email: 'rohan@college.edu', password: 'password123' },
            { id: 5, role: 'student', email: 'priya@college.edu', password: 'password123' }
          ];

          let target;
          if (role === 'teacher') {
            target = dbUsers[0];
          } else {
            target = dbUsers.find(u => u.id === (id || 2)) || dbUsers[1];
          }

          const res = await mockApi.login(target.email, target.password);
          let deviceRegistered = false;
          if (res.user.role === 'student') {
            const dev = await mockApi.getDeviceStatus(res.user.id);
            deviceRegistered = dev.registered;
          }
          set({
            user: res.user,
            token: res.token,
            isDeviceRegistered: deviceRegistered,
            isLoading: false,
            error: null
          });
          return res.user;
        } catch (err) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      // Register device keypair (Student first run)
      bindDevice: async () => {
        const { user } = get();
        if (!user) return;
        set({ isLoading: true });
        try {
          await mockApi.registerDevice(user.id);
          set({ isDeviceRegistered: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      // Reset device registration (Simulated in Settings)
      resetDevice: async () => {
        const { user } = get();
        if (!user) return;
        await mockApi.resetDevice(user.id);
        set({ isDeviceRegistered: false });
      },

      logout: () => {
        set({ user: null, token: null, isDeviceRegistered: false, error: null });
      },

      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
      }
    }),
    {
      name: 'proxisync_auth_store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isDeviceRegistered: state.isDeviceRegistered,
        theme: state.theme
      })
    }
  )
);
