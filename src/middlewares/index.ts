import { CreateFormSchema, UpdateFormSchema } from '../schemas/forms.schemas';
import {
  ChangePasswordSchema,
  LoginSchema,
  SignUpSchema,
  UpdateUserSchema,
} from '../schemas/users.schemas';

import { verifyToken } from './authorization.middlewares';
import { validateConfigSchema } from './forms.middlewares';
import { validate } from './validation.middlewares';

const validateSignUpInput = validate(SignUpSchema);
const validateLoginInput = validate(LoginSchema);
const validateChangePasswordInput = validate(ChangePasswordSchema);
const validateUpdateUserInput = validate(UpdateUserSchema);
const validateCreateFormSchema = validate(CreateFormSchema);
const validateUpdateFormSchema = validate(UpdateFormSchema);

export {
  validateChangePasswordInput,
  validateConfigSchema,
  validateCreateFormSchema,
  validateLoginInput,
  validateSignUpInput,
  validateUpdateFormSchema,
  validateUpdateUserInput,
  verifyToken,
};
