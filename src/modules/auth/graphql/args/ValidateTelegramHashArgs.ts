import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class ValidateTelegramHashArgs {
  @Field()
  query: string;
}
