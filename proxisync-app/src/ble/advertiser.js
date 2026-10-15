// ProxiSync Teacher BLE Advertiser Service
// Broadcasts rotating token every 15-20 seconds with Service UUID
// Matches PDF Build Guide Section 9.1 & 5.3

import { PROXISYNC_SERVICE_UUID, encodePayload } from './payload';

class BleAdvertiserService {
  constructor() {
    this.isAdvertising = false;
    this.sessionId = null;
    this.currentToken = null;
    this.rotateTimer = null;
  }

  startAdvertising(sessionId, initialToken, onTokenRotated) {
    this.sessionId = sessionId;
    this.currentToken = initialToken;
    this.isAdvertising = true;

    // Simulate native BLE peripheral start
    const payload = encodePayload(sessionId, initialToken);

    // Refresh advertisement every 15 seconds (Section 9.1)
    this.rotateTimer = setInterval(() => {
      if (!this.isAdvertising) return;
      onTokenRotated?.();
    }, 15000);

    return { success: true, serviceUuid: PROXISYNC_SERVICE_UUID, payload };
  }

  updateToken(newToken) {
    this.currentToken = newToken;
    if (this.sessionId && newToken) {
      encodePayload(this.sessionId, newToken);
    }
  }

  stopAdvertising() {
    this.isAdvertising = false;
    if (this.rotateTimer) {
      clearInterval(this.rotateTimer);
      this.rotateTimer = null;
    }
  }
}

export const bleAdvertiser = new BleAdvertiserService();
