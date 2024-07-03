import { Inject, Injectable, Logger } from '@nestjs/common';
import { Api, Bot, Context, InlineKeyboard, RawApi } from 'grammy';
import { configuration } from './telegram.config';
import { UserService } from '../user/user.service';
import { S3Service } from '../s3/s3.service';
import { InlineKeyboardButton } from 'grammy/types';

@Injectable()
export class TelegramService {
  constructor(
    @Inject('BOT') private readonly bot: Bot<Context, Api<RawApi>>,
    @Inject('BOT_TOKEN') private readonly bot_token: string,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
  ) {
    configuration(this.bot);
    this.addListeners(bot);
  }

  private async getUserAvatar(ctx: Context): Promise<string | undefined> {
    try {
      const photo = (await ctx.getUserProfilePhotos()).photos[0][2];
      if (!photo) {
        return;
      }
      const photoFile = await this.bot.api.getFile(photo.file_id);

      const fileResponse = await fetch(
        `https://api.telegram.org/file/bot${this.bot_token}/${photoFile.file_path}`,
      ).then((res) => res.arrayBuffer());
      return await this.s3Service.uploadFile(
        Buffer.from(new Uint8Array(fileResponse)),
        ctx.from.id.toString(),
      );
    } catch (err) {
      console.error('GetUserAvatar ', err);
    }
  }

  inlineKeyboardBuilder(inline_keyboard_array: InlineKeyboardButton[][]) {
    return {
      reply_markup: {
        inline_keyboard: inline_keyboard_array,
      },
    };
  }

  addListeners(bot: Bot<Context, Api<RawApi>>) {
    const inlineKeyboardWebApp: InlineKeyboardButton[] = [
      {
        text: 'Play',
        web_app: {
          url: process.env.CLIENT_URL,
        },
      },
    ];
    const inlineKeyboardInfo: InlineKeyboardButton[] = [
      {
        text: 'info',
        callback_data: 'info',
      },
    ];

    bot.command('start', async (ctx) => {
      if (ctx.from.is_bot) {
        return;
      }
      const avatarKey = await this.getUserAvatar(ctx);
      const body = {
        username: ctx.from.username,
        fullname: `${ctx.from.first_name}${
          ctx.from.last_name ? ' ' + ctx.from.last_name : ''
        }`,
        avatar: process.env.S3_SOURCE_URL + avatarKey,
      };
      await this.userService.upsertUser({
        where: {
          telegramId: ctx.from.id.toString(),
        },
        create: {
          ...body,
          telegramId: ctx.from.id.toString(),
          balance: 100,
        },
        update: body,
      });

      return await ctx.reply(
        `Welcome to TEST BOT - telegram web app!`,
        this.inlineKeyboardBuilder([inlineKeyboardWebApp, inlineKeyboardInfo]),
      );
    });

    bot.command('info', (ctx) => ctx.reply('Info!'));

    bot.command('game', (ctx) =>
      ctx.reply('Game', this.inlineKeyboardBuilder([inlineKeyboardWebApp])),
    );

    bot.on('callback_query:data', async (ctx) => {
      if (ctx.callbackQuery.data === 'info') {
        await ctx.reply('Info');
      }
      return await ctx.answerCallbackQuery();
    });
  }

  initWebhook(url: string): void {
    this.bot.api.setWebhook(`${url}/webhook`);
    this.bot.init();
    Logger.log({
      context: TelegramService.name,
      message: 'Bot inited!!!',
    });
  }

  async handleUpdate(update: any): Promise<void> {
    await this.bot.handleUpdate(update);
  }
}
