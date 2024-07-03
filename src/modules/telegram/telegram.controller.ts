import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram-bot')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  webhook(@Body() update: any): void {
    this.telegramService.handleUpdate(update);
  }
}
