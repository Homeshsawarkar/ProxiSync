import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { mockApi } from '../../services/mock';
import { ArrowLeft, Check, Radio, ShieldCheck, Clock } from 'lucide-react';

export function StartSessionScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { startSession, isLoading } = useSessionStore();

  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(location.state?.courseId || 101);
  const [selectedRoomId, setSelectedRoomId] = useState(1);
  const [duration, setDuration] = useState(10); // 5, 10, 15 min
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      if (!user) return;
      const c = await mockApi.getCourses(user.id, 'teacher');
      const r = await mockApi.getRooms();
      setCourses(c);
      setRooms(r);
      if (location.state?.courseId) {
        setSelectedCourseId(location.state.courseId);
      } else if (c.length > 0) {
        setSelectedCourseId(c[0].id);
      }
      if (r.length > 0) {
        setSelectedRoomId(r[0].id);
      }
    }
    init();
  }, [user]);

  const handleStart = async () => {
    setError(null);
    try {
      await startSession({
        courseId: selectedCourseId,
        roomId: selectedRoomId,
        durationMinutes: duration,
        teacherId: user?.id || 1
      });
      navigate('/teacher/live');
    } catch (err) {
      setError(err.message || 'Could not start Bluetooth broadcast');
    }
  };

  return (
    <div className="start-session-screen">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/teacher/home')}
          className="icon-btn"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '8px' }}>Configure Broadcast</span>
      </div>

      <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
        Start Attendance Session
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Course Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
            Course
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(Number(e.target.value))}
            className="text-input"
            style={{ fontWeight: 600 }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name} ({c.division})
              </option>
            ))}
          </select>
        </div>

        {/* Room Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
            Classroom & RSSI Boundary
          </label>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(Number(e.target.value))}
            className="text-input"
            style={{ fontWeight: 600 }}
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (Threshold: {r.rssi_threshold} dBm)
              </option>
            ))}
          </select>
        </div>

        {/* Duration Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
            Session Duration
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[5, 10, 15].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDuration(mins)}
                className={`duration-pill-btn ${duration === mins ? 'active' : ''}`}
              >
                <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                <span>{mins} mins</span>
              </button>
            ))}
          </div>
        </div>

        {/* Readiness Checklist (PDF 8.3) */}
        <div className="checklist-card" style={{ background: 'var(--color-surface-subtle)', borderRadius: '14px', padding: '16px', marginTop: '8px' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: '10px' }}>
            Readiness Checklist
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="check-dot"><Check size={12} color="#0B0B0C" /></div>
              <span>Simulated BLE Beacon transmitter ready</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="check-dot"><Check size={12} color="#0B0B0C" /></div>
              <span>20-second rotating HMAC-SHA256 token active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="check-dot"><Check size={12} color="#0B0B0C" /></div>
              <span>Room RSSI threshold: {rooms.find(r=>r.id===selectedRoomId)?.rssi_threshold || -75} dBm</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="primary-btn"
          style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700, marginTop: '8px' }}
        >
          {isLoading ? 'Activating Broadcast...' : 'Broadcast Attendance Now'}
        </button>
      </div>
    </div>
  );
}
