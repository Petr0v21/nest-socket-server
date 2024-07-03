import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserModule } from './modules/user/user.module';
import { UserService } from './modules/user/user.service';
import { TelegramService } from './modules/telegram/telegram.service';
import { TelegramModule } from './modules/telegram/telegram.module';
import { GameModule } from './modules/game/game.module';
import { AuthMiddleware } from './modules/auth/auth.middleware';
import { S3Module } from './modules/s3/s3.module';
import { AuthModule } from './modules/auth/auth.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BetsModule } from './modules/bets/bets.module';

@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: 'schema.gql',
      introspection: process.env.NODE_ENV === 'production' ? true : undefined,
    }),
    EventEmitterModule.forRoot(),
    S3Module,
    UserModule,
    BetsModule,
    GameModule,
    AuthModule,
    GatewayModule,
    TelegramModule.forRoot(process.env.BOT_TOKEN),
  ],
  providers: [UserService],
})
export class AppModule implements NestModule {
  constructor(private readonly telegramService: TelegramService) {
    this.telegramService.initWebhook(process.env.PUBLIC_URL + '/telegram-bot');
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
