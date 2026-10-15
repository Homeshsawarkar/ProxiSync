import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { SignalRings } from '../../components/common/SignalRings';
import { Eye, EyeOff, LogIn, UserCheck, Shield } from 'lucide-react';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, quickLoginAs, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setFormError('Password cannot be empty.');
      return;
    }

    try {
      const user = await login(email, password);
      routeUser(user);
    } catch (err) {
      setFormError(err.message || 'Wrong email or password');
    }
  };

  const handleQuickLogin = async (role, id) => {
    setFormError(null);
    try {
      const user = await quickLoginAs(role, id);
      routeUser(user);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const routeUser = (user) => {
    const isDeviceRegistered = useAuthStore.getState().isDeviceRegistered;
    if (user.role === 'teacher') {
      navigate('/teacher/home');
    } else {
      if (!isDeviceRegistered) {
        navigate('/student/setup');
      } else {
        navigate('/student/home');
      }
    }
  };

  return (
    <div className="auth-screen">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <SignalRings size={54} />
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '12px 0 4px', letterSpacing: '-0.02em' }}>
          ProxiSync
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          Sign in or select a demo account
        </p>
      </div>

      {/* Demo Account Quick Picker (PDF & Reviewer Centrepiece) */}
      <div className="demo-picker-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Shield size={14} color="var(--color-accent-text)" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Instant Demo Account Picker
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleQuickLogin('teacher')}
            className="demo-btn teacher-accent"
          >
            <div style={{ fontWeight: 700 }}>Dr. Sharma</div>
            <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>Teacher Account</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('student', 2)}
            className="demo-btn"
          >
            <div style={{ fontWeight: 700 }}>Aarav Patel</div>
            <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>Student (Ready)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('student', 3)}
            className="demo-btn"
          >
            <div style={{ fontWeight: 700 }}>Neha Rao</div>
            <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>Student (Ready)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('student', 4)}
            className="demo-btn"
            title="Rohan has no device bound yet - tests first-run setup!"
          >
            <div style={{ fontWeight: 700 }}>Rohan D.</div>
            <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>New Phone Setup</div>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Or with credentials
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      </div>

      <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            College Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. aarav@college.edu"
            className="text-input"
            disabled={isLoading}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="text-input"
              disabled={isLoading}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {(formError || error) && (
          <div className="error-banner">
            {formError || error}
          </div>
        )}

        <button
          type="submit"
          className="primary-btn"
          disabled={isLoading}
          style={{ marginTop: '8px' }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link to="/auth/register" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          New here? <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, textDecoration: 'underline' }}>Register</span>
        </Link>
      </div>
    </div>
  );
}
