import { Injectable } from '@nestjs/common';
import { Leader, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { LeaderBoardService } from '../board/board.service';
import { EventType } from '../gateway/eventType.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class LeaderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly leaderBoardService: LeaderBoardService,
    private eventEmitter: EventEmitter2,
  ) {}

  async leaders(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LeaderWhereUniqueInput;
    where?: Prisma.LeaderWhereInput;
    orderBy?: Prisma.LeaderOrderByWithRelationInput;
  }): Promise<Leader[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prismaService.leader.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createLeader(data: Prisma.LeaderCreateInput): Promise<Leader> {
    return this.prismaService.leader.create({
      data,
    });
  }

  async upsertLeader(data: Prisma.LeaderUpsertArgs): Promise<Leader> {
    return this.prismaService.leader.upsert(data);
  }

  async updateLeader(params: {
    where: Prisma.LeaderWhereUniqueInput;
    data: Prisma.LeaderUpdateInput;
  }): Promise<Leader> {
    const { where, data } = params;
    return this.prismaService.leader.update({
      data,
      where,
    });
  }

  async deleteLeader(where: Prisma.LeaderWhereUniqueInput): Promise<Leader> {
    return this.prismaService.leader.delete({
      where,
    });
  }

  async deleteLeaders(where: Prisma.LeaderWhereInput) {
    return this.prismaService.leader.deleteMany({
      where,
    });
  }

  async getLeaderPlace(leaderBoardId: string, leaderAmount: number) {
    const leaderIndex = await this.prismaService.leader.count({
      where: {
        leaderBoardId,
        amount: {
          gt: leaderAmount,
        },
      },
    });
    return leaderIndex + 1;
  }

  @OnEvent(EventType.LeaderUpsertInActualLeaderBoard)
  async createOrUpdateLeaderInActualLeaderBoard(data: {
    userId: string;
    amount: number;
  }) {
    try {
      const actualLeaderBoard =
        await this.leaderBoardService.getActualLeaderBoard({ takeLeaders: 0 });

      if (!actualLeaderBoard) {
        return;
      }

      const existLeader = await this.prismaService.leader.findFirst({
        where: {
          leaderBoardId: actualLeaderBoard.id,
          userId: data.userId,
        },
      });

      const result = await this.upsertLeader({
        create: {
          amount: data.amount,
          leaderBoard: {
            connect: {
              id: actualLeaderBoard.id,
            },
          },
          user: {
            connect: {
              id: data.userId,
            },
          },
        },
        update: {
          amount: {
            increment: data.amount,
          },
        },
        where: {
          id: existLeader?.id ?? '',
        },
      });
      const leaderIndex = await this.getLeaderPlace(result.id, result.amount);
      if (leaderIndex <= 10) {
        this.eventEmitter.emit(EventType.GetActualLeaderBoard);
      }
    } catch (err) {
      console.error('createOrUpdateLeaderInActualLeaderBoard Error ', err);
    }
  }
}
