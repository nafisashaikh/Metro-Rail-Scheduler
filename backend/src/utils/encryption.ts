import CryptoJS from 'crypto-js';
import { env } from '../config/env.js';

/**
 * Encrypts sensitive data using AES-256 encryption
 * @param text - Plain text to encrypt
 * @returns Encrypted string
 */
export function encrypt(text: string | number | null | undefined): string | null {
  if (text === null || text === undefined || text === '') {
    return null;
  }
  
  const textString = String(text);
  const encrypted = CryptoJS.AES.encrypt(textString, env.encryptionKey).toString();
  return encrypted;
}

/**
 * Decrypts encrypted data
 * @param encryptedText - Encrypted text to decrypt
 * @returns Decrypted string or null if decryption fails
 */
export function decrypt(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) {
    return null;
  }
  
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, env.encryptionKey);
    const plainText = decrypted.toString(CryptoJS.enc.Utf8);
    return plainText || null;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Encrypts user sensitive data for storage
 */
export function encryptUserData(data: {
  mobile?: string;
  email?: string;
  name: string;
  age?: number;
  gender?: string;
}) {
  return {
    mobile: data.mobile ? encrypt(data.mobile) : null,
    email: data.email ? encrypt(data.email) : null,
    name: encrypt(data.name),
    age: data.age ? encrypt(data.age) : null,
    gender: data.gender ? encrypt(data.gender) : null,
  };
}

/**
 * Decrypts user sensitive data for retrieval
 */
export function decryptUserData(encryptedData: {
  mobile?: string | null;
  email?: string | null;
  name: string;
  age?: string | null;
  gender?: string | null;
}) {
  return {
    mobile: encryptedData.mobile ? decrypt(encryptedData.mobile) : null,
    email: encryptedData.email ? decrypt(encryptedData.email) : null,
    name: decrypt(encryptedData.name) || '',
    age: encryptedData.age ? Number(decrypt(encryptedData.age)) : null,
    gender: encryptedData.gender ? decrypt(encryptedData.gender) : null,
  };
}
