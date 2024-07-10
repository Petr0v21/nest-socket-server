import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventType } from './eventType.enum';
import { AuthService } from '../auth/auth.service';
import { GameDto } from '../game/graphql/dto/Game.dto';
import { LeaderBoardDto } from '../board/graphql/dto/LeaderBoard.dto';

@Injectable()
@WebSocketGateway()
export class GatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger(GatewayService.name);
  activeClients: { socketId: string; userId: string }[] = [];

  constructor(
    private authService: AuthService,
    private eventEmitter: EventEmitter2,
  ) {}

  afterInit() {
    this.logger.log('Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
    this.activeClients = this.activeClients.filter(
      ({ socketId }) => socketId !== client.id,
    );
    this.wss.emit(
      'updateActiveClients',
      this.activeClients.length,
      this.activeClients,
    );
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const user = await this.authService.validateUserHash(
        client.handshake.query['key-token']?.toString(),
      );

      this.logger.log(`Client Connected: ${client.id}`);
      this.activeClients = this.activeClients.filter(
        ({ userId }) => userId !== user.id,
      );
      this.activeClients.push({
        socketId: client.id,
        userId: user.id,
      });
      this.eventEmitter.emit(EventType.UserConnected, client.id);
      this.wss.emit(EventType.UpdateActiveClients, {
        activeClients: this.activeClients.length,
      });
    } catch (err) {
      client.disconnect();
    }
  }

  emitCustomEvent(event: string, data: any): void {
    this.wss.emit(event, data);
  }

  @OnEvent(EventType.UpdateUserBalance)
  notificateUpdateUserBalance(payload: { id: string; balance: number }) {
    this.wss.emit(EventType.UpdateUserBalance + payload.id, payload);
  }

  @OnEvent(EventType.UpdateHistory)
  notificateUpdateHistory(payload: {
    games: GameDto[];
    ratioSides: [number, number];
  }) {
    this.wss.emit(EventType.UpdateHistory, payload);
  }

  @OnEvent(EventType.GiveHistoryToOneUser)
  giveHistoryToOneUser(payload: {
    clientId: string;
    games: GameDto[];
    ratioSides: [number, number];
  }) {
    this.wss.to(payload.clientId).emit(EventType.UpdateHistory, payload);
  }

  @OnEvent(EventType.PullActualLeaderBoard)
  pullLeaderBoard(payload: LeaderBoardDto) {
    this.wss.emit(EventType.UpdatedActualLeaderBoard, payload);
  }
}
