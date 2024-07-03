import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LeaderDto {
  @Field()
  id: string;

  @Field({ nullable: true })
  username?: string;

  @Field()
  fullname: string;

  @Field()
  net_gains: number;

  @Field({ nullable: true })
  last_bet_created_at?: Date;
}
