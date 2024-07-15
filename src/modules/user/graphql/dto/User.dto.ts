import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { LigaEnum } from '@prisma/client';

registerEnumType(LigaEnum, {
  name: 'LigaEnum',
});

@ObjectType()
export class NextLevelDto {
  @Field()
  exp: number;

  @Field()
  level: number;

  @Field(() => LigaEnum)
  liga: LigaEnum;
}

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
  exp: number;

  @Field()
  level: number;

  @Field(() => LigaEnum)
  liga: LigaEnum;

  @Field(() => NextLevelDto, { nullable: true })
  nextLevel?: NextLevelDto;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
