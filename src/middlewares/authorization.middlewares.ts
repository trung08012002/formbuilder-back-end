import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import * as jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../configs/secrets';
import { ERROR_MESSAGES } from '../constants';
import { errorResponse } from '../utils';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token =
    req.headers.authorization?.split(' ')[1] || req.headers.authorization;
  if (!token) {
    return errorResponse(
      res,
      ERROR_MESSAGES.NO_TOKEN_PROVIDED,
      status.UNAUTHORIZED,
    );
  }
  try {
    const claims = jwt.verify(token, JWT_SECRET);
    req.session = claims;
    next();
  } catch (err) {
    return errorResponse(
      res,
      ERROR_MESSAGES.INVALID_TOKEN,
      status.UNAUTHORIZED,
    );
  }
};
