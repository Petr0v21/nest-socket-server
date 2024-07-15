import { Injectable } from '@nestjs/common';
import { LigaEnum, Prisma, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { EventType } from '../gateway/eventType.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LEVEL_DETAILS } from 'src/utils';
import { UserStatisticsDto } from './graphql/dto/UserStatistics.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    userRelation: Prisma.UserInclude,
  ): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: userWhereUniqueInput,
      include: userRelation,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prismaService.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({
      data,
    });
  }

  async upsertUser(data: Prisma.UserUpsertArgs): Promise<User> {
    return this.prismaService.user.upsert(data);
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prismaService.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prismaService.user.delete({
      where,
    });
  }

  async checkBalance(amountToCheck: number, userId: string) {
    const user = await this.user({ id: userId }, { games: true });
    return user && user.balance >= amountToCheck;
  }

  async updateBalance(
    amount: number,
    isRise: boolean,
    { id, balance, exp }: User,
  ) {
    const userLevelDetails = this.getUserLevel(exp + amount);
    await this.updateUser({
      where: {
        id: id,
      },
      data: {
        balance: isRise
          ? {
              increment: amount,
            }
          : {
              decrement: amount,
            },
        exp: {
          increment: amount,
        },
        level: userLevelDetails.currentLevelDetail.level,
        liga: userLevelDetails.currentLevelDetail.liga,
      },
    });
    this.eventEmitter.emit(EventType.UpdateUserBalance, {
      id,
      balance: isRise ? balance + amount : balance - amount,
      ...userLevelDetails.currentLevelDetail,
      nextLevel: userLevelDetails.nextLevelDetail,
      exp: exp + amount,
    });
  }

  getUserLevel(exp: number) {
    let currentLevelDetail = LEVEL_DETAILS[0];
    let nextLevelDetail = null;

    for (const levelDetail of LEVEL_DETAILS) {
      if (exp >= levelDetail.exp) {
        currentLevelDetail = levelDetail;
      } else {
        nextLevelDetail = levelDetail;
        break;
      }
    }

    return { currentLevelDetail, nextLevelDetail };
  }

  async getUserStatistics(userId: string, leaderBoardId?: string) {
    const result = (
      await this.prismaService.$queryRaw<UserStatisticsDto[]>`
      WITH LeaderboardRank AS (
        SELECT
          "userId",
          RANK() OVER (ORDER BY "amount" DESC) AS rank
        FROM "Leader"
        WHERE "leaderBoardId" = ${leaderBoardId}
      )
      SELECT
        (SELECT COUNT(*) FROM "Bet" WHERE "userId" = ${userId}) AS "totalBets",
        (SELECT COUNT(*) FROM "Bet" WHERE "userId" = ${userId} AND "payout" > 0) AS "winningBets",
        (SELECT COUNT(*) FROM "Game" WHERE "userId" = ${userId} AND "sideResult" = 'HEADS') AS "headsGames",
        (SELECT COUNT(*) FROM "Game" WHERE "userId" = ${userId} AND "sideResult" = 'TAILS') AS "tailsGames",
        (SELECT MAX("payout") FROM "Bet" WHERE "userId" = ${userId}) AS "highestPayout",
        (SELECT "rank" FROM LeaderboardRank WHERE "userId" = ${userId}) AS "leaderboardPlace"
    `
    )[0];

    return {
      totalBets: Number(result.totalBets),
      winningBets: Number(result.winningBets),
      headsGames: Number(result.headsGames),
      tailsGames: Number(result.tailsGames),
      highestPayout: result.highestPayout,
      leaderboardPlace: result.leaderboardPlace
        ? Number(result.leaderboardPlace)
        : undefined,
    };
  }
}
