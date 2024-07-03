import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { GameService } from '../game.service';
import { PlayArgs } from './args/PlayArgs';
import { ContextCustomType } from 'src/common/graphql/context';
import { CoinFlipBetGameDto, GameDto } from './dto/Game.dto';
import { GetHistoryArgs } from './args/getHistoryArgs';
import { BadRequestException } from '@nestjs/common';
import { ActualDetailsDto } from './dto/Details.dto';

@Resolver()
export class GameResolver {
  MIN_BET = 0.05;
  MAX_BET = 200000;

  constructor(private readonly gameService: GameService) {}

  @Query(() => ActualDetailsDto)
  async getActualDetails() {
    return await this.gameService.getActualDetails();
  }

  @Mutation(() => CoinFlipBetGameDto)
  async play(
    @Args() { bet, side }: PlayArgs,
    @Context() { req: { user } }: ContextCustomType,
  ): Promise<CoinFlipBetGameDto> {
    if (bet < this.MIN_BET) {
      throw new BadRequestException('Bet must be more than 5');
    }
    if (bet > this.MAX_BET) {
      throw new BadRequestException('Bet must be less than 5');
    }
    if (user.balance < bet) {
      throw new BadRequestException('Bet is more than user balance');
    }
    return await this.gameService.placeBet({
      user,
      bet,
      side,
    });
  }
}
