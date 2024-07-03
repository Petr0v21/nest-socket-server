import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class GetHistoryArgs {
  @Field({ nullable: true, defaultValue: 20 })
  take?: number;

  @Field({ nullable: true, defaultValue: 0 })
  skip?: number;
}
