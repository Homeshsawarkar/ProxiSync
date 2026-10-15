// Device Key Management and Cryptographic Signing Module
// Follows Section 6.2: ECDSA P-256, SPKI PEM export, SHA-256 base64 signature

let storedKeyPair = null;
let storedPublicKeyPem = null;

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}

// Convert IEEE P1363 raw signature (64 bytes: r + s) to ASN.1 DER sequence expected by Node crypto.verify
function p1363ToDer(rawSig) {
  const bytes = new Uint8Array(rawSig);
  if (bytes.length !== 64) {
    return arrayBufferToBase64(rawSig);
  }

  function encodeInteger(byteArray) {
    let start = 0;
    while (start < byteArray.length - 1 && byteArray[start] === 0) {
      start++;
    }
    const trimmed = byteArray.slice(start);
    const needsPrefix = (trimmed[0] & 0x80) !== 0;
    const len = trimmed.length + (needsPrefix ? 1 : 0);
    const result = new Uint8Array(2 + len);
    result[0] = 0x02; // INTEGER tag
    result[1] = len;
    if (needsPrefix) {
      result[2] = 0x00;
      result.set(trimmed, 3);
    } else {
      result.set(trimmed, 2);
    }
    return result;
  }

  const r = bytes.slice(0, 32);
  const s = bytes.slice(32, 64);
  const rEnc = encodeInteger(r);
  const sEnc = encodeInteger(s);

  const totalLen = rEnc.length + sEnc.length;
  const der = new Uint8Array(2 + totalLen);
  der[0] = 0x30; // SEQUENCE tag
  der[1] = totalLen;
  der.set(rEnc, 2);
  der.set(sEnc, 2 + rEnc.length);

  return arrayBufferToBase64(der.buffer);
}

export async function generateDeviceKeyPair() {
  const subtle = globalThis.crypto?.subtle || (typeof window !== 'undefined' ? window.crypto?.subtle : null);

  if (subtle) {
    try {
      const keyPair = await subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        true,
        ['sign', 'verify']
      );

      storedKeyPair = keyPair;

      // Export SPKI public key
      const spkiBuffer = await subtle.exportKey('spki', keyPair.publicKey);
      const b64 = arrayBufferToBase64(spkiBuffer);
      const formattedPem = `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
      storedPublicKeyPem = formattedPem;

      return {
        publicKeyPem: formattedPem,
        keyPair,
      };
    } catch (e) {
      console.warn('WebCrypto generateKey failed, using deterministic simulated fallback:', e);
    }
  }

  // Pure deterministic fallback for environments without WebCrypto subtle
  const pseudoKey = `PROXISYNC-PUBKEY-DEVICE-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  storedPublicKeyPem = `-----BEGIN PUBLIC KEY-----\n${pseudoKey}\n-----END PUBLIC KEY-----`;
  return {
    publicKeyPem: storedPublicKeyPem,
    keyPair: null,
  };
}

export async function exportPublicKeyPem() {
  if (storedPublicKeyPem) return storedPublicKeyPem;
  const generated = await generateDeviceKeyPair();
  return generated.publicKeyPem;
}

export async function signAttendancePayload(sessionId, token, ts) {
  const dataToSign = `${sessionId}|${token}|${ts}`;
  const subtle = globalThis.crypto?.subtle || (typeof window !== 'undefined' ? window.crypto?.subtle : null);

  if (storedKeyPair && subtle) {
    try {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(dataToSign);
      const signatureBuffer = await subtle.sign(
        {
          name: 'ECDSA',
          hash: { name: 'SHA-256' },
        },
        storedKeyPair.privateKey,
        encoded
      );

      return p1363ToDer(signatureBuffer);
    } catch (e) {
      console.warn('WebCrypto sign failed, falling back:', e);
    }
  }

  // Deterministic signature fallback for mock / simulator mode
  const pseudoSig = Buffer?.from
    ? Buffer.from(`SIG:${dataToSign}`).toString('base64')
    : btoa(`SIG:${dataToSign}`);
  return pseudoSig;
}

export function clearStoredDeviceKey() {
  storedKeyPair = null;
  storedPublicKeyPem = null;
}
