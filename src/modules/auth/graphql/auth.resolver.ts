import { Resolver, Query, Args } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import { SuccessOutput } from 'src/common/graphql/output/SuccessOutput';
import { ValidateTelegramHashArgs } from './args/ValidateTelegramHashArgs';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => SuccessOutput)
  async validateTelegramHash(
    @Args() args: ValidateTelegramHashArgs,
  ): Promise<SuccessOutput> {
    const result = this.authService.validateTelegramHash(
      process.env.BOT_TOKEN,
      args.query,
    );
    return { success: result.status };
  }
}
