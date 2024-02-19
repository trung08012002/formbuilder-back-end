import { LoginSchema, SignUpSchema } from '../schemas/users.schemas'
import { verifyToken } from './authorization.middlewares'
import { validate } from './validation.middlewares'

const validateSignUpInput = validate(SignUpSchema)
const validateLoginInput = validate(LoginSchema)

export { verifyToken, validateSignUpInput, validateLoginInput }
