import { Request, Response } from 'express';
import status from 'http-status';

import { CustomJwtPayload } from '@/types/jwtPayload.types';

import {
  ERROR_MESSAGES,
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from '../constants';
import { getUsersService, UsersService } from '../services/users.service';
import { comparePassword, errorResponse, successResponse } from '../utils';

export class UsersController {
  private usersService: UsersService;

  public constructor() {
    this.usersService = getUsersService();
  }

  public getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.usersService.getAllUsers();
      const returnUsers = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        organizationLogo: user.organizationLogo,
        organizationName: user.organizationName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return successResponse(
        res,
        returnUsers,
        USER_SUCCESS_MESSAGES.GET_LIST_USER,
        status.OK,
      );
    } catch (error) {
      console.error('Error in get list users:', error);
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public getUserProfile = async (req: Request, res: Response) => {
    try {
      const id = (req.session as CustomJwtPayload).userId;

      if (!id) return errorResponse(res, USER_ERROR_MESSAGES.REQUIRED_ID);

      const user = await this.usersService.getUserByID(Number(id));

      if (!user) return errorResponse(res, USER_ERROR_MESSAGES.USER_NOT_FOUND);

      const returnUser = {
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        organizationLogo: user.organizationLogo,
        organizationName: user.organizationName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return successResponse(
        res,
        returnUser,
        USER_SUCCESS_MESSAGES.GET_USER,
        status.OK,
      );
    } catch (error) {
      console.error('Error in get user by id:', error);
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public delUserByID = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) return errorResponse(res, USER_ERROR_MESSAGES.REQUIRED_ID);

      await this.usersService.delUserByID(Number(id));

      return successResponse(
        res,
        {},
        USER_SUCCESS_MESSAGES.DELETE_USER_SUCCESS,
        status.OK,
      );
    } catch (error) {
      console.error('Error in delete user:', error);
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public changePassword = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!id) return errorResponse(res, USER_ERROR_MESSAGES.REQUIRED_ID);

      const user = await this.usersService.getUserByID(Number(id));

      if (!user) return errorResponse(res, USER_ERROR_MESSAGES.USER_NOT_FOUND);

      if (!comparePassword(currentPassword, user.password))
        return errorResponse(res, USER_ERROR_MESSAGES.INCORRECT_PASSWORD);

      if (currentPassword === newPassword)
        return errorResponse(res, USER_ERROR_MESSAGES.DIFFERENT_PASSWORD);

      await this.usersService.changePassword(Number(id), newPassword);

      return successResponse(res, USER_SUCCESS_MESSAGES.CHANGE_PW_SUCCESS);
    } catch (error) {
      console.error('Error in change password of user:', error);
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };

  public updateUserByID = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { username, email, avatarUrl, organizationName, organizationLogo } =
        req.body;

      if (!id) return errorResponse(res, USER_ERROR_MESSAGES.REQUIRED_ID);

      await this.usersService.updateUserByID(Number(id), {
        username,
        email,
        avatarUrl,
        organizationName,
        organizationLogo,
      });

      return successResponse(res, {
        message: USER_SUCCESS_MESSAGES.UPDATE_USER_SUCCESS,
      });
    } catch (error) {
      console.error('Error in update user:', error);
      return errorResponse(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status.INTERNAL_SERVER_ERROR,
      );
    }
  };
}

let instance: UsersController | null = null;

export const getUsersController = () => {
  if (!instance) {
    instance = new UsersController();
  }
  return instance;
};
