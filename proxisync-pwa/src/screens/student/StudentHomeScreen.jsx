import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { mockApi } from '../../services/mock';
import { calculateAttendanceStats } from '../../utils/attendanceMath';
import { SignalRings } from '../../components/common/SignalRings';
import { Flame, Radio, Clock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export function StudentHomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeSession } = useSessionStore();
  const [coursesAttendance, setCoursesAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract first name only
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await mockApi.getStudentAttendance(user.id);
      setCoursesAttendance(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Today's schedule timeline (mocked schedule)
  const todaySchedule = [
    { time: '09:30', code: 'CS301', room: 'LH-101', status: 'completed' },
    { time: '11:15', code: 'CS302', room: 'AI Lab 3', status: activeSession ? 'active' : 'upcoming' },
    { time: '14:00', code: 'CS303', room: 'Seminar Hall B', status: 'upcoming' }
  ];

  return (
    <div className="student-home-screen">
      {/* Greeting and Streak Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Welcome back
          </span>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.9rem', fontWeight: 700, margin: '2px 0 0', letterSpacing: '-0.03em' }}>
            {firstName}
          </h1>
        </div>

        {/* Custom Concentric Ring Streak Mark */}
        <div className="streak-ring-badge">
          <svg className="streak-ring-svg" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--color-accent)" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="6" stroke="var(--color-accent)" strokeWidth="2" strokeOpacity="0.6" />
            <circle cx="12" cy="12" r="2.5" fill="var(--color-accent)" />
          </svg>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.82rem' }}>
            {user?.streak || 9}d streak
          </span>
        </div>
      </div>

      {/* HERO BLOCK: Dynamic Lime when open, calm grey when idle */}
      <div className={`hero-attendance-block ${activeSession ? 'hero-open-lime' : 'hero-calm-grey'}`}>
        {activeSession ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="live-broadcast-dot" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Attendance Open Now
                </span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', fontWeight: 600 }}>
                {activeSession.roomName}
              </span>
            </div>

            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.15, marginBottom: '4px' }}>
              {activeSession.courseName}
            </div>

            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', opacity: 0.85, marginBottom: '16px' }}>
              {activeSession.courseCode} · Live BLE Beacon Active
            </div>

            <button
              onClick={() => navigate('/student/mark')}
              className="mark-action-btn pulse-action"
            >
              <SignalRings size={32} variant="scanning" accentColor="#0B0B0C" />
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>Mark Attendance</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Classroom Beacon
              </div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.15rem', fontWeight: 600, marginTop: '2px' }}>
                No active broadcast
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Will illuminate automatically when teacher opens session
              </div>
            </div>
            <SignalRings size={48} variant="idle" />
          </div>
        )}
      </div>

      {/* Today's Schedule Timeline */}
      <div style={{ margin: '24px 0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
            Today's Schedule
          </span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
            3 LECTURES
          </span>
        </div>

        <div className="timeline-container">
          {todaySchedule.map((slot, index) => (
            <div key={index} className={`timeline-item ${slot.status}`}>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: '0.78rem' }}>
                {slot.time}
              </span>
              <div style={{ flex: 1, marginLeft: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{slot.code}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
                  ({slot.room})
                </span>
              </div>
              <span className={`status-pill ${slot.status}`}>
                {slot.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Course Attendance List with Spare/Needed Calculations */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
            Attendance Standing
          </span>
          <button onClick={loadData} className="icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {coursesAttendance.map((item) => {
            const stats = calculateAttendanceStats(item.attended, item.total);
            return (
              <div key={item.course_id} className="subject-editorial-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--color-text-secondary)' }}>
                      {item.code}
                    </div>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.95rem' }}>
                      {item.name}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: stats.isBelowThreshold ? 'var(--color-danger)' : 'var(--color-text-primary)'
                      }}
                    >
                      {stats.percentage}%
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                      {item.attended}/{item.total} sessions
                    </div>
                  </div>
                </div>

                {/* Thin Progress line */}
                <div className="progress-track" style={{ margin: '10px 0 6px' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, stats.percentage)}%`,
                      backgroundColor: stats.isBelowThreshold ? 'var(--color-danger)' : 'var(--color-accent)'
                    }}
                  />
                </div>

                {/* One Plain Sentence (Spare / Needed) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: stats.isBelowThreshold ? 'var(--color-danger)' : 'var(--color-text-secondary)'
                    }}
                  >
                    {stats.isBelowThreshold && <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                    {stats.summaryText}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)' }}>
                    75% required
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
