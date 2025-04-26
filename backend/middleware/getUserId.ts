import { Request } from 'express';

export const getUserId = (req: Request): string => {
  const user = (req as any).user;
  if (!user || !user.id) {
    throw new Error('User ID not found in request.');
  }
  return user.id;
};
