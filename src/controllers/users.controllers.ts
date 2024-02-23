import { Request, Response } from 'express'
import status from 'http-status'
import { changePassword, delUserByID, getAllUsers, getUserByID, updateUserByID } from '../services/users.services'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import { comparePassword, errorResponse, successResponse } from '../utils'

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers()
    const returnUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    return successResponse(res, returnUsers, SUCCESS_MESSAGES.GET_LIST_USER, status.OK)
  } catch (error) {
    console.error('Error in get list users:', error)
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, status.INTERNAL_SERVER_ERROR)
  }
}

export const getUserByIDController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) return errorResponse(res, ERROR_MESSAGES.REQUIRED_ID)

    const user = await getUserByID(Number(id))

    if (!user) return errorResponse(res, ERROR_MESSAGES.USER_NOT_FOUND)

    const returnUser = {
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return successResponse(res, returnUser, SUCCESS_MESSAGES.GET_USER, status.OK)
  } catch (error) {
    console.error('Error in get user by id:', error)
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, status.INTERNAL_SERVER_ERROR)
  }
}

export const delUserByIDController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) return errorResponse(res, ERROR_MESSAGES.REQUIRED_ID)

    await delUserByID(Number(id))

    return successResponse(res, {}, SUCCESS_MESSAGES.DELETE_USER_SUCCESS, status.OK)
  } catch (error) {
    console.error('Error in delete user:', error)
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, status.INTERNAL_SERVER_ERROR)
  }
}

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    if (!id) return errorResponse(res, ERROR_MESSAGES.REQUIRED_ID)

    const user = await getUserByID(Number(id))

    if (!user) return errorResponse(res, ERROR_MESSAGES.USER_NOT_FOUND)

    if (!comparePassword(currentPassword, user.password)) return errorResponse(res, ERROR_MESSAGES.INCORRECT_PASSWORD)

    if (currentPassword === newPassword) return errorResponse(res, ERROR_MESSAGES.DIFFERENT_PASSWORD)

    await changePassword(Number(id), newPassword)

    return successResponse(res, SUCCESS_MESSAGES.CHANGE_PW_SUCCESS)
  } catch (error) {
    console.error('Error in change password of user:', error)
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, status.INTERNAL_SERVER_ERROR)
  }
}

export const updateUserByIDController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { username, email, avatarUrl, organizationName, organizationLogo } = req.body

    if (!id) return errorResponse(res, ERROR_MESSAGES.REQUIRED_ID)

    await updateUserByID(Number(id), { username, email, avatarUrl, organizationName, organizationLogo })

    return successResponse(res, { message: SUCCESS_MESSAGES.UPDATE_USER_SUCCESS })
  } catch (error) {
    console.error('Error in update user:', error)
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, status.INTERNAL_SERVER_ERROR)
  }
}
