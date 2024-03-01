import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const DB_URL = `http://localhost:${PORT}`;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_TOKEN_DURATION = process.env.JWT_TOKEN_DURATION!;
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS!);
