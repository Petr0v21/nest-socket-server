import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BetDto {
  @Field()
  id: string;

  @Field()
  amount: number;

  @Field()
  payout: number;
}
