import { Request, Response } from 'express'
import status from 'http-status'
import { comparePassword, createJWT, errorResponse, successResponse } from '../utils'
import { checkExist, createUser, getUserByEmail } from '../services/auth.services'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body
    const isExistedUser = await checkExist(email)

    if (isExistedUser) return errorResponse(res, ERROR_MESSAGES.USER_ALREADY_EXISTS)

    const newUser = await createUser(email, password, username)

    const payload = {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username
    }
    const token = createJWT(payload)

    const returnUser = {
      username: newUser.username,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }

    return successResponse(res, { user: returnUser, token }, SUCCESS_MESSAGES.USER_CREATED)
  } catch (error) {
    console.error('Error in signup:', error)
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, status.INTERNAL_SERVER_ERROR)
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await getUserByEmail(email)

    if (!user) return errorResponse(res, ERROR_MESSAGES.USER_NOT_FOUND)

    if (!comparePassword(password, user.password)) return errorResponse(res, ERROR_MESSAGES.INCORRECT_INFORMATION)

    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username
    }
    const token = createJWT(payload)

    const returnUser = {
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return successResponse(res, { user: returnUser, token }, SUCCESS_MESSAGES.LOGIN_SUCCESS)
  } catch (error) {
    console.error('Error in login:', error)
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, status.INTERNAL_SERVER_ERROR)
  }
}
