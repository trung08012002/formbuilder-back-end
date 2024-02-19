import prisma from '../configs/db.config'
import { hashSync } from 'bcrypt'
import { SALT_ROUNDS } from '../configs/secrets'

export const getUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: {
      email: email
    }
  })

export const checkExist = async (email: string) => {
  const existingUser = await getUserByEmail(email)

  return existingUser !== null
}

export const createUser = (email: string, password: string, username: string) =>
  prisma.user.create({
    data: {
      email,
      password: hashSync(password, SALT_ROUNDS),
      username
    }
  })
