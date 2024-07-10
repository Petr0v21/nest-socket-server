import { Module } from '@nestjs/common';
import { LeaderBoardService } from './board.service';
import { LeaderBoardResolver } from './graphql/board.resolver';
import { PrismaModule } from 'prisma/prisma.module';
import { LeaderBoardRewardService } from './reward.service';
import { LeaderService } from './leader.service';

@Module({
  imports: [PrismaModule],
  providers: [
    LeaderService,
    LeaderBoardService,
    LeaderBoardRewardService,
    LeaderBoardResolver,
  ],
  exports: [LeaderService, LeaderBoardService, LeaderBoardRewardService],
})
export class LeaderBoardModule {}
