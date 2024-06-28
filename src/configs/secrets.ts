import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const DB_URL = `http://localhost:${PORT}`;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_TOKEN_DURATION = process.env.JWT_TOKEN_DURATION!;
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS!);
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
export const FRONT_END_URL =
  process.env.FRONT_END_URL || 'http://localhost:5000';
export const TYPE = process.env.TYPE || '';

export const PROJECT_ID = process.env.PROJECT_ID || '';
export const PRIVATE_KEY_ID = process.env.PRIVATE_KEY_ID || '';
export const PRIVATE_KEY =
  process.env.PRIVATE_KEY?.split(String.raw`\n`).join('\n') || '';
export const CLIENT_EMAIL = process.env.CLIENT_EMAIL || '';
export const CLIENT_ID = process.env.CLIENT_ID || '';
export const UNIVERSE_DOMAIN = process.env.UNIVERSE_DOMAIN || '';
