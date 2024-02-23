import { LoginSchema, SignUpSchema, ChangePasswordSchema, UpdateUserSchema } from '../schemas/users.schemas'
import { verifyToken } from './authorization.middlewares'
import { validate } from './validation.middlewares'

const validateSignUpInput = validate(SignUpSchema)
const validateLoginInput = validate(LoginSchema)
const validateChangePasswordInput = validate(ChangePasswordSchema)
const validateUpdateUserInput = validate(UpdateUserSchema)

export { verifyToken, validateSignUpInput, validateLoginInput, validateChangePasswordInput, validateUpdateUserInput }
