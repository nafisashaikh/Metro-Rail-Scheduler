import crypto from 'node:crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string): { saltHex: string; hashHex: string } {
  const saltHex = crypto.randomBytes(16).toString('hex');
  const hashHex = crypto.scryptSync(password, saltHex, KEY_LENGTH).toString('hex');
  return { saltHex, hashHex };
}

export function verifyScryptPassword(password: string, saltHex: string, expectedHashHex: string): boolean {
  const derived = crypto.scryptSync(password, saltHex, KEY_LENGTH);
  const expected = Buffer.from(expectedHashHex, 'hex');

  if (derived.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(derived, expected);
}
