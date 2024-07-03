import { createHash, randomBytes } from 'crypto';

export const generateServerSeed = (): string => {
  return randomBytes(32).toString('hex');
};

export const hashServerSeed = (serverSeed: string): string => {
  return createHash('sha256').update(serverSeed).digest('hex');
};
