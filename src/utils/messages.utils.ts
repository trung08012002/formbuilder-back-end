import { Response } from 'express';
import { BAD_REQUEST, CREATED } from 'http-status';

export const successResponse = (
  res: Response,
  data?: unknown,
  message?: string,
  status: number = CREATED,
) => res.status(status).json({ data, message });

export const errorResponse = (
  res: Response,
  message: string,
  status: number = BAD_REQUEST,
) => res.status(status).json({ message });
