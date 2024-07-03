import { Resolver } from '@nestjs/graphql';
import { BetsService } from '../bets.service';

@Resolver()
export class BetsResolver {
  constructor(private readonly betsService: BetsService) {}
}
