import { Field, ArgsType, InputType, registerEnumType } from '@nestjs/graphql';
import { LeaderBoardStatus } from '@prisma/client';

registerEnumType(LeaderBoardStatus, {
  name: 'LeaderBoardStatus',
});

@InputType()
export class CreateLeaderBoardRewardArgs {
  @Field()
  order: number;

  @Field()
  amount: number;
}

@ArgsType()
export class CreateLeaderBoardArgs {
  @Field(() => LeaderBoardStatus, { nullable: true })
  status?: LeaderBoardStatus;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field(() => [CreateLeaderBoardRewardArgs], { nullable: true })
  rewards?: CreateLeaderBoardRewardArgs[];
}
