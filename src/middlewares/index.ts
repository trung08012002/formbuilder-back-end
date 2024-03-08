import {
  CreateFolderSchema,
  UpdateFolderSchema,
} from '../schemas/folders.schemas';
import { CreateFormSchema, UpdateFormSchema } from '../schemas/forms.schemas';
import {
  AddTeamMemberSchema,
  CreateTeamSchema,
  RemoveTeamMemberSchema,
  UpdateTeamSchema,
} from '../schemas/teams.schemas';
import {
  ChangePasswordSchema,
  LoginSchema,
  SignUpSchema,
  UpdateUserSchema,
} from '../schemas/users.schemas';

import { verifyToken } from './authorization.middlewares';
import { validateConfigSchema } from './forms.middlewares';
import { checkTeamExistence } from './teams.middlewares';
import { checkUserExistence } from './users.middlewares';
import { validate } from './validation.middlewares';

const validateSignUpInput = validate(SignUpSchema);
const validateLoginInput = validate(LoginSchema);

const validateChangePasswordInput = validate(ChangePasswordSchema);
const validateUpdateUserInput = validate(UpdateUserSchema);

const validateCreateFormSchema = validate(CreateFormSchema);
const validateUpdateFormSchema = validate(UpdateFormSchema);

const validateCreateFolderSchema = validate(CreateFolderSchema);
const validateUpdateFolderSchema = validate(UpdateFolderSchema);

const validateCreateTeamSchema = validate(CreateTeamSchema);
const validateUpdateTeamSchema = validate(UpdateTeamSchema);
const validateAddTeamMemberSchema = validate(AddTeamMemberSchema);
const validateRemoveTeamMemberSchema = validate(RemoveTeamMemberSchema);

export {
  checkTeamExistence,
  checkUserExistence,
  validateAddTeamMemberSchema,
  validateChangePasswordInput,
  validateConfigSchema,
  validateCreateFolderSchema,
  validateCreateFormSchema,
  validateCreateTeamSchema,
  validateLoginInput,
  validateRemoveTeamMemberSchema,
  validateSignUpInput,
  validateUpdateFolderSchema,
  validateUpdateFormSchema,
  validateUpdateTeamSchema,
  validateUpdateUserInput,
  verifyToken,
};
