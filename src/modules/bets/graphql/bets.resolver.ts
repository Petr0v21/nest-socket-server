import { Context, Query, Resolver } from '@nestjs/graphql';
import { BetsService } from '../bets.service';
import { ProvablyFairService } from '../provably-fair.service';
import { ContextCustomType } from 'src/common/graphql/context';
import { ProvablyFairDto } from './dto/ProvablyFair.dto';

@Resolver()
export class BetsResolver {
  constructor(
    private readonly betsService: BetsService,
    private readonly provablyFairService: ProvablyFairService,
  ) {}

  @Query(() => ProvablyFairDto, { nullable: true })
  async getCurrentSeeds(@Context() { req: { user } }: ContextCustomType) {
    return await this.provablyFairService.getCurrentSeedPrivate(user);
  }
}
