import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockApi } from '../../services/mock';
import { SignalRings } from '../../components/common/SignalRings';
import { ArrowLeft } from 'lucide-react';

export function RegisterScreen() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Please enter your full name.');
    if (role === 'student' && !rollNo.trim()) return setError('Roll number is required for students.');
    if (!email || !email.includes('@')) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await mockApi.register({
        role,
        name: name.trim(),
        roll_no: role === 'student' ? rollNo.trim().toUpperCase() : null,
        email: email.trim(),
        password
      });
      navigate('/auth/login', { state: { registered: true } });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/auth/login')}
          className="icon-btn"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '8px' }}>Back to Login</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <SignalRings size={44} />
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>
          Create Account
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          Join ProxiSync attendance network
        </p>
      </div>

      {/* Role Picker */}
      <div className="role-selector-pill" style={{ display: 'flex', gap: '4px', background: 'var(--color-surface-subtle)', padding: '4px', borderRadius: '12px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`role-btn ${role === 'student' ? 'active' : ''}`}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            background: role === 'student' ? 'var(--color-surface)' : 'transparent',
            color: 'var(--color-text-primary)'
          }}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setRole('teacher')}
          className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            background: role === 'teacher' ? 'var(--color-surface)' : 'transparent',
            color: 'var(--color-text-primary)'
          }}
        >
          Teacher
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aarav Patel"
            className="text-input"
          />
        </div>

        {role === 'student' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Roll Number
            </label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g. 22AIML042"
              className="text-input"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            College Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. student@college.edu"
            className="text-input"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Password (Min 8 chars)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="text-input"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="text-input"
          />
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="primary-btn"
          disabled={loading}
          style={{ marginTop: '8px' }}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
