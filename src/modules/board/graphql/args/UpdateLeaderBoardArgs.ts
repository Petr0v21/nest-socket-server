import {
  ArgsType,
  Field,
  PartialType,
  OmitType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  CreateLeaderBoardArgs,
  CreateLeaderBoardRewardArgs,
} from './CraeteLeaderBoardArgs';
import { RewardStatus } from '@prisma/client';

registerEnumType(RewardStatus, {
  name: 'RewardStatus',
});

@InputType()
export class UpdateLeaderBoardRewardArgs extends PartialType(
  CreateLeaderBoardRewardArgs,
) {
  @Field({ nullable: true })
  id?: string;

  @Field(() => RewardStatus, { nullable: true })
  status?: RewardStatus;

  @Field({ nullable: true })
  leaderId?: string;
}

@ArgsType()
export class UpdateLeaderBoardArgs extends PartialType(
  OmitType(CreateLeaderBoardArgs, ['rewards']),
) {
  @Field()
  id: string;

  @Field(() => [UpdateLeaderBoardRewardArgs], { nullable: true })
  rewards?: UpdateLeaderBoardRewardArgs[];
}
