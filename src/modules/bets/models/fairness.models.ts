import { ProvablyFairUserSeeds } from '@prisma/client';

export type PublicUserSeedInfo = Pick<
  ProvablyFairUserSeeds,
  'clientSeed' | 'nonce' | 'hashedServerSeed'
>;

export type PrivateUserSeedInfo = Pick<
  ProvablyFairUserSeeds,
  'clientSeed' | 'nonce' | 'serverSeed' | 'id'
>;
