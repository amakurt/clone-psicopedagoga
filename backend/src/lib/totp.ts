import crypto from 'crypto';

// Alfabeto RFC 4648 Base32 para Google Authenticator
const RFC4648_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 20): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += RFC4648_ALPHABET[bytes[i] % 32];
  }
  return result;
}

export function base32ToBuffer(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = RFC4648_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTOTP(secretBase32: string, windowOffset = 0): string {
  const key = base32ToBuffer(secretBase32);
  const timeStep = 30; // 30 segundos conforme RFC 6238
  const counter = Math.floor(Date.now() / 1000 / timeStep) + windowOffset;
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuf);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

export function verifyTOTP(secretBase32: string, token: string): boolean {
  if (!secretBase32 || !token) return false;
  const cleanToken = token.trim().replace(/\s/g, '');
  if (cleanToken.length !== 6) return false;

  // Janela de tolerância: momento atual e +/- 1 janela (drift de até 30s)
  for (const offset of [0, -1, 1]) {
    if (generateTOTP(secretBase32, offset) === cleanToken) {
      return true;
    }
  }
  return false;
}

export function getOtpAuthUrl(secret: string, email: string, issuer = 'EduPsych Pro'): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
