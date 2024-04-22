import { USER_ERROR_MESSAGES } from '../constants';
import { getUsersService, UsersService } from '../services/users.service';

const usersService: UsersService = getUsersService();

export const findUserById = async (userId: number) => {
  const existingUser = await usersService.getUserByID(userId);
  if (!existingUser) {
    throw new Error(USER_ERROR_MESSAGES.USER_NOT_FOUND);
  }
  return existingUser;
};
