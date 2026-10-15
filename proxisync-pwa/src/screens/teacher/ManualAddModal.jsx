import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/mock';
import { X, Search, UserCheck } from 'lucide-react';

export function ManualAddModal({ isOpen, onClose, courseId, presentStudentIds, onManualAdded }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && courseId) {
      mockApi.getCourseStudents(courseId).then(setStudents);
      setNote('');
      setSelectedStudentId(null);
      setError(null);
    }
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_no && s.roll_no.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudentId) {
      setError('Please select a student.');
      return;
    }
    if (!note.trim()) {
      setError('A justification note is required (e.g. "Phone battery died").');
      return;
    }

    setSubmitting(true);
    try {
      await onManualAdded(selectedStudentId, note.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to manually add student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 700 }}>
            Manual Attendance Add
          </h3>
          <button onClick={onClose} className="icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or roll number..."
              className="text-input"
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          </div>

          {/* Student Picker List */}
          <div className="manual-student-list" style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredStudents.map((s) => {
              const isAlreadyPresent = presentStudentIds.includes(s.id);
              const isSelected = selectedStudentId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => !isAlreadyPresent && setSelectedStudentId(s.id)}
                  className={`manual-student-item ${isSelected ? 'selected' : ''} ${isAlreadyPresent ? 'disabled' : ''}`}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    cursor: isAlreadyPresent ? 'not-allowed' : 'pointer',
                    opacity: isAlreadyPresent ? 0.45 : 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isSelected ? 'var(--color-surface-subtle)' : 'var(--color-surface)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: 'var(--color-text-secondary)' }}>
                      {s.roll_no}
                    </div>
                  </div>
                  {isAlreadyPresent ? (
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#30A46C' }}>PRESENT</span>
                  ) : isSelected ? (
                    <UserCheck size={16} color="var(--color-accent-text)" />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Mandatory Note Field (PDF 8.3) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Justification Note (Mandatory)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Phone battery drained, verified physically"
              className="text-input"
            />
          </div>

          {error && (
            <div className="error-banner" style={{ fontSize: '0.8rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="secondary-btn"
              style={{ flex: 1, padding: '12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="primary-btn"
              style={{ flex: 1, padding: '12px' }}
            >
              {submitting ? 'Recording...' : 'Mark Present'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
