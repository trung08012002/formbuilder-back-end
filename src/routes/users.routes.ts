import { Router } from 'express';

import { ROUTES } from '../constants';
import {
  getUsersController,
  UsersController,
} from '../controllers/users.controller';
import {
  validateChangePasswordInput,
  validateUpdateUserInput,
  verifyToken,
} from '../middlewares';

const usersRoute = Router();

const usersController: UsersController = getUsersController();

usersRoute.get(ROUTES.ROOT.PATH, verifyToken, usersController.getAllUsers);
usersRoute.get(
  ROUTES.USER.GET_USER_DETAILS,
  verifyToken,
  usersController.getUserByID,
);
usersRoute.delete(
  ROUTES.USER.DELETE_USER,
  verifyToken,
  usersController.delUserByID,
);
usersRoute.patch(
  ROUTES.USER.CHANGE_PASSWORD,
  verifyToken,
  validateChangePasswordInput,
  usersController.changePassword,
);
usersRoute.patch(
  ROUTES.USER.UPDATE_USER,
  verifyToken,
  validateUpdateUserInput,
  usersController.updateUserByID,
);

export default usersRoute;
