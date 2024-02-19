import { Router } from 'express'
import { login, signup } from '../controllers/auth.controllers'
import { validateLoginInput, validateSignUpInput } from '../middlewares'

const authRoute = Router()

authRoute.post('/signup', validateSignUpInput, signup)
authRoute.post('/login', validateLoginInput, login)

export default authRoute
