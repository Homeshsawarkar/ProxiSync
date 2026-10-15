// ProxiSync BLE Scanner Abstraction
// Supports mock/demo mode and native hardware abstraction
// Matches Section 9.2, 9.4

import { PROXISYNC_SERVICE_UUID } from './payload';

class BleScannerService {
  constructor() {
    this.isScanning = false;
    this.timer = null;
    this.sampleTimer = null;
    this.samples = [];
  }

  // Simulate or perform scanning
  startScan({
    onStatusChange,
    onFound,
    onSampleCollected,
    onError,
    onTimeout,
    simulatedSession,
    simulateError,
  }) {
    if (this.isScanning) {
      this.stopScan();
    }

    this.isScanning = true;
    this.samples = [];

    onStatusChange?.('checking');

    // Simulate permission & Bluetooth check (300ms)
    setTimeout(() => {
      if (!this.isScanning) return;

      if (simulateError === 'BLUETOOTH_OFF') {
        this.isScanning = false;
        onError?.('BLUETOOTH_OFF');
        return;
      }
      if (simulateError === 'PERMISSIONS_DENIED') {
        this.isScanning = false;
        onError?.('PERMISSIONS_DENIED');
        return;
      }

      onStatusChange?.('scanning');

      // 20-second timeout watchdog (PDF Section 8.2)
      this.timer = setTimeout(() => {
        if (this.isScanning) {
          this.stopScan();
          onTimeout?.('Class not found. Move closer to the teacher and try again');
        }
      }, 20000);

      // In mock/simulated environment, find beacon after 2 seconds
      setTimeout(() => {
        if (!this.isScanning) return;

        const session = simulatedSession || {
          sessionId: 101,
          token: 'a3f9c1d27b44',
          subjectName: 'Machine Learning (CS301)',
          roomName: 'LH-101',
          teacherName: 'Dr. Arvind Sharma',
        };

        onStatusChange?.('found');
        onFound?.(session);

        // Collect at least 3-5 RSSI samples over ~2-3 seconds (Section 9.2)
        let sampleIndex = 0;
        const baseRssi = simulateError === 'TOO_FAR' ? -88 : -62;

        this.sampleTimer = setInterval(() => {
          if (!this.isScanning) {
            clearInterval(this.sampleTimer);
            return;
          }

          // Realistic RSSI variance (+/- 3 dB)
          const jitter = Math.floor(Math.random() * 7) - 3;
          const reading = baseRssi + jitter;

          // Discard impossible values (> 0 or < -110)
          if (reading <= 0 && reading >= -110) {
            this.samples.push(reading);
            onSampleCollected?.([...this.samples], reading);
          }

          sampleIndex++;

          if (this.samples.length >= 4) {
            clearInterval(this.sampleTimer);
            clearTimeout(this.timer);
            this.isScanning = false;
            onStatusChange?.('complete');
          }
        }, 500);
      }, 1800);
    }, 400);
  }

  stopScan() {
    this.isScanning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.sampleTimer) {
      clearInterval(this.sampleTimer);
      this.sampleTimer = null;
    }
  }

  getSamples() {
    return [...this.samples];
  }
}

export const bleScanner = new BleScannerService();
