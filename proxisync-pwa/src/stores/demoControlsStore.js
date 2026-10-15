// Demo Controls Store: lets reviewer force any of the 7 validation states & edge cases
import { create } from 'zustand';

export const useDemoControlsStore = create((set) => ({
  isOpen: false,
  
  // Overrides matching Section 1.3 & 8.4
  forceTooFar: false,            // Check 6: RSSI below threshold (TOO_FAR)
  forceNoDevice: false,          // Check 4: No device registered (NO_DEVICE_BOUND)
  forceBadSignature: false,      // Check 4: Signature mismatch (BAD_SIGNATURE)
  forceExpiredToken: false,      // Check 5: Token expired (TOKEN_EXPIRED_OR_INVALID)
  forceStaleRequest: false,      // Check 3: Clock desynchronized >30s (STALE_REQUEST)
  forceNotEnrolled: false,       // Check 2: Not in course (NOT_ENROLLED)
  simulateNetworkError: false,   // Edge: Offline / connection drop (NETWORK_ERROR)

  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  toggleModal: () => set((state) => ({ isOpen: !state.isOpen })),

  setOverride: (key, value) => set({ [key]: value }),

  resetAllOverrides: () => set({
    forceTooFar: false,
    forceNoDevice: false,
    forceBadSignature: false,
    forceExpiredToken: false,
    forceStaleRequest: false,
    forceNotEnrolled: false,
    simulateNetworkError: false
  })
}));
