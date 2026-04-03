import dotenv from 'dotenv';

dotenv.config();

const required = ['JWT_SECRET'] as const;
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
};
