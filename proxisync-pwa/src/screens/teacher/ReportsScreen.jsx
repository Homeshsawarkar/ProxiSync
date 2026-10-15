import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { mockApi } from '../../services/mock';
import { Download, RefreshCw, FileText, AlertTriangle } from 'lucide-react';

export function ReportsScreen() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(location.state?.courseId || 101);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      if (!user) return;
      const c = await mockApi.getCourses(user.id, 'teacher');
      setCourses(c);
      if (location.state?.courseId) {
        setSelectedCourseId(location.state.courseId);
      } else if (c.length > 0) {
        setSelectedCourseId(c[0].id);
      }
    }
    loadCourses();
  }, [user]);

  const fetchReport = async (courseId) => {
    setLoading(true);
    try {
      const data = await mockApi.getCourseReport(courseId);
      setReportData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchReport(selectedCourseId);
    }
  }, [selectedCourseId]);

  // Client-side CSV Download trigger
  const handleDownloadCSV = () => {
    if (!reportData || !reportData.csvText) return;

    const blob = new Blob([reportData.csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportData.courseCode}_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Audit & Compliance
          </span>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.8rem', fontWeight: 700, margin: '2px 0 0', letterSpacing: '-0.03em' }}>
            Attendance Reports
          </h1>
        </div>
        <button onClick={() => fetchReport(selectedCourseId)} className="icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Course Selector Dropdown */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
          Select Course Matrix
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

      {/* Download Action Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-subtle)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>RFC 4180 Format</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
            Export compliant spreadsheet for college ERP
          </div>
        </div>
        <button
          onClick={handleDownloadCSV}
          disabled={!reportData || loading}
          className="primary-btn"
          style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Download size={15} />
          <span>Download CSV</span>
        </button>
      </div>

      {/* Attendance Matrix Table */}
      <div>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: '10px' }}>
          Roster Breakdown
        </div>

        {reportData && reportData.rows ? (
          <div className="reports-table-container">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>ROLL NO</th>
                  <th>STUDENT</th>
                  <th style={{ textAlign: 'right' }}>ATTENDED</th>
                  <th style={{ textAlign: 'right' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {reportData.rows.map((row, idx) => {
                  const isDefaulter = row.percent < 75;
                  return (
                    <tr key={idx} className={isDefaulter ? 'defaulter-row' : ''}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}>
                        {row.roll_no}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {row.name}
                        {isDefaulter && (
                          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                            Defaulter (&lt;75%)
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>
                        {row.attended}/{row.total}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: 'JetBrains Mono',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isDefaulter ? 'var(--color-danger)' : 'var(--color-text-primary)'
                        }}
                      >
                        {row.percent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading roster data...
          </div>
        )}
      </div>
    </div>
  );
}
