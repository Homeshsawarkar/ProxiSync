// Error Reason Codes & Human-Friendly Messages
// Matches PDF Build Guide Section 8.4

export const ERROR_MESSAGES = {
  SESSION_INACTIVE: {
    title: 'Session Closed',
    message: 'This attendance session is closed.',
    retry: false,
    severity: 'warning',
  },
  NOT_ENROLLED: {
    title: 'Not Enrolled',
    message: 'You are not enrolled in this course. Contact your teacher.',
    retry: false,
    severity: 'danger',
  },
  STALE_REQUEST: {
    title: 'Clock Out of Sync',
    message: "Your phone's clock looks wrong. Set the time to automatic and try again.",
    retry: true,
    severity: 'warning',
  },
  NO_DEVICE_BOUND: {
    title: 'Device Not Registered',
    message: 'No device is registered. Open Device Setup.',
    retry: false,
    severity: 'danger',
  },
  BAD_SIGNATURE: {
    title: 'Device Mismatch',
    message: 'This phone is not the one registered for your account.',
    retry: false,
    severity: 'danger',
  },
  TOKEN_EXPIRED_OR_INVALID: {
    title: 'Token Expired',
    message: 'The code expired. Trying again...',
    retry: true,
    autoRescan: true,
    severity: 'warning',
  },
  TOO_FAR: {
    title: 'Out of Classroom Range',
    message: 'You seem too far from the classroom. Move closer and try again.',
    retry: true,
    severity: 'warning',
  },
  ALREADY_MARKED: {
    title: 'Already Marked',
    message: 'Your attendance is already marked for this session.',
    retry: false,
    isSuccessAlternative: true,
    severity: 'info',
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Cannot reach the server. Check your connection and try again.',
    retry: true,
    severity: 'danger',
  },
};

export function getErrorMessage(reasonCode) {
  if (!reasonCode) {
    return {
      title: 'Verification Failed',
      message: 'Unable to verify your attendance. Please try again.',
      retry: true,
      severity: 'danger',
    };
  }
  return ERROR_MESSAGES[reasonCode] || {
    title: 'Attendance Error',
    message: `Verification rejected: ${reasonCode}`,
    retry: true,
    severity: 'danger',
  };
}
