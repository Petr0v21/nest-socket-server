import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './graphql/user.resolver';
import { PrismaModule } from 'prisma/prisma.module';
import { LeaderBoardModule } from '../board/board.module';

@Module({
  imports: [PrismaModule, LeaderBoardModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
