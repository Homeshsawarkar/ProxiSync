// ProxiSync BLE Advertisement Payload Encoder / Decoder
// Matches PDF Build Guide Section 9.1

export const PROXISYNC_SERVICE_UUID = '0000FD68-0000-1000-8000-00805F9B34FB';

/**
 * Encodes session_id and 12-char hex token into 10 raw bytes
 * Bytes 0-3: unsigned 32-bit int, big-endian
 * Bytes 4-9: 6 raw bytes for 12 hex characters
 */
export function encodePayload(sessionId, tokenHex) {
  const buffer = new Uint8Array(10);
  const view = new DataView(buffer.buffer);
  
  view.setUint32(0, Number(sessionId), false); // big-endian

  const cleanHex = (tokenHex || '').padEnd(12, '0').slice(0, 12);
  for (let i = 0; i < 6; i++) {
    const byteHex = cleanHex.substring(i * 2, i * 2 + 2);
    buffer[4 + i] = parseInt(byteHex, 16);
  }

  return buffer;
}

/**
 * Decodes 10 raw bytes into { sessionId, token }
 */
export function decodePayload(buffer) {
  if (!buffer || buffer.length < 10) {
    throw new Error('Invalid BLE payload length');
  }

  const bytes = new Uint8Array(buffer);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  
  const sessionId = view.getUint32(0, false);
  
  let tokenHex = '';
  for (let i = 0; i < 6; i++) {
    const b = bytes[4 + i];
    tokenHex += b.toString(16).padStart(2, '0');
  }

  return {
    sessionId,
    token: tokenHex,
  };
}
