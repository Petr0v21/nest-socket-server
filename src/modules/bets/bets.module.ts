import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsResolver } from './graphql/bets.resolver';
import { PrismaModule } from 'prisma/prisma.module';
import { ProvablyFairService } from './provably-fair.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [ProvablyFairService, BetsService, BetsResolver],
  exports: [ProvablyFairService, BetsService],
})
export class BetsModule {}
