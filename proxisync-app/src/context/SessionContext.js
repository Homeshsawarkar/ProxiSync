// SessionContext: Teacher active session management, live attendance feed, token rotation
// Matches PDF Build Guide Section 5.3, 8.3

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createSession, getSessionToken, closeSession, getActiveSessions } from '../api/sessions';
import { getSessionAttendance, markManualAttendance } from '../api/attendance';
import { bleAdvertiser } from '../ble/advertiser';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [currentToken, setCurrentToken] = useState('a3f9c1d27b44');
  const [tokenExpiresIn, setTokenExpiresIn] = useState(20);
  const [liveAttendance, setLiveAttendance] = useState([]);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState(600);

  const tokenTimerRef = useRef(null);
  const livePollRef = useRef(null);
  const sessionCountdownRef = useRef(null);

  // Check for active sessions on load
  const refreshActiveSessions = async () => {
    try {
      const activeList = await getActiveSessions();
      if (activeList && activeList.length > 0) {
        const current = activeList[0];
        setActiveSession(current);
        const endsAt = new Date(current.ends_at).getTime();
        const rem = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
        setSessionRemainingSeconds(rem);
      }
    } catch (e) {
      console.warn('Failed to load active sessions:', e);
    }
  };

  useEffect(() => {
    refreshActiveSessions();
  }, []);

  // Poll token every second for countdown and rotation
  useEffect(() => {
    if (!activeSession) {
      clearInterval(tokenTimerRef.current);
      clearInterval(livePollRef.current);
      clearInterval(sessionCountdownRef.current);
      return;
    }

    // 1. Token rotation and timer
    async function fetchToken() {
      try {
        const data = await getSessionToken(activeSession.id);
        setCurrentToken(data.token);
        setTokenExpiresIn(data.expires_in);
        bleAdvertiser.updateToken(data.token);
      } catch (e) {
        console.warn('Failed to fetch session token:', e);
      }
    }

    fetchToken();

    tokenTimerRef.current = setInterval(() => {
      setTokenExpiresIn(prev => {
        if (prev <= 1) {
          fetchToken();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    // 2. Poll attendance every 3 seconds (Section 5.3 & 8.3)
    async function fetchAttendance() {
      try {
        const list = await getSessionAttendance(activeSession.id);
        setLiveAttendance(list);
      } catch (e) {
        console.warn('Failed to fetch live attendance:', e);
      }
    }

    fetchAttendance();
    livePollRef.current = setInterval(fetchAttendance, 3000);

    // 3. Session remaining countdown
    sessionCountdownRef.current = setInterval(() => {
      setSessionRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(sessionCountdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(tokenTimerRef.current);
      clearInterval(livePollRef.current);
      clearInterval(sessionCountdownRef.current);
    };
  }, [activeSession]);

  const startNewSession = async (courseId, roomId, durationMinutes = 10) => {
    try {
      const session = await createSession(courseId, roomId, durationMinutes);
      setActiveSession({
        id: session.id,
        course_id: courseId,
        room_id: roomId,
        ends_at: session.ends_at,
      });
      setSessionRemainingSeconds(durationMinutes * 60);

      // Start BLE Advertiser
      bleAdvertiser.startAdvertising(session.id, currentToken, async () => {
        const tok = await getSessionToken(session.id);
        setCurrentToken(tok.token);
        bleAdvertiser.updateToken(tok.token);
      });
      setIsAdvertising(true);

      return { success: true, session };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const endSession = async () => {
    if (!activeSession) return;
    try {
      await closeSession(activeSession.id);
      bleAdvertiser.stopAdvertising();
      setIsAdvertising(false);
      const lastSession = activeSession;
      setActiveSession(null);
      return { success: true, lastSession };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const manualAdd = async (studentId, note) => {
    if (!activeSession) return { success: false, error: 'No active session' };
    try {
      await markManualAttendance(activeSession.id, studentId, note);
      const list = await getSessionAttendance(activeSession.id);
      setLiveAttendance(list);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    activeSession,
    currentToken,
    tokenExpiresIn,
    liveAttendance,
    isAdvertising,
    sessionRemainingSeconds,
    startNewSession,
    endSession,
    manualAdd,
    refreshActiveSessions,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
