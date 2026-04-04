import mysql from 'mysql2/promise';
import { env } from './env.js';

// MySQL connection pool configuration
export const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    // Create users table with encrypted fields
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        mobile VARCHAR(255) DEFAULT NULL COMMENT 'Encrypted mobile number',
        country_code VARCHAR(10) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL COMMENT 'Encrypted email address',
        name VARCHAR(255) NOT NULL COMMENT 'Encrypted name',
        age INT DEFAULT NULL COMMENT 'Encrypted age',
        gender VARCHAR(50) DEFAULT NULL COMMENT 'Encrypted gender',
        otp_code VARCHAR(10) DEFAULT NULL,
        otp_expires DATETIME DEFAULT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        login_type ENUM('mobile', 'email') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_mobile (mobile, country_code),
        UNIQUE KEY unique_email (email),
        INDEX idx_otp_expires (otp_expires),
        INDEX idx_is_verified (is_verified)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create OTP attempts tracking table for rate limiting
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otp_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL COMMENT 'Mobile or email (encrypted)',
        attempt_count INT DEFAULT 1,
        last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        blocked_until DATETIME DEFAULT NULL,
        INDEX idx_identifier (identifier),
        INDEX idx_blocked_until (blocked_until)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create user sessions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token (token),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Database schema initialization failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}
