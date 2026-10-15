// Session Store for active attendance session & live updates
import { create } from 'zustand';
import { mockApi } from '../services/mock';
import { syncChannel, SYNC_EVENTS } from '../services/channel';

export const useSessionStore = create((set, get) => {
  // Setup real-time listener for cross-window events
  syncChannel.subscribe((event) => {
    const { type, payload } = event;

    if (type === SYNC_EVENTS.SESSION_STARTED) {
      set({
        activeSession: payload,
        isBroadcasting: true,
        secondsUntilRotate: 20
      });
    }

    if (type === SYNC_EVENTS.SESSION_CLOSED) {
      set({
        activeSession: null,
        isBroadcasting: false,
        liveAttendees: []
      });
    }

    if (type === SYNC_EVENTS.ATTENDANCE_MARKED) {
      // Add attendee to live list if this session matches
      const { activeSession, liveAttendees } = get();
      if (activeSession && activeSession.id === payload.sessionId) {
        // Prevent duplicate entries in local state
        const exists = liveAttendees.some(a => a.student_id === payload.student_id);
        if (!exists) {
          set({
            liveAttendees: [payload, ...liveAttendees]
          });
        }
      }
    }

    if (type === SYNC_EVENTS.TOKEN_ROTATED) {
      const { activeSession } = get();
      if (activeSession && activeSession.id === payload.sessionId) {
        set({
          activeSession: {
            ...activeSession,
            currentToken: payload.token
          },
          secondsUntilRotate: payload.expires_in || 20
        });
      }
    }
  });

  return {
    activeSession: null,
    liveAttendees: [],
    isBroadcasting: false,
    secondsUntilRotate: 20,
    isLoading: false,

    // Check for any currently active session in mock DB (resume on page load)
    initActiveSession: async () => {
      try {
        const sessions = await mockApi.getActiveSessions();
        if (sessions && sessions.length > 0) {
          const s = sessions[sessions.length - 1]; // Latest active session
          const courses = await mockApi.getCourses(s.teacher_id, 'teacher');
          const rooms = await mockApi.getRooms();
          const course = courses.find(c => c.id === s.course_id);
          const room = rooms.find(r => r.id === s.room_id);

          const tokenData = await mockApi.getSessionToken(s.id).catch(() => ({ token: 'a3f9c1d27b44', expires_in: 20 }));

          const sessionObj = {
            id: s.id,
            course_id: s.course_id,
            courseName: course?.name || 'Class',
            courseCode: course?.code || 'CS301',
            roomId: s.room_id,
            roomName: room?.name || 'LH-101',
            ends_at: s.ends_at,
            currentToken: tokenData.token,
            expires_in: tokenData.expires_in
          };

          const attendees = await mockApi.getSessionAttendance(s.id);

          set({
            activeSession: sessionObj,
            liveAttendees: attendees,
            isBroadcasting: true,
            secondsUntilRotate: tokenData.expires_in
          });
        }
      } catch (e) {
        console.error('Failed to init active session', e);
      }
    },

    // Teacher: Start a new session
    startSession: async ({ courseId, roomId, durationMinutes, teacherId }) => {
      set({ isLoading: true });
      try {
        const res = await mockApi.startSession({ courseId, roomId, durationMinutes, teacherId });
        const courses = await mockApi.getCourses(teacherId, 'teacher');
        const rooms = await mockApi.getRooms();
        const course = courses.find(c => c.id === Number(courseId));
        const room = rooms.find(r => r.id === Number(roomId));

        const tokenData = await mockApi.getSessionToken(res.id);

        const sessionPayload = {
          id: res.id,
          course_id: Number(courseId),
          courseName: course?.name || 'Class',
          courseCode: course?.code || 'CS301',
          roomId: Number(roomId),
          roomName: room?.name || 'LH-101',
          ends_at: res.ends_at,
          currentToken: tokenData.token,
          expires_in: tokenData.expires_in
        };

        set({
          activeSession: sessionPayload,
          liveAttendees: [],
          isBroadcasting: true,
          secondsUntilRotate: tokenData.expires_in,
          isLoading: false
        });

        // Broadcast to student tabs!
        syncChannel.broadcast(SYNC_EVENTS.SESSION_STARTED, sessionPayload);
        return sessionPayload;
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    // Update 20s token countdown
    updateTokenRotation: async () => {
      const { activeSession } = get();
      if (!activeSession) return;
      try {
        const tokenData = await mockApi.getSessionToken(activeSession.id);
        set({
          activeSession: {
            ...activeSession,
            currentToken: tokenData.token
          },
          secondsUntilRotate: tokenData.expires_in
        });

        syncChannel.broadcast(SYNC_EVENTS.TOKEN_ROTATED, {
          sessionId: activeSession.id,
          token: tokenData.token,
          expires_in: tokenData.expires_in
        });
      } catch (e) {
        // session ended or failed
      }
    },

    // Teacher: Close session
    closeSession: async () => {
      const { activeSession } = get();
      if (!activeSession) return;
      await mockApi.closeSession(activeSession.id);
      syncChannel.broadcast(SYNC_EVENTS.SESSION_CLOSED, { sessionId: activeSession.id });
      set({
        activeSession: null,
        isBroadcasting: false
      });
    },

    // Fetch latest live attendees
    refreshAttendance: async () => {
      const { activeSession } = get();
      if (!activeSession) return;
      const attendees = await mockApi.getSessionAttendance(activeSession.id);
      set({ liveAttendees: attendees });
    },

    // Teacher: Manual Add
    manualAdd: async (studentId, note) => {
      const { activeSession } = get();
      if (!activeSession) throw new Error('No active session');
      const res = await mockApi.manualAddAttendance({
        sessionId: activeSession.id,
        studentId,
        note
      });

      const newAttendee = {
        id: `manual_${Date.now()}`,
        student_id: Number(studentId),
        name: res.data.name,
        roll_no: res.data.roll_no,
        status: 'manual',
        marked_at: res.data.marked_at,
        note: res.data.note,
        sessionId: activeSession.id
      };

      set((state) => ({
        liveAttendees: [newAttendee, ...state.liveAttendees]
      }));

      // Broadcast manual addition
      syncChannel.broadcast(SYNC_EVENTS.ATTENDANCE_MARKED, newAttendee);
      return res;
    }
  };
});
