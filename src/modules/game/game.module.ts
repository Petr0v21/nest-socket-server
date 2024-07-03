import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameResolver } from './graphql/game.resolver';
import { UserModule } from '../user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { BetsModule } from '../bets/bets.module';

@Module({
  imports: [UserModule, BetsModule, PrismaModule],
  providers: [GameService, GameResolver],
})
export class GameModule {}
