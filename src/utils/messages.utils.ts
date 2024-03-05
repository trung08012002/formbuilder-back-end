import { Response } from 'express';
import { BAD_REQUEST, OK } from 'http-status';

export const successResponse = <T>(
  res: Response,
  data?: T,
  message?: string,
  status: number = OK,
) => res.status(status).json({ statusCode: status, message, data });

export const errorResponse = (
  res: Response,
  message: string,
  status: number = BAD_REQUEST,
) => res.status(status).json({ statusCode: status, message });
