import { Field, ObjectType } from '@nestjs/graphql';
import { CoinSide, Game } from '@prisma/client';
import { BetDto } from 'src/modules/bets/graphql/dto/Bet.dto';
import { UserDto } from 'src/modules/user/graphql/dto/User.dto';

@ObjectType()
export class CoinFlipGameDto {
  @Field()
  id: string;

  @Field()
  isWon: boolean;

  @Field()
  sideSelected: CoinSide;

  @Field()
  sideResult: CoinSide;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class GameDto extends CoinFlipGameDto {
  @Field()
  User: UserDto;

  @Field()
  bet: BetDto;
}

@ObjectType()
export class CoinFlipBetGameDto extends BetDto {
  @Field()
  game: CoinFlipGameDto;
}
