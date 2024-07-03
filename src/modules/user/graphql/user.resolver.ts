import { Context, Resolver, Query } from '@nestjs/graphql';
import { UserService } from '../user.service';
import { ContextCustomType } from 'src/common/graphql/context';
import { UserDto } from './dto/User.dto';
import { LeaderDto } from './dto/Leader.dto';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserDto)
  getMe(@Context() { req: { user } }: ContextCustomType) {
    return user;
  }

  @Query(() => [LeaderDto])
  async getLeaders() {
    return await this.userService.getLeaders();
  }
}
