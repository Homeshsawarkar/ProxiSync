import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { SignalRings } from '../../components/common/SignalRings';

export function SplashScreen() {
  const navigate = useNavigate();
  const { user, isDeviceRegistered } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/auth/login');
      } else if (user.role === 'teacher') {
        navigate('/teacher/home');
      } else {
        if (!isDeviceRegistered) {
          navigate('/student/setup');
        } else {
          navigate('/student/home');
        }
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [user, isDeviceRegistered]);

  return (
    <div className="splash-screen">
      <SignalRings size={120} variant="scanning" />
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>
          ProxiSync
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '8px', letterSpacing: '0.02em' }}>
          BLE-BASED ANTI-PROXY SYSTEM
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: '40px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
        Simulated Proximity Prototype
      </div>
    </div>
  );
}
