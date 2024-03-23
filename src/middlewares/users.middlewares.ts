import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { USER_ERROR_MESSAGES } from '../constants';
import { getUsersService, UsersService } from '../services/users.service';
import { errorResponse } from '../utils';

const usersService: UsersService = getUsersService();

export const checkUserExistence = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.session;

    const existingUser = await usersService.getUserByID(userId);

    if (!existingUser) {
      return errorResponse(
        res,
        USER_ERROR_MESSAGES.USER_NOT_FOUND,
        status.NOT_FOUND,
      );
    }

    req.body.user = existingUser;

    next();
  } catch (error) {
    return errorResponse(res);
  }
};
