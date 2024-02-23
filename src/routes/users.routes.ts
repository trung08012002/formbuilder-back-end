import { Router } from 'express'
import {
  changePasswordController,
  delUserByIDController,
  getAllUsersController,
  getUserByIDController,
  updateUserByIDController
} from '../controllers/users.controllers'
import { validateChangePasswordInput, validateUpdateUserInput, verifyToken } from '../middlewares'

const usersRoute = Router()

usersRoute.get('/', verifyToken, getAllUsersController)
usersRoute.get('/:id', verifyToken, getUserByIDController)
usersRoute.delete('/:id', verifyToken, delUserByIDController)
usersRoute.patch('/:id/change-password', verifyToken, validateChangePasswordInput, changePasswordController)
usersRoute.patch('/:id', verifyToken, validateUpdateUserInput, updateUserByIDController)

export default usersRoute
