import { hashSync } from 'bcrypt';

import prisma from '../configs/db.config';
import { SALT_ROUNDS } from '../configs/secrets';
import type { UpdateUserInput } from '../types/users.types';

let instance: UsersService | null = null;

export const getUsersService = () => {
  if (!instance) {
    instance = new UsersService();
  }
  return instance;
};

export class UsersService {
  public getAllUsers = () => prisma.user.findMany();

  public getUserByID = (id: number) =>
    prisma.user.findUnique({
      where: {
        id,
      },
    });

  public delUserByID = (id: number) =>
    prisma.user.delete({
      where: {
        id,
      },
    });

  public changePassword = (id: number, password: string) =>
    prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashSync(password, SALT_ROUNDS),
        passwordChangedAt: new Date(Date.now()),
      },
    });

  public updateUserByID = (id: number, user: UpdateUserInput) =>
    prisma.user.update({
      where: {
        id,
      },
      data: {
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        organizationName: user.organizationName,
        organizationLogo: user.organizationLogo,
      },
    });
}
