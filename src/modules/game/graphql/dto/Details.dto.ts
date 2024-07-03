import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GameDto } from './Game.dto';

@ObjectType()
export class ActualDetailsDto {
  @Field(() => [GameDto])
  games: GameDto[];

  @Field(() => [Int])
  ratioSides: number[];
}
