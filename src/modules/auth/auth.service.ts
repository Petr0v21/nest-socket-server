import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HmacSHA256 } from 'crypto-js';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  validateTelegramHash(
    botToken: string,
    query: string,
  ): {
    status: boolean;
    userId?: string;
  } {
    const params = new URLSearchParams(query);
    const hash = params.get('hash');
    let userId: string | null = null;

    if (!hash) {
      return {
        status: false,
      };
    }
    params.delete('hash');

    const sortedParams = Array.from(params.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const dataCheckString = sortedParams
      .map(([key, value]) => {
        if (key === 'user') {
          const userObject = JSON.parse(value);
          userId = String(userObject.id);
        }
        return `${key}=${value}`;
      })
      .join('\n');

    const secretKey = HmacSHA256(botToken, 'WebAppData');
    const hmac = HmacSHA256(dataCheckString, secretKey).toString();

    return {
      status: hmac === hash,
      userId,
    };
  }

  async validateUserHash(query?: string) {
    if (!query) {
      throw new UnauthorizedException('Query not provided');
    }

    const validateStatus = this.validateTelegramHash(
      process.env.BOT_TOKEN,
      query,
    );

    if (!validateStatus.status) {
      throw new UnauthorizedException('Invalid provided Query');
    }

    const user = await this.userService.user(
      {
        telegramId: validateStatus.userId,
      },
      {},
    );

    if (!user) {
      throw new UnauthorizedException('This telegram user not exist in db');
    }
    return user;
  }
}
