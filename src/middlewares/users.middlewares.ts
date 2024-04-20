import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { errorResponse, findUserById } from '../utils';

export const checkUserExistence = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.session;
    const existingUser = await findUserById(userId);
    req.body.user = existingUser;
    return next();
  } catch (error) {
    return errorResponse(
      res,
      (error as { message: string }).message,
      status.UNAUTHORIZED,
    );
  }
};
