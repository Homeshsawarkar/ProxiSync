import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { mockApi } from '../../services/mock';
import { calculateAttendanceStats } from '../../utils/attendanceMath';
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function MyAttendanceScreen() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await mockApi.getStudentAttendance(user.id);
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  // Overall calculations
  const totalConducted = records.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const totalAttended = records.reduce((acc, curr) => acc + (Number(curr.attended) || 0), 0);
  const overallPercentage = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 0;
  const isOverallDefaulter = overallPercentage < 75;

  return (
    <div className="my-attendance-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Audit Log
          </span>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.8rem', fontWeight: 700, margin: '2px 0 0', letterSpacing: '-0.03em' }}>
            My Attendance
          </h1>
        </div>
        <button onClick={fetchRecords} className="icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Overall Score Card */}
      <div className={`overall-score-card ${isOverallDefaulter ? 'defaulter-border' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Overall Cumulative
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '2.4rem', fontWeight: 700, margin: '4px 0', color: isOverallDefaulter ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
              {overallPercentage}%
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {totalAttended} / {totalConducted} total classes
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {isOverallDefaulter ? (
              <div className="defaulter-badge">
                <AlertTriangle size={14} />
                <span>Below 75% Limit</span>
              </div>
            ) : (
              <div className="good-standing-badge">
                <CheckCircle2 size={14} />
                <span>Good Standing</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject List */}
      <div style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: '12px' }}>
          Course Breakdown
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {records.map((item) => {
            const stats = calculateAttendanceStats(item.attended, item.total);
            return (
              <div key={item.course_id} className="subject-detail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {item.code}
                    </span>
                    <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600, margin: '2px 0 0' }}>
                      {item.name}
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '1.3rem', fontWeight: 700, color: stats.isBelowThreshold ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                      {stats.percentage}%
                    </span>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                      {item.attended} of {item.total}
                    </div>
                  </div>
                </div>

                <div className="progress-track" style={{ margin: '12px 0 8px' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, stats.percentage)}%`,
                      backgroundColor: stats.isBelowThreshold ? 'var(--color-danger)' : 'var(--color-accent)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: stats.isBelowThreshold ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                    {stats.summaryText}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', color: 'var(--color-text-secondary)' }}>
                    Min: 75%
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
