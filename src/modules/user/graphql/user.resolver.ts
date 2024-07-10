import { Context, Resolver, Query } from '@nestjs/graphql';
import { UserService } from '../user.service';
import { ContextCustomType } from 'src/common/graphql/context';
import { UserDto } from './dto/User.dto';
import { UserStatisticsDto } from './dto/UserStatistics.dto';
import { LeaderBoardService } from 'src/modules/board/board.service';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly leaderBoardService: LeaderBoardService,
  ) {}

  @Query(() => UserDto)
  getMe(@Context() { req: { user } }: ContextCustomType) {
    return user;
  }

  @Query(() => UserStatisticsDto)
  async getMyStatistics(@Context() { req: { user } }: ContextCustomType) {
    const actualLeaderBoard =
      await this.leaderBoardService.getActualLeaderBoard({ takeLeaders: 0 });
    return await this.userService.getUserStatistics(
      user.id,
      actualLeaderBoard?.id,
    );
  }
}
