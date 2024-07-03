import { Injectable, Logger } from '@nestjs/common';
import { Bet, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class BetsService {
  constructor(private prismaService: PrismaService) {}

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
}
