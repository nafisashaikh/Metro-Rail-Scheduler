import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'metro_rail_scheduler',
});

try {
  const [tables] = await conn.query('SHOW TABLES');
  console.log('TABLES:', tables);

  const [users] = await conn.query(
    'SELECT id, login_type, is_verified, created_at FROM users ORDER BY created_at DESC LIMIT 10'
  );
  console.log('\nLATEST USERS:', users);

  const [verified] = await conn.query(
    'SELECT id, login_type, is_verified, created_at FROM users WHERE is_verified = TRUE ORDER BY created_at DESC LIMIT 1'
  );
  console.log('\nLATEST VERIFIED USER:', verified);

  if (verified.length > 0) {
    const [sessions] = await conn.query(
      'SELECT id, user_id, expires_at, created_at FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [verified[0].id]
    );
    console.log('\nSESSIONS FOR LATEST VERIFIED USER:', sessions);
  }

  const [otp] = await conn.query(
    'SELECT id, identifier, attempt_count, last_attempt, blocked_until FROM otp_attempts ORDER BY last_attempt DESC LIMIT 10'
  );
  console.log('\nLATEST OTP ATTEMPTS:', otp);
} finally {
  await conn.end();
}
