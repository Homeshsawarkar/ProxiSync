import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/sessionStore';
import { ManualAddModal } from './ManualAddModal';
import { SignalRings } from '../../components/common/SignalRings';
import { Radio, Users, PlusCircle, StopCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export function LiveSessionScreen() {
  const navigate = useNavigate();
  const {
    activeSession,
    liveAttendees,
    secondsUntilRotate,
    updateTokenRotation,
    closeSession,
    manualAdd,
    refreshAttendance
  } = useSessionStore();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Poll token rotation & refresh list every 3s
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      updateTokenRotation();
    }, 1000);

    const refreshInterval = setInterval(() => {
      refreshAttendance();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(refreshInterval);
    };
  }, [activeSession]);

  if (!activeSession) {
    return (
      <div className="teacher-live-screen" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <SignalRings size={72} variant="idle" />
        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', marginTop: '20px' }}>
          No Active Broadcast
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
          Start an attendance session from your course list.
        </p>
        <button
          onClick={() => navigate('/teacher/home')}
          className="primary-btn"
          style={{ padding: '12px 24px' }}
        >
          View Assigned Courses
        </button>
      </div>
    );
  }

  const handleCloseSession = async () => {
    const attendees = [...liveAttendees];
    await closeSession();
    setShowCloseModal(false);
    setSummaryData({
      courseName: activeSession.courseName,
      courseCode: activeSession.courseCode,
      roomName: activeSession.roomName,
      count: attendees.length,
      totalEnrolled: 4
    });
    setShowSummaryModal(true);
  };

  const presentStudentIds = liveAttendees.map(a => a.student_id);

  return (
    <div className="teacher-live-screen">
      {/* Live Broadcast Header */}
      <div className="live-broadcast-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-broadcast-dot" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Broadcasting Live
              </span>
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 700, margin: '4px 0 0', letterSpacing: '-0.02em' }}>
              {activeSession.courseName}
            </h1>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', opacity: 0.85, marginTop: '2px' }}>
              {activeSession.courseCode} · {activeSession.roomName}
            </div>
          </div>

          {/* Token Rotation Dial (20-second cycle) */}
          <div className="token-dial-card">
            <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.75 }}>
              ROTATING TOKEN
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '0.95rem' }}>
              {secondsUntilRotate}s
            </div>
            <div style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', opacity: 0.65 }}>
              {activeSession.currentToken}
            </div>
          </div>
        </div>

        {/* Counter: Present N of M */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', borderTop: '1px solid rgba(11,11,12,0.1)', paddingTop: '12px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.8, fontWeight: 700 }}>
              Class Attendance
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
              {liveAttendees.length} <span style={{ fontSize: '1.1rem', opacity: 0.6 }}>of 4</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="live-header-btn"
              title="Add a student manually"
            >
              <PlusCircle size={15} />
              <span>Manual Add</span>
            </button>
            <button
              onClick={() => setShowCloseModal(true)}
              className="live-header-btn danger"
              title="End session"
            >
              <StopCircle size={15} />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Attendees Stream */}
      <div style={{ margin: '20px 0 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
            Live Attendance Feed ({liveAttendees.length})
          </span>
          <span style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', color: 'var(--color-text-secondary)' }}>
            NEWEST FIRST
          </span>
        </div>

        {liveAttendees.length === 0 ? (
          <div className="empty-live-box">
            <SignalRings size={54} variant="scanning" />
            <div style={{ marginTop: '12px', fontWeight: 600, fontSize: '0.9rem' }}>
              Waiting for students to mark...
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Student phone must be inside the room to lock signal
            </div>
          </div>
        ) : (
          <div className="attendee-stream-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {liveAttendees.map((attendee) => (
              <div key={attendee.id || attendee.student_id} className="attendee-stream-row pop-in-animation">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="attendee-check-dot">
                    <CheckCircle2 size={16} color="#30A46C" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{attendee.name}</div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: 'var(--color-text-secondary)' }}>
                      {attendee.roll_no}
                      {attendee.note && <span style={{ marginLeft: '6px', color: 'var(--color-warning)' }}>• Note: {attendee.note}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', fontWeight: 600 }}>
                    {attendee.marked_at}
                  </div>
                  {attendee.status === 'manual' ? (
                    <span className="manual-badge">MANUAL</span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: 'var(--color-text-secondary)' }}>
                      {attendee.rssi_median ? `${attendee.rssi_median} dBm` : 'BLE VERIFIED'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Add Modal */}
      <ManualAddModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        courseId={activeSession.course_id}
        presentStudentIds={presentStudentIds}
        onManualAdded={manualAdd}
      />

      {/* Close Confirmation Dialog */}
      {showCloseModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.25rem', margin: '0 0 8px' }}>
              Close Attendance Session?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Broadcasting will terminate immediately. Any subsequent student scans will be rejected with <code>SESSION_INACTIVE</code>.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowCloseModal(false)}
                className="secondary-btn"
                style={{ flex: 1, padding: '12px' }}
              >
                Continue Session
              </button>
              <button
                onClick={handleCloseSession}
                className="primary-btn"
                style={{ flex: 1, padding: '12px', background: 'var(--color-danger)', color: '#FFFFFF' }}
              >
                Close Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session End Summary Modal */}
      {showSummaryModal && summaryData && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <SignalRings size={64} variant="success" />
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', margin: '16px 0 4px' }}>
              Session Concluded
            </h3>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              {summaryData.courseCode} · {summaryData.roomName}
            </div>

            <div style={{ background: 'var(--color-surface-subtle)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                Final Present Count
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '2.4rem', fontWeight: 700, margin: '4px 0' }}>
                {summaryData.count} / {summaryData.totalEnrolled}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                {Math.round((summaryData.count / summaryData.totalEnrolled) * 100)}% Attendance Rate
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  navigate('/teacher/reports', { state: { courseId: activeSession?.course_id } });
                }}
                className="primary-btn"
                style={{ width: '100%', padding: '12px' }}
              >
                View & Export Reports
              </button>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  navigate('/teacher/home');
                }}
                className="secondary-btn"
                style={{ width: '100%', padding: '12px' }}
              >
                Return to Faculty Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
