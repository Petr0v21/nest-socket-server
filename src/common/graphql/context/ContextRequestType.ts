import { User } from '@prisma/client';
import { Request } from 'express';

export type ContextCustomRequestType = Request & {
  user: User;
};
