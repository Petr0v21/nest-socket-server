import { Field, ObjectType } from '@nestjs/graphql';
import { RewardStatus } from '@prisma/client';

@ObjectType()
export class LeaderBoardRewardDto {
  @Field()
  id: string;

  @Field()
  order: number;

  @Field()
  amount: number;

  @Field(() => RewardStatus)
  status: RewardStatus;
}
