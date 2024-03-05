import {
  CreateFolderSchema,
  UpdateFolderSchema,
} from '../schemas/folders.schemas';
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

const validateCreateFolderSchema = validate(CreateFolderSchema);
const validateUpdateFolderSchema = validate(UpdateFolderSchema);

export {
  validateChangePasswordInput,
  validateConfigSchema,
  validateCreateFolderSchema,
  validateCreateFormSchema,
  validateLoginInput,
  validateSignUpInput,
  validateUpdateFolderSchema,
  validateUpdateFormSchema,
  validateUpdateUserInput,
  verifyToken,
};
