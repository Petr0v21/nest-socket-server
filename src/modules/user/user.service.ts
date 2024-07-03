import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { EventType } from '../gateway/eventType.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeaderDto } from './graphql/dto/Leader.dto';

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

  async updateBalance(amount: number, isRise: boolean, { id, balance }: User) {
    await this.updateUser({
      where: {
        id: id,
      },
      data: {
        balance: isRise ? balance + amount : balance - amount,
      },
    });
    this.eventEmitter.emit(EventType.UpdateUserBalance, {
      id,
      balance: isRise ? balance + amount : balance - amount,
    });
  }

  async getLeaders(): Promise<LeaderDto[]> {
    const result = await this.prismaService.$queryRaw<LeaderDto[]>`
      WITH UserNetGains AS (
        SELECT 
            u.id,
            u.username,
            u.fullname,
            COALESCE(SUM(CASE WHEN ub.payout = 0 THEN -ub.amount ELSE ub.payout END), 0) AS net_gains
        FROM 
            "User" u
        LEFT JOIN 
            "Bet" ub ON u.id = ub."userId"
        GROUP BY 
            u.id, u.username, u.fullname
      ),
      LastBets AS (
          SELECT DISTINCT ON (ub."userId")
              ub.id AS bet_id,
              ub."userId" AS user_id,
              ub.amount,
              ub.payout,
              ub."createdAt"
          FROM 
              "Bet" ub
          ORDER BY 
              ub."userId", ub."createdAt" DESC
      )
      SELECT 
          u.id,
          u.username,
          u.fullname,
          u.net_gains,
          lb."createdAt" AS last_bet_created_at
      FROM 
          UserNetGains u
      LEFT JOIN 
          LastBets lb ON u.id = lb.user_id
      ORDER BY 
          u.net_gains DESC
      LIMIT 20;
    `;
    return result;
  }
}
