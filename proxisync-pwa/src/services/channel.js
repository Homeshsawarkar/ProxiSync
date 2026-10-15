// ProxiSync Two-Window Live Demo Sync Layer
// Uses BroadcastChannel API with window.localStorage event fallback
// Ensures Teacher window and Student window stay synchronized in real-time

const CHANNEL_NAME = 'proxisync_live_channel';

class SyncChannel {
  constructor() {
    this.listeners = new Set();
    this.channel = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel failed to initialize, falling back to localStorage sync', e);
      }
    }

    // Fallback: window storage event
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'proxisync_channel_event' && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            this.notifyListeners(data);
          } catch (err) {
            // ignore
          }
        }
      });
    }
  }

  notifyListeners(data) {
    if (!data || !data.type) return;
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error('Error in sync listener', err);
      }
    });
  }

  // Subscribe to events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Broadcast an event to all other tabs/windows
  broadcast(type, payload = {}) {
    const eventData = {
      type,
      payload,
      timestamp: Date.now(),
      senderTabId: this.getTabId()
    };

    if (this.channel) {
      try {
        this.channel.postMessage(eventData);
      } catch (e) {
        console.error('BroadcastChannel post error', e);
      }
    }

    // Always update localStorage to trigger storage events on other windows
    try {
      localStorage.setItem('proxisync_channel_event', JSON.stringify(eventData));
    } catch (e) {
      // ignore
    }
  }

  getTabId() {
    if (!this.tabId) {
      this.tabId = `tab_${Math.random().toString(36).substring(2, 9)}`;
    }
    return this.tabId;
  }
}

export const syncChannel = new SyncChannel();

// Event types constants
export const SYNC_EVENTS = {
  SESSION_STARTED: 'SESSION_STARTED',
  SESSION_CLOSED: 'SESSION_CLOSED',
  ATTENDANCE_MARKED: 'ATTENDANCE_MARKED',
  TOKEN_ROTATED: 'TOKEN_ROTATED',
  DEVICE_RESET: 'DEVICE_RESET'
};
