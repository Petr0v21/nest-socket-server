import { LigaEnum } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

export const generateServerSeed = (): string => {
  return randomBytes(32).toString('hex');
};

export const hashServerSeed = (serverSeed: string): string => {
  return createHash('sha256').update(serverSeed).digest('hex');
};

export const LEVEL_DETAILS: { exp: number; level: number; liga: LigaEnum }[] = [
  {
    exp: 0,
    liga: LigaEnum.BRONZE,
    level: 1,
  },
  {
    exp: 15,
    liga: LigaEnum.BRONZE,
    level: 2,
  },
  {
    exp: 30,
    liga: LigaEnum.BRONZE,
    level: 3,
  },
  {
    exp: 50,
    liga: LigaEnum.BRONZE,
    level: 4,
  },
  {
    exp: 80,
    liga: LigaEnum.SILVER,
    level: 1,
  },
  {
    exp: 150,
    liga: LigaEnum.SILVER,
    level: 2,
  },
  {
    exp: 210,
    liga: LigaEnum.SILVER,
    level: 3,
  },
  {
    exp: 280,
    liga: LigaEnum.SILVER,
    level: 4,
  },
  {
    exp: 340,
    liga: LigaEnum.GOLD,
    level: 1,
  },
  {
    exp: 420,
    liga: LigaEnum.GOLD,
    level: 2,
  },
  {
    exp: 520,
    liga: LigaEnum.GOLD,
    level: 3,
  },
  {
    exp: 640,
    liga: LigaEnum.GOLD,
    level: 4,
  },
  {
    exp: 780,
    liga: LigaEnum.PLATINUM,
    level: 1,
  },
  {
    exp: 940,
    liga: LigaEnum.PLATINUM,
    level: 2,
  },
  {
    exp: 1024,
    liga: LigaEnum.PLATINUM,
    level: 3,
  },
  {
    exp: 1200,
    liga: LigaEnum.PLATINUM,
    level: 4,
  },
  {
    exp: 1380,
    liga: LigaEnum.DIAMOND,
    level: 1,
  },
  {
    exp: 1560,
    liga: LigaEnum.DIAMOND,
    level: 2,
  },
  {
    exp: 1740,
    liga: LigaEnum.DIAMOND,
    level: 3,
  },
  {
    exp: 2000,
    liga: LigaEnum.DIAMOND,
    level: 4,
  },
];
