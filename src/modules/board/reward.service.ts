import { Injectable } from '@nestjs/common';
import { LeaderBoardReward, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class LeaderBoardRewardService {
  constructor(private readonly prismaService: PrismaService) {}

  async createLeaderBoardReward(
    data: Prisma.LeaderBoardRewardCreateInput,
  ): Promise<LeaderBoardReward> {
    return this.prismaService.leaderBoardReward.create({
      data,
    });
  }

  async createLeaderBoardRewards(
    data: Prisma.LeaderBoardRewardCreateManyInput[],
  ) {
    return this.prismaService.leaderBoardReward.createMany({
      data,
    });
  }

  async updateLeaderBoardReward(params: {
    where: Prisma.LeaderBoardRewardWhereUniqueInput;
    data: Prisma.LeaderBoardRewardUpdateInput;
  }): Promise<LeaderBoardReward> {
    const { where, data } = params;
    return this.prismaService.leaderBoardReward.update({
      data,
      where,
    });
  }

  async upsertLeaderBoardReward(
    data: Prisma.LeaderBoardRewardUpsertArgs,
  ): Promise<LeaderBoardReward> {
    return this.prismaService.leaderBoardReward.upsert(data);
  }

  async deleteLeaderBoardReward(
    where: Prisma.LeaderBoardRewardWhereUniqueInput,
  ): Promise<LeaderBoardReward> {
    return this.prismaService.leaderBoardReward.delete({
      where,
    });
  }

  async deleteManyLeaderBoardReward(ids: string[]) {
    return this.prismaService.leaderBoardReward.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
