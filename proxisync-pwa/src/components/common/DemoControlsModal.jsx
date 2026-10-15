import React from 'react';
import { useDemoControlsStore } from '../../stores/demoControlsStore';
import { mockApi } from '../../services/mock';
import { X, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

export function DemoControlsModal() {
  const {
    isOpen,
    closeModal,
    forceTooFar,
    forceNoDevice,
    forceBadSignature,
    forceExpiredToken,
    forceStaleRequest,
    forceNotEnrolled,
    simulateNetworkError,
    setOverride,
    resetAllOverrides
  } = useDemoControlsStore();

  if (!isOpen) return null;

  const handleResetDB = async () => {
    if (window.confirm('Reset all mock database attendance and sessions to initial seed?')) {
      await mockApi.resetDatabase();
      window.location.reload();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content demo-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="var(--color-accent)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'Space Grotesk, sans-serif' }}>
              Demo Control Shield
            </h3>
          </div>
          <button onClick={closeModal} className="icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          Force any of the 7 verification shield checks (PDF Section 1.3 & 8.4) to demo instant real-time rejection states.
        </p>

        <div className="control-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Check 6: RSSI Distance */}
          <label className="toggle-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Simulated Distance: Far (-86 dBm)</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Fails Check 6: triggers <code style={{ fontFamily: 'JetBrains Mono' }}>TOO_FAR</code>
              </div>
            </div>
            <input
              type="checkbox"
              checked={forceTooFar}
              onChange={(e) => setOverride('forceTooFar', e.target.checked)}
            />
          </label>

          {/* Check 5: Expired Token */}
          <label className="toggle-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Expired / Stale Token</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Fails Check 5: <code style={{ fontFamily: 'JetBrains Mono' }}>TOKEN_EXPIRED_OR_INVALID</code>
              </div>
            </div>
            <input
              type="checkbox"
              checked={forceExpiredToken}
              onChange={(e) => setOverride('forceExpiredToken', e.target.checked)}
            />
          </label>

          {/* Check 4: Bad Signature */}
          <label className="toggle-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Wrong Device / Bad Signature</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Fails Check 4: <code style={{ fontFamily: 'JetBrains Mono' }}>BAD_SIGNATURE</code>
              </div>
            </div>
            <input
              type="checkbox"
              checked={forceBadSignature}
              onChange={(e) => setOverride('forceBadSignature', e.target.checked)}
            />
          </label>

          {/* Check 4b: No Device Bound */}
          <label className="toggle-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>No Device Registered</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Fails Check 4: <code style={{ fontFamily: 'JetBrains Mono' }}>NO_DEVICE_BOUND</code>
              </div>
            </div>
            <input
              type="checkbox"
              checked={forceNoDevice}
              onChange={(e) => setOverride('forceNoDevice', e.target.checked)}
            />
          </label>

          {/* Check 3: Stale Clock */}
          <label className="toggle-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Desynchronized Clock (+45s)</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Fails Check 3: <code style={{ fontFamily: 'JetBrains Mono' }}>STALE_REQUEST</code>
              </div>
            </div>
            <input
              type="checkbox"
              checked={forceStaleRequest}
              onChange={(e) => setOverride('forceStaleRequest', e.target.checked)}
            />
          </label>

          {/* Check 2: Not Enrolled */}
          <label className="toggle-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Unenrolled Student</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Fails Check 2: <code style={{ fontFamily: 'JetBrains Mono' }}>NOT_ENROLLED</code>
              </div>
            </div>
            <input
              type="checkbox"
              checked={forceNotEnrolled}
              onChange={(e) => setOverride('forceNotEnrolled', e.target.checked)}
            />
          </label>

          {/* Edge Case: Network Failure */}
          <label className="toggle-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Simulate Offline / Network Drop</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Simulates transport failure: <code style={{ fontFamily: 'JetBrains Mono' }}>NETWORK_ERROR</code>
              </div>
            </div>
            <input
              type="checkbox"
              checked={simulateNetworkError}
              onChange={(e) => setOverride('simulateNetworkError', e.target.checked)}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={resetAllOverrides}
            className="secondary-btn"
            style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
          >
            Clear Overrides
          </button>
          <button
            onClick={handleResetDB}
            className="secondary-btn"
            style={{ flex: 1, padding: '10px', fontSize: '0.85rem', color: 'var(--color-danger)' }}
          >
            Reset Seed Data
          </button>
        </div>
      </div>
    </div>
  );
}
