import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useDemoControlsStore } from '../../stores/demoControlsStore';
import { ProximitySimulator } from '../../services/proximity';
import { mockApi } from '../../services/mock';
import { syncChannel, SYNC_EVENTS } from '../../services/channel';
import { getErrorMessage, REASON_CODES } from '../../utils/errors';
import { SignalRings } from '../../components/common/SignalRings';
import { CheckCircle2, AlertOctagon, RotateCw, ArrowLeft, Shield } from 'lucide-react';

export function MarkAttendanceScreen() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeSession } = useSessionStore();
  const demoOverrides = useDemoControlsStore();

  // Screen States: 'idle' | 'scanning' | 'found' | 'submitting' | 'success' | 'failure'
  const [state, setState] = useState('idle');
  const [rssiSamples, setRssiSamples] = useState([]);
  const [markedResult, setMarkedResult] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [hasAutoRetried, setHasAutoRetried] = useState(false);

  const isSubmittingRef = useRef(false);

  // Auto-start scanning if opened directly with active broadcast
  useEffect(() => {
    if (activeSession && state === 'idle') {
      startScanFlow();
    }
  }, [activeSession]);

  const startScanFlow = async (isRetry = false) => {
    if (isSubmittingRef.current) return;
    setErrorDetails(null);
    setState('scanning');

    try {
      // Step 1: Scan for simulated beacon (2-3.5 seconds)
      const scanResult = await ProximitySimulator.scanForBeacon({
        activeSession,
        isFar: demoOverrides.forceTooFar,
        timeoutMs: 15000
      });

      if (!scanResult.found) {
        setState('failure');
        setErrorDetails(getErrorMessage(REASON_CODES.SESSION_INACTIVE));
        return;
      }

      // Step 2: Beacon Found & Locked
      setState('found');
      setRssiSamples(scanResult.samples);

      // Step 3: Verifying samples and submitting with digital signature
      setTimeout(async () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setState('submitting');

        const nowSeconds = Math.floor(Date.now() / 1000);
        // Force stale timestamp if demo toggle is enabled (+45s)
        const ts = demoOverrides.forceStaleRequest ? nowSeconds - 45 : nowSeconds;

        // Sign request
        const signature = ProximitySimulator.signAttendancePayload(
          scanResult.sessionId,
          scanResult.token,
          ts,
          demoOverrides.forceBadSignature
        );

        try {
          const res = await mockApi.submitAttendance({
            sessionId: scanResult.sessionId,
            token: scanResult.token,
            ts,
            rssi_samples: scanResult.samples,
            signature,
            studentId: user?.id || 2,
            demoOverrides
          });

          isSubmittingRef.current = false;

          if (res.ok) {
            setState('success');
            setMarkedResult(res.data);
            // Broadcast attendance to Teacher window immediately!
            syncChannel.broadcast(SYNC_EVENTS.ATTENDANCE_MARKED, {
              sessionId: scanResult.sessionId,
              student_id: user?.id || 2,
              name: user?.name || res.data.name,
              roll_no: user?.roll_no || res.data.roll_no,
              status: 'present',
              rssi_median: res.data.rssi_median,
              marked_at: res.data.marked_at
            });
          } else {
            // Handle error or special ALREADY_MARKED case
            if (res.reason === REASON_CODES.ALREADY_MARKED) {
              setState('success');
              setMarkedResult({
                name: user?.name,
                roll_no: user?.roll_no,
                marked_at: 'Already Recorded',
                note: 'Your attendance is already marked for this session.'
              });
              return;
            }

            // Section 8.4: Auto-retry once on TOKEN_EXPIRED_OR_INVALID
            if (res.reason === REASON_CODES.TOKEN_EXPIRED_OR_INVALID && !hasAutoRetried) {
              setHasAutoRetried(true);
              setState('scanning');
              setTimeout(() => {
                startScanFlow(true);
              }, 600);
              return;
            }

            setState('failure');
            setErrorDetails(getErrorMessage(res.reason));
          }
        } catch (networkErr) {
          isSubmittingRef.current = false;
          setState('failure');
          setErrorDetails(getErrorMessage(REASON_CODES.NETWORK_ERROR));
        }
      }, 1400);

    } catch (err) {
      isSubmittingRef.current = false;
      setState('failure');
      setErrorDetails(getErrorMessage(REASON_CODES.SESSION_INACTIVE));
    }
  };

  return (
    <div className="mark-attendance-screen">
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/student/home')}
          className="icon-btn"
          disabled={state === 'submitting'}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={activeSession ? 'status-indicator-green' : 'status-indicator-grey'} />
          <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--color-text-secondary)' }}>
            {activeSession ? `${activeSession.roomName}` : 'NO SIGNAL'}
          </span>
        </div>
      </div>

      {/* Main Rings Animation Stage */}
      <div className="animation-stage" style={{ textAlign: 'center', margin: '30px 0 20px' }}>
        <SignalRings
          size={160}
          variant={state === 'success' ? 'success' : state === 'failure' ? 'failure' : state === 'scanning' ? 'scanning' : 'idle'}
        />

        <div style={{ marginTop: '28px' }}>
          {state === 'idle' && (
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                Ready to Scan
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Ensure you are inside the classroom
              </p>
            </div>
          )}

          {state === 'scanning' && (
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                Looking for your class...
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Scanning rotating BLE beacon
              </p>
            </div>
          )}

          {state === 'found' && (
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Beacon Found
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Verifying you are in the room...
              </p>
            </div>
          )}

          {state === 'submitting' && (
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                Marking attendance...
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Signing ECDSA token payload
              </p>
            </div>
          )}

          {state === 'success' && (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#30A46C', fontWeight: 700, fontSize: '1.4rem', fontFamily: 'Space Grotesk' }}>
                <CheckCircle2 size={24} />
                <span>Attendance Marked</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                {activeSession?.courseName || 'Class Session'}
              </p>
            </div>
          )}

          {state === 'failure' && (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontWeight: 700, fontSize: '1.3rem', fontFamily: 'Space Grotesk' }}>
                <AlertOctagon size={24} />
                <span>Verification Failed</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', marginTop: '8px', lineHeight: 1.4, padding: '0 12px' }}>
                {errorDetails?.message || 'Could not verify attendance.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry in Collapsible Details (Keep technical jargon in collapsed details per spec) */}
      {rssiSamples.length > 0 && (
        <details className="telemetry-details">
          <summary>Signal Telemetry & Cryptography</summary>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono' }}>
              <span className="label-tracked">RSSI Samples</span>
              <span>[{rssiSamples.join(', ')}] dBm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="label-tracked">Median RSSI</span>
              <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                {[...rssiSamples].sort((a,b)=>a-b)[Math.floor(rssiSamples.length/2)]} dBm
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="label-tracked">Threshold</span>
              <span style={{ fontFamily: 'JetBrains Mono' }}>-75 dBm (Calibrated)</span>
            </div>
          </div>
        </details>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        {state === 'idle' && (
          <button
            onClick={() => startScanFlow(false)}
            className="primary-btn"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
          >
            Start Scan
          </button>
        )}

        {state === 'success' && (
          <button
            onClick={() => navigate('/student/home')}
            className="primary-btn"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
          >
            Done
          </button>
        )}

        {state === 'failure' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {errorDetails?.retry !== false && (
              <button
                onClick={() => startScanFlow(true)}
                className="primary-btn"
                style={{ flex: 1, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <RotateCw size={16} />
                <span>Try Again</span>
              </button>
            )}
            <button
              onClick={() => navigate('/student/home')}
              className="secondary-btn"
              style={{ flex: 1, padding: '14px' }}
            >
              Back
            </button>
          </div>
        )}

        {/* Small Footnote */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.68rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Simulated Proximity Prototype · 20s Rotating Token
        </div>
      </div>
    </div>
  );
}
