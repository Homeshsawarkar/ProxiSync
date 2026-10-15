import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { SignalRings } from '../../components/common/SignalRings';
import { Smartphone, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export function DeviceSetupScreen() {
  const navigate = useNavigate();
  const { user, bindDevice, logout } = useAuthStore();
  const [step, setStep] = useState('idle'); // 'idle' | 'generating' | 'registering' | 'done' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  const handleRegisterDevice = async () => {
    setErrorMessage(null);
    setStep('generating');

    // Simulate key generation in hardware keystore
    setTimeout(async () => {
      setStep('registering');
      try {
        await bindDevice();
        setStep('done');
        setTimeout(() => {
          navigate('/student/home');
        }, 1200);
      } catch (err) {
        setStep('error');
        setErrorMessage(err.message || 'A device is already registered. Ask your teacher to reset it.');
      }
    }, 1200);
  };

  return (
    <div className="auth-screen device-setup-screen" style={{ textAlign: 'center', paddingTop: '40px' }}>
      <SignalRings size={72} variant={step === 'done' ? 'success' : step === 'error' ? 'failure' : 'scanning'} />

      <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '20px 0 8px', letterSpacing: '-0.02em' }}>
        Device Binding Setup
      </h2>

      <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
        Your account will be cryptographically locked to this device so nobody else can mark attendance for you.
      </p>

      <div className="device-spec-card" style={{ background: 'var(--color-surface-subtle)', borderRadius: '14px', padding: '16px', textAlign: 'left', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Smartphone size={20} color="var(--color-accent-text)" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--color-text-secondary)' }}>
              Roll: {user?.roll_no || '22AIML042'}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '10px', color: 'var(--color-text-secondary)' }}>
          <div><strong>Algorithm:</strong> ECDSA P-256 (SHA-256)</div>
          <div><strong>Key Storage:</strong> Simulated Secure Enclave</div>
          <div><strong>Anti-Proxy:</strong> 1 Phone = 1 Student</div>
        </div>
      </div>

      {/* Step statuses */}
      {step === 'generating' && (
        <div className="status-progress-pill">
          Generating cryptographic keypair...
        </div>
      )}

      {step === 'registering' && (
        <div className="status-progress-pill">
          Binding public key to student account...
        </div>
      )}

      {step === 'done' && (
        <div className="success-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#30A46C" />
          <span>Device bound successfully! Redirecting...</span>
        </div>
      )}

      {step === 'error' && (
        <div className="error-banner" style={{ marginBottom: '16px' }}>
          <AlertCircle size={18} style={{ marginBottom: '4px' }} />
          <div>{errorMessage}</div>
        </div>
      )}

      {step === 'idle' && (
        <button
          onClick={handleRegisterDevice}
          className="primary-btn"
          style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
        >
          Register This Device
        </button>
      )}

      {step === 'error' && (
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <button
            onClick={handleRegisterDevice}
            className="secondary-btn"
            style={{ flex: 1, padding: '12px' }}
          >
            Retry
          </button>
          <button
            onClick={logout}
            className="secondary-btn"
            style={{ flex: 1, padding: '12px', color: 'var(--color-danger)' }}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
