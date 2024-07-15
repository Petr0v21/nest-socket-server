import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProvablyFairDto {
  @Field()
  id: string;

  @Field()
  clientSeed: string;

  @Field()
  serverSeed: string;

  @Field()
  nonce: number;
}
