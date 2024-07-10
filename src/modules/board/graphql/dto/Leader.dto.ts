import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/modules/user/graphql/dto/User.dto';

@ObjectType()
export class LeaderDto {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  amount: number;

  @Field()
  userId: string;

  @Field(() => UserDto, { nullable: true })
  user?: UserDto;

  @Field({ nullable: true })
  leaderBoardId: string;

  @Field({ nullable: true })
  rewardId: string;
}
