import dotenv from 'dotenv';

dotenv.config();

const required = ['JWT_SECRET', 'ENCRYPTION_KEY'] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  encryptionKey: process.env.ENCRYPTION_KEY as string,
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'metro_rail_scheduler',
  },
};
