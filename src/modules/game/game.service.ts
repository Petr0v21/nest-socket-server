import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Game, User, CoinSide } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from '../user/user.service';
import { EventType } from '../gateway/eventType.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PlayArgs } from './graphql/args/PlayArgs';
import { CoinFlipBetGameDto, GameDto } from './graphql/dto/Game.dto';
import { ProvablyFairService } from '../bets/provably-fair.service';
import seedRandom from 'seedrandom';
import { BetsService } from '../bets/bets.service';
import { ActualDetailsDto } from './graphql/dto/Details.dto';

@Injectable()
export class GameService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly provablyFairService: ProvablyFairService,
    private readonly betsService: BetsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async game(
    gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
  ): Promise<Game | null> {
    return this.prismaService.game.findUnique({
      where: gameWhereUniqueInput,
      include: {
        User: true,
      },
    });
  }

  async games(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.GameWhereUniqueInput;
    where?: Prisma.GameWhereInput;
    orderBy?: Prisma.GameOrderByWithRelationInput;
  }): Promise<GameDto[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return (await this.prismaService.game.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        User: true,
        bet: true,
      },
    })) as GameDto[];
  }

  getCoinFlipResult(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ): CoinSide {
    const rng = seedRandom(`${serverSeed}:${clientSeed}:${nonce}`);
    return rng() < 0.25 ? CoinSide.HEADS : CoinSide.TAILS;
  }

  async getActualDetails(): Promise<ActualDetailsDto> {
    const lastGames = await this.games({
      orderBy: {
        createdAt: 'desc',
      },
      skip: 0,
      take: 100,
    });
    const heads = lastGames.filter(
      ({ sideResult }) => sideResult === 'HEADS',
    ).length;
    const headsPercent = Math.floor((heads * 100) / lastGames.length);
    return {
      games: lastGames.slice(0, 20),
      ratioSides: [headsPercent, 100 - headsPercent],
    };
  }

  async emitGamesHistoryWithStatistic() {
    this.eventEmitter.emit(
      EventType.UpdateHistory,
      await this.getActualDetails(),
    );
  }

  @OnEvent(EventType.UserConnected)
  async emitGamesHistoryWithStatisticToOneUser(clientId: string) {
    const payload = await this.getActualDetails();
    this.eventEmitter.emit(EventType.GiveHistoryToOneUser, {
      clientId,
      ...payload,
    });
  }

  async placeBet(args: PlayArgs & { user: User }): Promise<CoinFlipBetGameDto> {
    const seedInfo = await this.provablyFairService.getCurrentSeedPrivate(
      args.user,
    );
    if (!seedInfo) {
      throw new BadRequestException('Seed info not found');
    }

    const { serverSeed, clientSeed, nonce } = seedInfo;
    const coinFlipResult = this.getCoinFlipResult(
      serverSeed,
      clientSeed,
      nonce,
    );

    const isWon = coinFlipResult === args.side;

    const game = await this.prismaService.game.create({
      data: {
        userId: args.user.id,
        sideSelected: args.side,
        sideResult: coinFlipResult,
        isWon,
      },
      select: {
        id: true,
        isWon: true,
        sideSelected: true,
        sideResult: true,
      },
    });

    const bet = await this.betsService.createBet({
      amount: args.bet,
      gameId: game.id,
      settledAt: new Date(),
      payout: isWon ? args.bet : 0,
      userId: args.user.id,
    });

    await this.provablyFairService.incrementNonce(seedInfo.id);
    await this.userService.updateBalance(args.bet, isWon, args.user);
    await this.emitGamesHistoryWithStatistic();

    return {
      id: bet.id,
      amount: bet.amount,
      payout: bet.payout,
      game,
    };
  }
}
