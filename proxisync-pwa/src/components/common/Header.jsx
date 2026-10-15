import React, { useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDemoControlsStore } from '../../stores/demoControlsStore';
import { Moon, Sun, LogOut, Sliders } from 'lucide-react';
import { SignalRings } from './SignalRings';

export function Header() {
  const { user, logout, theme, toggleTheme } = useAuthStore();
  const { openModal } = useDemoControlsStore();
  const timerRef = useRef(null);

  // Long-press detection on logo to open Demo Controls panel
  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      openModal();
    }, 700);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <header className="app-header">
      <div
        className="brand-group"
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        title="Long press or click to open Demo Controls"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <SignalRings size={28} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
            ProxiSync
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Signal V1
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Hidden Panel Fast Button for convenience */}
        <button
          onClick={openModal}
          className="icon-btn"
          title="Demo Controls (Forces distance, expired token, etc.)"
          style={{
            background: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '6px',
            color: 'var(--color-text-secondary)'
          }}
        >
          <Sliders size={16} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="icon-btn"
          title="Toggle Theme"
          style={{
            background: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '6px',
            color: 'var(--color-text-secondary)'
          }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Logout */}
        {user && (
          <button
            onClick={logout}
            className="icon-btn"
            title="Log out"
            style={{
              background: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '6px',
              color: 'var(--color-danger)'
            }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
