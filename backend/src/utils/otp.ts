import { pool } from '../config/database.js';
import { encrypt } from './encryption.js';
import { RowDataPacket } from 'mysql2';

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 60;

/**
 * Generates a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Checks if an identifier (mobile/email) is rate limited
 */
export async function checkRateLimit(identifier: string): Promise<{
  allowed: boolean;
  attemptsRemaining?: number;
  blockedUntil?: Date;
}> {
  const encryptedIdentifier = encrypt(identifier);
  
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT attempt_count, last_attempt, blocked_until 
     FROM otp_attempts 
     WHERE identifier = ? AND blocked_until > NOW()`,
    [encryptedIdentifier]
  );

  if (rows.length > 0) {
    const row = rows[0];
    return {
      allowed: false,
      blockedUntil: new Date(row.blocked_until),
    };
  }

  // Check attempts in last hour
  const [attemptRows] = await pool.query<RowDataPacket[]>(
    `SELECT attempt_count, last_attempt 
     FROM otp_attempts 
     WHERE identifier = ? AND last_attempt > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
    [encryptedIdentifier]
  );

  if (attemptRows.length > 0) {
    const attemptCount = attemptRows[0].attempt_count;
    if (attemptCount >= MAX_OTP_ATTEMPTS) {
      // Block the user
      const blockedUntil = new Date(Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000);
      await pool.query(
        `UPDATE otp_attempts 
         SET blocked_until = ?, attempt_count = attempt_count + 1 
         WHERE identifier = ?`,
        [blockedUntil, encryptedIdentifier]
      );
      return {
        allowed: false,
        blockedUntil,
      };
    }
    return {
      allowed: true,
      attemptsRemaining: MAX_OTP_ATTEMPTS - attemptCount,
    };
  }

  return {
    allowed: true,
    attemptsRemaining: MAX_OTP_ATTEMPTS,
  };
}

/**
 * Records an OTP attempt
 */
export async function recordOTPAttempt(identifier: string): Promise<void> {
  const encryptedIdentifier = encrypt(identifier);
  
  await pool.query(
    `INSERT INTO otp_attempts (identifier, attempt_count, last_attempt) 
     VALUES (?, 1, NOW()) 
     ON DUPLICATE KEY UPDATE 
       attempt_count = attempt_count + 1, 
       last_attempt = NOW()`,
    [encryptedIdentifier]
  );
}

/**
 * Stores OTP for a user
 */
export async function storeOTP(
  userId: string,
  otp: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  
  await pool.query(
    `UPDATE users 
     SET otp_code = ?, otp_expires = ? 
     WHERE id = ?`,
    [otp, expiresAt, userId]
  );
}

/**
 * Verifies an OTP for a user
 */
export async function verifyOTP(
  userId: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT otp_code, otp_expires 
     FROM users 
     WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    return { success: false, message: 'User not found' };
  }

  const user = rows[0];
  
  if (!user.otp_code || !user.otp_expires) {
    return { success: false, message: 'No OTP found. Please request a new one.' };
  }

  if (new Date() > new Date(user.otp_expires)) {
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (user.otp_code !== otp) {
    return { success: false, message: 'Invalid OTP' };
  }

  // Mark user as verified and clear OTP
  await pool.query(
    `UPDATE users 
     SET is_verified = TRUE, otp_code = NULL, otp_expires = NULL 
     WHERE id = ?`,
    [userId]
  );

  return { success: true, message: 'OTP verified successfully' };
}

/**
 * Clears expired OTPs (can be run as a cleanup job)
 */
export async function clearExpiredOTPs(): Promise<void> {
  await pool.query(
    `UPDATE users 
     SET otp_code = NULL, otp_expires = NULL 
     WHERE otp_expires < NOW()`
  );
}

/**
 * Sends OTP via SMS or Email (placeholder - integrate with real service)
 */
export async function sendOTP(
  identifier: string,
  otp: string,
  type: 'mobile' | 'email'
): Promise<{ success: boolean; message: string }> {
  console.log(`📨 [${type.toUpperCase()} DEV OTP] ${identifier}: ${otp}`);
  return { success: true, message: 'OTP generated in development mode.' };
}
