import { z } from 'zod';

import { ERROR_MESSAGES } from '../constants';

const passwordRegex = /[!@#$%^&*(),.?":{}|<>]/; // Regex for special characters
const uppercaseRegex = /[A-Z]/; // Regex for uppercase letters
const lowercaseRegex = /[a-z]/; // Regex for lowercase letters

const emailValidation = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED_EMAIL })
  .trim()
  .min(1, ERROR_MESSAGES.NO_EMPTY_EMAIL)
  .email(ERROR_MESSAGES.INVALID_EMAIL);

const passwordValidation = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED_PASSWORD })
  .min(8, { message: ERROR_MESSAGES.REQUIRED_LONG_PASSWORD })
  .refine((value) => uppercaseRegex.test(value), {
    message: ERROR_MESSAGES.REQUIRED_UPPER_CASE_PASSWORD,
  })
  .refine((value) => lowercaseRegex.test(value), {
    message: ERROR_MESSAGES.REQUIRED_LOWER_CASE_PASSWORD,
  })
  .refine((value) => passwordRegex.test(value), {
    message: ERROR_MESSAGES.REQUIRED_SPECIAL_CHARS,
  });

export const SignUpSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
  username: z
    .string({ required_error: ERROR_MESSAGES.REQUIRED_USERNAME })
    .trim()
    .min(1, ERROR_MESSAGES.NO_EMPTY_USERNAME),
});

export const LoginSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
});

export const ChangePasswordSchema = z.object({
  currentPassword: passwordValidation,
  newPassword: passwordValidation,
});

export const UpdateUserSchema = z.object({
  email: emailValidation.optional(),
  username: z
    .string({ required_error: ERROR_MESSAGES.REQUIRED_USERNAME })
    .trim()
    .min(1, ERROR_MESSAGES.NO_EMPTY_USERNAME)
    .optional(),
  avatarUrl: z.string().optional(),
  organizationName: z.string().optional(),
  organizationLogo: z.string().optional(),
});

export default UpdateUserSchema;
