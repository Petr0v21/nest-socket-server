import { Field, ObjectType } from '@nestjs/graphql';
import { CoinFlipGameDto } from 'src/modules/game/graphql/dto/Game.dto';

@ObjectType()
export class BetDto {
  @Field()
  id: string;

  @Field()
  amount: number;

  @Field()
  payout: number;
}
