import { Field, ObjectType } from '@nestjs/graphql';
import { LeaderBoardRewardDto } from './LeaderBoardReward.dto';
import { LeaderDto } from './Leader.dto';
import { LeaderBoardStatus } from '@prisma/client';

@ObjectType()
export class LeaderBoardDto {
  @Field()
  id: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  status: LeaderBoardStatus;

  @Field(() => [LeaderBoardRewardDto], { nullable: true })
  rewards: LeaderBoardRewardDto[];

  @Field(() => [LeaderDto], { nullable: true })
  leaders: LeaderDto[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
