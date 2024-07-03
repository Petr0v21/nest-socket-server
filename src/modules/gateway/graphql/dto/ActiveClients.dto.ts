import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveClientsDto {
  @Field(() => Int)
  activeCliets: number;
}
