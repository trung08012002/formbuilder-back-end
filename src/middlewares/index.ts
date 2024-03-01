import {
  ChangePasswordSchema,
  LoginSchema,
  SignUpSchema,
  UpdateUserSchema,
} from '../schemas/users.schemas';

import { verifyToken } from './authorization.middlewares';
import { validate } from './validation.middlewares';

const validateSignUpInput = validate(SignUpSchema);
const validateLoginInput = validate(LoginSchema);
const validateChangePasswordInput = validate(ChangePasswordSchema);
const validateUpdateUserInput = validate(UpdateUserSchema);

export {
  validateChangePasswordInput,
  validateLoginInput,
  validateSignUpInput,
  validateUpdateUserInput,
  verifyToken,
};
