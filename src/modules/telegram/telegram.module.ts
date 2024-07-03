import { DynamicModule, Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { Bot } from 'grammy';
import { TelegramController } from './telegram.controller';
import { UserModule } from '../user/user.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [UserModule, S3Module],
  providers: [TelegramService],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {
  static forRoot(token: string): DynamicModule {
    if (!token) {
      console.error('Bot Token EMPTY!');
      process.exit(1);
    }
    return {
      module: TelegramModule,
      providers: [
        {
          provide: 'BOT_TOKEN',
          useValue: token,
        },
        {
          provide: 'BOT',
          useValue: new Bot(token),
        },
        TelegramService,
      ],
      exports: [TelegramService],
    };
  }
}
