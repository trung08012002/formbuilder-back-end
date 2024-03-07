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
  ROUTES.USER.MY_PROFILE,
  verifyToken,
  usersController.getUserProfile,
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
  ROUTES.USER.MY_PROFILE,
  verifyToken,
  validateUpdateUserInput,
  usersController.updateUserProfile,
);

export default usersRoute;
