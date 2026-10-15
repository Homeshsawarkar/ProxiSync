// Concentric Rings Motif Component (Brand Identity)
import React from 'react';

export function SignalRings({
  size = 120,
  variant = 'idle', // 'idle' | 'scanning' | 'locked' | 'success' | 'failure'
  className = '',
  accentColor = 'var(--color-accent, #C6FF3D)'
}) {
  const isScanning = variant === 'scanning';
  const isSuccess = variant === 'success';
  const isFailure = variant === 'failure';

  const strokeColor = isSuccess
    ? '#30A46C'
    : isFailure
    ? 'var(--color-danger, #E5484D)'
    : 'var(--color-text-primary, #0B0B0C)';

  return (
    <div
      className={`signal-rings-container ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        style={{ overflow: 'visible' }}
      >
        {/* Ring 1 (Outer) */}
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke={strokeColor}
          strokeWidth="3"
          strokeOpacity={isScanning ? '0.25' : '0.15'}
          className={isScanning ? 'ring-pulse-3' : ''}
        />
        {/* Ring 2 (Middle) */}
        <circle
          cx="50"
          cy="50"
          r="32"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeOpacity={isScanning ? '0.5' : '0.4'}
          className={isScanning ? 'ring-pulse-2' : ''}
        />
        {/* Ring 3 (Inner) */}
        <circle
          cx="50"
          cy="50"
          r="18"
          stroke={strokeColor}
          strokeWidth="4"
          strokeOpacity={isScanning ? '0.85' : '0.8'}
          className={isScanning ? 'ring-pulse-1' : ''}
        />
        {/* Center dot */}
        <circle
          cx="50"
          cy="50"
          r="7"
          fill={isSuccess ? '#30A46C' : isFailure ? '#E5484D' : accentColor}
        />
      </svg>
    </div>
  );
}
