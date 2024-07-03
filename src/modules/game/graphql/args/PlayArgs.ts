import { Field, ArgsType, registerEnumType } from '@nestjs/graphql';
import { CoinSide } from '@prisma/client';

@ArgsType()
export class PlayArgs {
  @Field()
  bet: number;

  @Field(() => CoinSide)
  side: CoinSide;
}

registerEnumType(CoinSide, {
  name: 'CoinSide',
});
