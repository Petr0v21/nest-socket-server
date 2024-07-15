import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Bet, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from '../user/user.service';

@Injectable()
export class BetsService {
  constructor(
    private prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createBet(data: Prisma.BetUncheckedCreateInput): Promise<Bet> {
    Logger.log({
      context: BetsService.name,
      message: 'Creating bet',
      data,
    });

    const bet = await this.prismaService.bet.create({ data });

    Logger.log({
      context: BetsService.name,
      message: 'Bet created',
      betId: bet.id,
    });

    return bet;
  }

  async updateBet(betId: string, data: Prisma.BetUpdateInput): Promise<Bet> {
    Logger.log({
      context: BetsService.name,
      message: 'Updating bet',
      data,
    });

    const bet = await this.prismaService.bet.update({
      where: { id: betId },
      data,
    });

    Logger.log({
      context: BetsService.name,
      message: 'Bet updated',
      betId: bet.id,
    });

    return bet;
  }

  async getBetCommission(amount: number, userId: string) {
    const percentHouse = process.env.PERCENT_HOUSE
      ? Number(process.env.PERCENT_HOUSE)
      : 0.05;
    const commission = amount * percentHouse;
    const checkBalance = await this.userService.checkBalance(
      amount + commission,
      userId,
    );
    if (!checkBalance) {
      throw new BadRequestException('Bet amount more than user balance!');
    }
    await this.userService.updateUser({
      where: {
        id: userId,
      },
      data: {
        balance: {
          decrement: commission,
        },
      },
    });
    return commission;
  }
}
