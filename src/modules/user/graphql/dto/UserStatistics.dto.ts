import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserStatisticsDto {
  @Field()
  totalBets: number;

  @Field()
  winningBets: number;

  @Field()
  headsGames: number;

  @Field()
  tailsGames: number;

  @Field()
  highestPayout: number;

  @Field({ nullable: true })
  leaderboardPlace?: number;
}
