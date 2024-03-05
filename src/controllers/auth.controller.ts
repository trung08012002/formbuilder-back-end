import { Request, Response } from 'express';
import status from 'http-status';

import {
  ERROR_MESSAGES,
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from '../constants';
import { AuthService, getAuthService } from '../services/auth.service';
import {
  comparePassword,
  createJWT,
  errorResponse,
  successResponse,
} from '../utils';

export class AuthController {
  private authService: AuthService;

  public constructor() {
    this.authService = getAuthService();
  }

  public signup = async (req: Request, res: Response) => {
    try {
      const { email, password, username } = req.body;
      const isExistedUser = await this.authService.checkExist(email);

      if (isExistedUser)
        return errorResponse(res, USER_ERROR_MESSAGES.USER_ALREADY_EXISTS);

      const newUser = await this.authService.createUser(
        email,
        password,
        username,
      );

      const payload = {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      };
      const token = createJWT(payload);

      const returnUser = {
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };

      return successResponse(
        res,
        { user: returnUser, token },
        USER_SUCCESS_MESSAGES.USER_CREATED,
      );
    } catch (error) {
      console.error('Error in signup:', error);
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await this.authService.getUserByEmail(email);

      if (!user) return errorResponse(res, USER_ERROR_MESSAGES.USER_NOT_FOUND);

      if (!comparePassword(password, user.password))
        return errorResponse(res, USER_ERROR_MESSAGES.INCORRECT_INFORMATION);

      const payload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };
      const token = createJWT(payload);

      const returnUser = {
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return successResponse(
        res,
        { user: returnUser, token },
        USER_SUCCESS_MESSAGES.LOGIN_SUCCESS,
      );
    } catch (error) {
      console.error('Error in login:', error);
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };
}

let instance: AuthController | null = null;

export const getAuthController = () => {
  if (!instance) {
    instance = new AuthController();
  }
  return instance;
};
