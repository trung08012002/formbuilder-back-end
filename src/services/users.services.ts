import { User } from '@prisma/client'
import prisma from '../configs/db.config'
import { SALT_ROUNDS } from '../configs/secrets'
import { hashSync } from 'bcrypt'

export const getAllUsers = () => prisma.user.findMany()

export const getUserByID = (id: number) =>
  prisma.user.findUnique({
    where: {
      id
    }
  })

export const delUserByID = (id: number) =>
  prisma.user.delete({
    where: {
      id
    }
  })

export const changePassword = (id: number, password: string) =>
  prisma.user.update({
    where: {
      id
    },
    data: {
      password: hashSync(password, SALT_ROUNDS),
      passwordChangedAt: new Date(Date.now())
    }
  })

export const updateUserByID = (id: number, user: User) =>
  prisma.user.update({
    where: {
      id
    },
    data: {
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      organizationName: user.organizationName,
      organizationLogo: user.organizationLogo
    }
  })
