import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDemoControlsStore } from '../../stores/demoControlsStore';
import { Smartphone, Moon, Sun, Shield, RotateCcw, Info, Sliders } from 'lucide-react';

export function StudentSettingsScreen() {
  const { user, theme, toggleTheme, resetDevice } = useAuthStore();
  const { openModal } = useDemoControlsStore();

  const handleResetDevice = async () => {
    if (window.confirm('Revoke current device binding? You will be prompted to re-register on next login.')) {
      await resetDevice();
      alert('Device key revoked. You can now test the Device Setup screen again.');
    }
  };

  return (
    <div className="settings-screen">
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          Preferences & Security
        </span>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.8rem', fontWeight: 700, margin: '2px 0 0', letterSpacing: '-0.03em' }}>
          Settings
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Device Information Card */}
        <div className="settings-group-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Smartphone size={20} color="var(--color-accent-text)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Bound Hardware Device</div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--color-text-secondary)' }}>
                KEY_ID: SHA256:{user?.id ? `E3B0...${user.id}A8` : 'UNBOUND'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
            Only this device's private keystore signature is accepted by the server. To simulate a phone replacement or reset:
          </div>

          <button
            onClick={handleResetDevice}
            className="secondary-btn"
            style={{ width: '100%', padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} />
            <span>Simulate Device Revocation / Re-register</span>
          </button>
        </div>

        {/* Display Theme */}
        <div className="settings-group-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Appearance</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              {theme === 'light' ? 'Warm Off-White (Default)' : 'Near-Black Dark Mode'}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="icon-btn"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '8px'
            }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        {/* Reviewer Demo Panel Trigger */}
        <div className="settings-group-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--color-accent-text)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Evaluation Controls</span>
            </div>
            <button
              onClick={openModal}
              className="primary-btn"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              Open Shield
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Force any of the 7 rejection states (Distance, Expired Token, Stale Clock, etc.)
          </div>
        </div>

        {/* System Simulation Footnote */}
        <div style={{ background: 'var(--color-surface-subtle)', borderRadius: '12px', padding: '14px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Info size={16} color="var(--color-text-secondary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Architecture Notice
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, margin: 0 }}>
            ProxiSync uses <strong>Simulated Proximity</strong> for browser-based demonstration. In production Android deployment (PDF Section 9), this is backed by Android BLE Peripheral / Scanner APIs and Android Keystore Hardware Security Modules.
          </p>
        </div>
      </div>
    </div>
  );
}
