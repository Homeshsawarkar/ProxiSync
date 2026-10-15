// ProxiSync Proximity Simulation (PDF Section 1.2, 5.3, 9.1 & 9.2)
// Replaces real hardware BLE advertising & scanning with a realistic software simulation
// Generates multiple raw RSSI samples, discards out-of-range values, and signs requests.

export const ProximitySimulator = {
  // Simulate BLE scan for the classroom session beacon
  async scanForBeacon({ activeSession, isFar = false, timeoutMs = 20000 }) {
    // 2 to 3.5 seconds realistic scan duration
    const scanDelay = 2000 + Math.floor(Math.random() * 1500);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (!activeSession) {
          resolve({ found: false, error: 'No active classroom beacon found in range' });
          return;
        }

        // Haptic feedback when beacon is discovered
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([40, 50, 40]);
          } catch (e) {
            // ignore
          }
        }

        // Generate 6 realistic RSSI samples (PDF Section 9.2)
        // Discard impossible values above 0 or below -110
        let samples = [];
        if (isFar) {
          // Corridor / Outside room (median around -86 dBm)
          samples = [-84, -87, -85, -89, -83, -88];
        } else {
          // Inside room (median around -63 dBm, well above -75 dBm threshold)
          const base = -62;
          samples = [
            base + (Math.floor(Math.random() * 5) - 2),
            base + (Math.floor(Math.random() * 5) - 2),
            base + (Math.floor(Math.random() * 5) - 2),
            base + (Math.floor(Math.random() * 5) - 2),
            base + (Math.floor(Math.random() * 5) - 2),
            base + (Math.floor(Math.random() * 5) - 2)
          ];
        }

        resolve({
          found: true,
          sessionId: activeSession.id,
          token: activeSession.currentToken || 'a3f9c1d27b44',
          courseName: activeSession.courseName,
          courseCode: activeSession.courseCode,
          roomName: activeSession.roomName,
          samples
        });
      }, scanDelay);

      // 20s scan timeout
      setTimeout(() => {
        clearTimeout(timer);
        resolve({ found: false, timeout: true });
      }, timeoutMs);
    });
  },

  // Simulate device-bound private key signing (PDF Section 6.2 & 1.2)
  // String to sign: "<session_id>|<token>|<ts>"
  signAttendancePayload(sessionId, token, timestampInSeconds, isBadDevice = false) {
    const stringToSign = `${sessionId}|${token}|${timestampInSeconds}`;
    if (isBadDevice) {
      return 'INVALID_SIGNATURE_KEY_MISMATCH';
    }
    // Simulated base64 ECDSA signature string
    try {
      return `MEQCIE_${btoa(stringToSign).replace(/=/g, '')}_SIG`;
    } catch (e) {
      return `MEQCIE_${Date.now()}_SIG`;
    }
  }
};
