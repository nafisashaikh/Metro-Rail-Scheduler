import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { encryptUserData, decryptUserData, encrypt } from '../utils/encryption.js';
import { generateOTP, checkRateLimit, recordOTPAttempt, storeOTP, verifyOTP, sendOTP } from '../utils/otp.js';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { randomUUID } from 'node:crypto';

export const usersRouter = Router();

// Validation schemas
const registerSchema = z.object({
  loginType: z.enum(['mobile', 'email']),
  mobile: z.string().min(10).max(15).optional(),
  countryCode: z.string().min(1).max(5).optional(),
  email: z.string().email().optional(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(1).max(150).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
}).refine(
  (data) => {
    if (data.loginType === 'mobile') {
      return data.mobile && data.countryCode;
    }
    return data.email;
  },
  { message: 'Mobile and country code are required for mobile login, email is required for email login' }
);

const verifyOTPSchema = z.object({
  userId: z.string().uuid(),
  otp: z.string().length(6),
});

const resendOTPSchema = z.object({
  userId: z.string().uuid(),
});

/**
 * POST /api/users/register
 * Register a new user with mobile or email
 */
usersRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    const identifier = validatedData.loginType === 'mobile' 
      ? `${validatedData.countryCode}${validatedData.mobile}`
      : validatedData.email!;

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(identifier);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Too many OTP attempts. Please try again after ${rateLimitCheck.blockedUntil?.toLocaleTimeString()}`,
        blockedUntil: rateLimitCheck.blockedUntil,
      });
    }

    // Check if user already exists
    const encryptedMobile = validatedData.mobile ? encrypt(validatedData.mobile) : null;
    const encryptedEmail = validatedData.email ? encrypt(validatedData.email) : null;
    
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      validatedData.loginType === 'mobile'
        ? 'SELECT id, is_verified FROM users WHERE mobile = ? AND country_code = ?'
        : 'SELECT id, is_verified FROM users WHERE email = ?',
      validatedData.loginType === 'mobile'
        ? [encryptedMobile, validatedData.countryCode]
        : [encryptedEmail]
    );

    let userId: string;
    
    if (existingUsers.length > 0) {
      // User exists, resend OTP
      userId = String(existingUsers[0].id);
      
      if (existingUsers[0].is_verified) {
        return res.status(400).json({
          success: false,
          message: 'User already registered and verified. Please login.',
        });
      }
    } else {
      // Create new user
      const encryptedData = encryptUserData({
        mobile: validatedData.mobile,
        email: validatedData.email,
        name: validatedData.name,
        age: validatedData.age,
        gender: validatedData.gender,
      });

      userId = randomUUID();

      await pool.query(
        `INSERT INTO users (id, mobile, country_code, email, name, age, gender, login_type, is_verified) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
        [
          userId,
          encryptedData.mobile,
          validatedData.countryCode || null,
          encryptedData.email,
          encryptedData.name,
          encryptedData.age,
          encryptedData.gender,
          validatedData.loginType,
        ]
      );
    }

    const otp = generateOTP();
    await storeOTP(userId, otp);
    await recordOTPAttempt(identifier);

    const otpResult = await sendOTP(identifier, otp, validatedData.loginType);

    if (!otpResult.success) {
      return res.status(502).json({
        success: false,
        message: otpResult.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. OTP generated in development mode.',
      userId,
      attemptsRemaining: rateLimitCheck.attemptsRemaining,
      otpSent: otpResult.success,
      ...(process.env.NODE_ENV === 'production' ? {} : { devOtp: otp }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/users/verify-otp
 * Verify OTP and complete registration
 */
usersRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const validatedData = verifyOTPSchema.parse(req.body);
    
    const result = await verifyOTP(validatedData.userId, validatedData.otp);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: validatedData.userId },
      env.jwtSecret as Secret,
      { expiresIn: env.jwtExpiresIn } as SignOptions
    );

    // Store session
    await pool.query(
      `INSERT INTO user_sessions (user_id, token, expires_at) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 8 HOUR))`,
      [validatedData.userId, token]
    );

    res.json({
      success: true,
      message: result.message,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/users/resend-otp
 * Resend OTP to user
 */
usersRouter.post('/resend-otp', async (req: Request, res: Response) => {
  try {
    const validatedData = resendOTPSchema.parse(req.body);
    
    // Get user details
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT mobile, country_code, email, login_type, is_verified FROM users WHERE id = ?',
      [validatedData.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = users[0];

    if (user.login_type === 'mobile') {
      return res.status(400).json({
        success: false,
        message: 'Mobile OTP resend is handled by the server.',
      });
    }
    
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'User already verified',
      });
    }

    const identifier = user.login_type === 'mobile'
      ? `${user.country_code}${user.mobile}`
      : user.email;

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(identifier);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Too many OTP attempts. Please try again after ${rateLimitCheck.blockedUntil?.toLocaleTimeString()}`,
        blockedUntil: rateLimitCheck.blockedUntil,
      });
    }

    // Generate and send new OTP
    const otp = generateOTP();
    await storeOTP(validatedData.userId, otp);
    await recordOTPAttempt(identifier);
    
    const otpResult = await sendOTP(identifier, otp, user.login_type);

    if (!otpResult.success) {
      return res.status(502).json({
        success: false,
        message: otpResult.message,
      });
    }

    res.json({
      success: true,
      message: 'OTP resent successfully',
      attemptsRemaining: rateLimitCheck.attemptsRemaining,
      otpSent: otpResult.success,
      ...(process.env.NODE_ENV === 'production' ? {} : { devOtp: otp }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * GET /api/users/profile
 * Get user profile (requires authentication)
 */
usersRouter.get('/profile', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, mobile, country_code, email, name, age, gender, login_type, created_at FROM users WHERE id = ? AND is_verified = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = users[0];
    const decryptedData = decryptUserData({
      mobile: user.mobile,
      email: user.email,
      name: user.name,
      age: user.age,
      gender: user.gender,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        mobile: decryptedData.mobile,
        countryCode: user.country_code,
        email: decryptedData.email,
        name: decryptedData.name,
        age: decryptedData.age,
        gender: decryptedData.gender,
        loginType: user.login_type,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile (requires authentication)
 */
usersRouter.put('/profile', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    
    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      age: z.number().int().min(1).max(150).optional(),
      gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
    });

    const validatedData = updateSchema.parse(req.body);
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (validatedData.name) {
      updates.push('name = ?');
      values.push(encrypt(validatedData.name));
    }
    if (validatedData.age) {
      updates.push('age = ?');
      values.push(encrypt(validatedData.age));
    }
    if (validatedData.gender) {
      updates.push('gender = ?');
      values.push(encrypt(validatedData.gender));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    values.push(decoded.userId);
    
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND is_verified = TRUE`,
      values
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});
