// PDF Section 8.4 Error reason codes and friendly user messages
export const REASON_CODES = {
  SESSION_INACTIVE: 'SESSION_INACTIVE',
  NOT_ENROLLED: 'NOT_ENROLLED',
  STALE_REQUEST: 'STALE_REQUEST',
  NO_DEVICE_BOUND: 'NO_DEVICE_BOUND',
  BAD_SIGNATURE: 'BAD_SIGNATURE',
  TOKEN_EXPIRED_OR_INVALID: 'TOKEN_EXPIRED_OR_INVALID',
  TOO_FAR: 'TOO_FAR',
  ALREADY_MARKED: 'ALREADY_MARKED',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

export const REASON_MESSAGES = {
  [REASON_CODES.SESSION_INACTIVE]: {
    message: 'This attendance session is closed.',
    retry: false,
    severity: 'error'
  },
  [REASON_CODES.NOT_ENROLLED]: {
    message: 'You are not enrolled in this course. Contact your teacher.',
    retry: false,
    severity: 'error'
  },
  [REASON_CODES.STALE_REQUEST]: {
    message: "Your phone's clock looks wrong. Set the time to automatic and try again.",
    retry: true,
    severity: 'warning'
  },
  [REASON_CODES.NO_DEVICE_BOUND]: {
    message: 'No device is registered. Open Device Setup.',
    retry: false,
    action: 'setup_device',
    severity: 'error'
  },
  [REASON_CODES.BAD_SIGNATURE]: {
    message: 'This phone is not the one registered for your account.',
    retry: false,
    severity: 'error'
  },
  [REASON_CODES.TOKEN_EXPIRED_OR_INVALID]: {
    message: 'The code expired. Trying again...',
    retry: true,
    autoRetry: true,
    severity: 'warning'
  },
  [REASON_CODES.TOO_FAR]: {
    message: 'You seem too far from the classroom. Move closer and try again.',
    retry: true,
    severity: 'warning'
  },
  [REASON_CODES.ALREADY_MARKED]: {
    message: 'Your attendance is already marked for this session.',
    retry: false,
    isSuccessDisplay: true,
    severity: 'info'
  },
  [REASON_CODES.NETWORK_ERROR]: {
    message: 'Cannot reach the server. Check your connection and try again.',
    retry: true,
    severity: 'error'
  }
};

export function getErrorMessage(reasonCode) {
  return REASON_MESSAGES[reasonCode] || {
    message: 'Verification failed. Please contact your instructor.',
    retry: true,
    severity: 'error'
  };
}
