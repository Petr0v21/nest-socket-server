import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, ProvablyFairUserSeeds, User } from '@prisma/client';
import {
  PrivateUserSeedInfo,
  PublicUserSeedInfo,
} from './models/fairness.models';
import { generateServerSeed, hashServerSeed } from '../../utils';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProvablyFairService {
  constructor(private prisma: PrismaService) {}

  async getCurrentSeedPublic(user: User): Promise<PublicUserSeedInfo | null> {
    return this.getCurrentSeed(
      {
        clientSeed: true,
        hashedServerSeed: true,
        nonce: true,
      },
      user,
    );
  }

  async getCurrentSeedPrivate(user: User): Promise<PrivateUserSeedInfo | null> {
    return this.getCurrentSeed(
      {
        id: true,
        clientSeed: true,
        serverSeed: true,
        nonce: true,
      },
      user,
    );
  }

  private async getCurrentSeed(
    select: Prisma.ProvablyFairUserSeedsSelect,
    user: User,
  ): Promise<ProvablyFairUserSeeds> {
    const seed = await this.prisma.provablyFairUserSeeds.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      select,
    });
    if (!seed) {
      return await this.createSeed(user);
    }
    return seed as ProvablyFairUserSeeds;
  }

  private createSeed(user: User): Promise<ProvablyFairUserSeeds> {
    const serverSeed = generateServerSeed();
    return this.prisma.provablyFairUserSeeds.create({
      data: {
        userId: user.id,
        serverSeed,
        hashedServerSeed: hashServerSeed(serverSeed),
        clientSeed: generateServerSeed(),
      },
    });
  }

  async incrementNonce(seedId: string): Promise<void> {
    await this.prisma.provablyFairUserSeeds.update({
      where: {
        id: seedId,
      },
      data: {
        nonce: {
          increment: 1,
        },
      },
    });
  }

  async getSeedsHistory(user: User): Promise<ProvablyFairUserSeeds[]> {
    return this.prisma.provablyFairUserSeeds.findMany({
      where: {
        userId: user.id,
        isActive: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateClientSeed(
    user: User,
    clientSeed: string,
  ): Promise<PublicUserSeedInfo> {
    const activeBet = await this.prisma.bet.findFirst({
      where: {
        userId: user.id,
        settledAt: null,
      },
    });
    if (activeBet) {
      Logger.log({
        message: 'Attempt to update seed while active bet',
        userId: user.id,
        userUsername: user.username,
      });
      throw new BadRequestException('PROVABLY_FAIR_SEED_IS_IN_USE');
    }
    const currentSeed = await this.getCurrentSeedPublic(user);
    if (clientSeed === currentSeed?.clientSeed) return currentSeed;
    const serverSeed = generateServerSeed();
    const [_, newSeed] = await this.prisma.$transaction(async ($t) => [
      await $t.provablyFairUserSeeds.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          isActive: false,
        },
      }),
      await $t.provablyFairUserSeeds.create({
        data: {
          userId: user.id,
          serverSeed,
          hashedServerSeed: hashServerSeed(serverSeed),
          clientSeed,
        },
        select: {
          clientSeed: true,
          nonce: true,
          hashedServerSeed: true,
        },
      }),
    ]);
    return newSeed;
  }
}
