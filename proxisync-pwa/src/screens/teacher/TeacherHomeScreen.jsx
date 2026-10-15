import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { mockApi } from '../../services/mock';
import { Radio, ArrowRight, Play, BookOpen, RefreshCw } from 'lucide-react';

export function TeacherHomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeSession } = useSessionStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await mockApi.getCourses(user.id, 'teacher');
      setCourses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const handleStartAttendance = (courseId) => {
    navigate('/teacher/start', { state: { courseId } });
  };

  return (
    <div className="teacher-home-screen">
      {/* Top Banner if Session in Progress */}
      {activeSession && (
        <div
          onClick={() => navigate('/teacher/live')}
          className="resume-session-banner"
          style={{ cursor: 'pointer', marginBottom: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-broadcast-dot" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Broadcast In Progress
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                {activeSession.courseName} · {activeSession.roomName}
              </div>
            </div>
          </div>
          <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            Resume
          </button>
        </div>
      )}

      {/* Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Faculty Portal
          </span>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.8rem', fontWeight: 700, margin: '2px 0 0', letterSpacing: '-0.03em' }}>
            {user?.name || 'Dr. Sharma'}
          </h1>
        </div>
        <button onClick={fetchCourses} className="icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Course Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
          Assigned Courses
        </div>

        {courses.map((course) => (
          <div key={course.id} className="teacher-course-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {course.code} · {course.division}
                </span>
                <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.15rem', fontWeight: 700, margin: '4px 0 0' }}>
                  {course.name}
                </h3>
              </div>
              <div style={{ background: 'var(--color-surface-subtle)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontFamily: 'JetBrains Mono' }}>
                4 ENROLLED
              </div>
            </div>

            <button
              onClick={() => handleStartAttendance(course.id)}
              className="primary-btn"
              style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700 }}
            >
              <Radio size={16} />
              <span>Start Attendance Session</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
