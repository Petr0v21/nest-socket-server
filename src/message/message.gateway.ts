import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  activeClients: string[] = [];
  constructor() {}

  private logger: Logger = new Logger('MessageGateway');

  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
    this.activeClients = this.activeClients.filter((id) => id !== client.id);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected: ${client.id}`);
    this.activeClients.push(client.id);
    this.wss.emit(
      'updateActiveClients',
      this.activeClients.length,
      this.activeClients,
    );
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: string): Promise<void> {
    console.log(payload);
    this.wss.emit('receiveMessage', payload);
  }

  @SubscribeMessage('updateActiveClients')
  async updateActiveClients(client: Socket): Promise<void> {
    this.wss.emit(
      'updateActiveClients',
      this.activeClients.length,
      this.activeClients,
    );
  }
}
