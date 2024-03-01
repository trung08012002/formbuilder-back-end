import { User } from '@prisma/client';

export interface UpdateUserInput
  extends Pick<
    User,
    'username' | 'email' | 'avatarUrl' | 'organizationName' | 'organizationLogo'
  > {}
