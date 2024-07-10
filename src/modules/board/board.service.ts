import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { LeaderBoard, LeaderBoardStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { EventType } from '../gateway/eventType.enum';

@Injectable()
export class LeaderBoardService {
  constructor(
    private readonly prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Cron('0 * * * *')
  async handleCron() {
    //Handle LeaderBoard START/END -
    const now = new Date(new Date().setMilliseconds(0));

    const result = await this.prismaService.leaderBoard.findFirst({
      where: {
        OR: [
          {
            status: LeaderBoardStatus.ACTIVE,
            endDate: {
              lte: now,
              gt: new Date(new Date().setHours(now.getHours() - 1)),
            },
          },
          {
            status: LeaderBoardStatus.PENDING,
            endDate: {
              lte: now,
              gt: new Date(new Date().setHours(now.getHours() - 1)),
            },
          },
        ],
      },
    });
    if (result) {
      //TODO
      if (result.status === 'ACTIVE') {
        //CLOSING LEADER BOARD
      } else {
        //ACTIVATING LEADER BOARD
      }
    }
  }

  async getActualLeaderBoard(data: {
    takeLeaders?: number;
    skipLeaders?: number;
  }) {
    const result = await this.prismaService.leaderBoard.findFirst({
      where: {
        status: LeaderBoardStatus.ACTIVE,
        AND: [
          {
            startDate: {
              lte: new Date(),
            },
          },
          {
            endDate: {
              gte: new Date(),
            },
          },
        ],
      },
      include: {
        leaders: {
          orderBy: {
            amount: 'asc',
          },
          take: data.takeLeaders ?? 10,
          skip: data.skipLeaders ?? 0,
          include: {
            user: {
              select: {
                avatar: true,
                id: true,
                username: true,
                fullname: true,
              },
            },
          },
        },
        rewards: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    if (result.leaders &&
      (!data.skipLeaders || data.skipLeaders < result.rewards.length)) {
      result.leaders = result.leaders.map((item, index) => {
        return {
          ...item,
          rewardId: result.rewards[index + (data.skipLeaders ?? 0)]?.id,
        };
      });
    }
    return result;
  }

  @OnEvent(EventType.GetActualLeaderBoard)
  async getUpdatedLeaderBoard() {
    const actualLeaderBoard = await this.getActualLeaderBoard({});
    this.eventEmitter.emit(EventType.PullActualLeaderBoard, actualLeaderBoard);
  }

  async checkDateRangeLeaderBoard(startDate: Date, endDate: Date) {
    return await this.prismaService.leaderBoard.findFirst({
      where: {
        status: {
          not: LeaderBoardStatus.CLOSED,
        },
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
    });
  }

  async leaderBoard(id: string) {
    return this.prismaService.leaderBoard.findFirst({
      where: {
        id,
      },
      include: {
        rewards: true,
      },
    });
  }

  async leaderBoards(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LeaderBoardWhereUniqueInput;
    where?: Prisma.LeaderBoardWhereInput;
    orderBy?: Prisma.LeaderBoardOrderByWithRelationInput;
  }): Promise<LeaderBoard[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prismaService.leaderBoard.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createLeaderBoard(
    data: Prisma.LeaderBoardCreateInput,
  ): Promise<LeaderBoard> {
    return this.prismaService.leaderBoard.create({
      data,
    });
  }

  async updateLeaderBoard(params: {
    where: Prisma.LeaderBoardWhereUniqueInput;
    data: Prisma.LeaderBoardUpdateInput;
  }): Promise<LeaderBoard> {
    const { where, data } = params;
    return this.prismaService.leaderBoard.update({
      data,
      where,
    });
  }

  async deleteLeaderBoard(
    where: Prisma.LeaderBoardWhereUniqueInput,
  ): Promise<LeaderBoard> {
    return this.prismaService.leaderBoard.delete({
      where,
    });
  }
}
