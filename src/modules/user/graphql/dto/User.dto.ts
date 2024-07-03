import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field()
  id: string;

  @Field()
  telegramId: string;

  @Field({ nullable: true })
  username?: string;

  @Field()
  fullname: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  balance: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
